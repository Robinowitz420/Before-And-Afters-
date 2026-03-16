import { NextRequest, NextResponse } from 'next/server'

import { requireAdminOrThrow } from '@/lib/admin'
import { prisma } from '@/lib/prisma'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { getAdminFirestore } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

async function requireAdminOrSecret(request: NextRequest) {
  const sharedSecret = process.env.WARDROBE_MANAGER_ADMIN_SECRET
  const headerSecret = request.headers.get('x-wardrobe-admin-secret')
  if (sharedSecret && headerSecret && headerSecret === sharedSecret) {
    return { mode: 'secret' as const }
  }

  await requireAdminOrThrow()
  return { mode: 'clerk' as const }
}

function isValidTier(tier: any): tier is MembershipTier {
  return typeof tier === 'string' && Object.keys(MEMBERSHIP_LEVELS).includes(tier)
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSecret(request)

    const url = new URL(request.url)
    const emailRaw = url.searchParams.get('email')
    const clerkUserIdRaw = url.searchParams.get('clerkUserId')

    if ((!emailRaw || !emailRaw.trim()) && (!clerkUserIdRaw || !clerkUserIdRaw.trim())) {
      return NextResponse.json({ error: 'Missing email or clerkUserId' }, { status: 400 })
    }

    const email = emailRaw?.trim().toLowerCase() || null
    const clerkUserId = clerkUserIdRaw?.trim() || null

    // Try to find by email first, then by clerkUserId
    let user = null
    if (email) {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          name: true,
          displayName: true,
          phone: true,
          membershipTier: true,
          membershipStartDate: true,
          membershipEndDate: true,
          maxItemsAllowed: true,
          monthlyFreeGlitcoins: true,
          depositPaid: true,
          updatedAt: true,
          createdAt: true,
        },
      })
    }

    if (!user && clerkUserId) {
      user = await prisma.user.findFirst({
        where: { clerkUserId },
        select: {
          id: true,
          clerkUserId: true,
          email: true,
          name: true,
          displayName: true,
          phone: true,
          membershipTier: true,
          membershipStartDate: true,
          membershipEndDate: true,
          maxItemsAllowed: true,
          monthlyFreeGlitcoins: true,
          depositPaid: true,
          updatedAt: true,
          createdAt: true,
        },
      })
    }

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Admin memberships GET error:', error)
    return NextResponse.json({ error: 'Failed to lookup user' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authz = await requireAdminOrSecret(request)
    const { user, userEmail } = authz.mode === 'clerk' ? await requireAdminOrThrow() : { user: null, userEmail: 'wardrobe-manager2' }

    const body = await request.json().catch(() => ({}))
    const emailRaw = typeof body?.email === 'string' ? body.email : ''
    const membershipTier = body?.membershipTier
    const startDate = parseDate(body?.membershipStartDate)
    const endDate = parseDate(body?.membershipEndDate)
    const note = typeof body?.note === 'string' ? body.note.trim() : ''
    const depositPaid = typeof body?.depositPaid === 'boolean' ? body.depositPaid : undefined

    if (!emailRaw.trim()) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    }

    if (!isValidTier(membershipTier)) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 })
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Invalid membership start/end date' }, { status: 400 })
    }

    if (endDate.getTime() <= startDate.getTime()) {
      return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
    }

    const email = emailRaw.trim().toLowerCase()
    const level = MEMBERSHIP_LEVELS[membershipTier]

    // Also accept clerkUserId from body for creating new users
    const clerkUserId = typeof body?.clerkUserId === 'string' ? body.clerkUserId.trim() : null
    const name = typeof body?.name === 'string' ? body.name.trim() : null

    // Find existing user by email or clerkUserId
    let existing = await prisma.user.findUnique({ where: { email } })
    if (!existing && clerkUserId) {
      existing = await prisma.user.findFirst({ where: { clerkUserId } })
    }

    let updated
    if (existing) {
      updated = await prisma.user.update({
        where: { id: existing.id },
        data: {
          membershipTier,
          membershipStartDate: startDate,
          membershipEndDate: endDate,
          maxItemsAllowed: level.maxItems,
          monthlyFreeGlitcoins: level.freeMonthlyGlitcoins,
          ...(clerkUserId && !existing.clerkUserId ? { clerkUserId } : {}),
        },
      })
    } else {
      // Create new user if not found (for cash payments / manual entry)
      updated = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0] || 'Member',
          clerkUserId: clerkUserId || null,
          membershipTier,
          membershipStartDate: startDate,
          membershipEndDate: endDate,
          maxItemsAllowed: level.maxItems,
          monthlyFreeGlitcoins: level.freeMonthlyGlitcoins,
          depositPaid: true,
          glitcoinBalance: 0,
        },
      })
    }

    await prisma.glitcoinTransaction.create({
      data: {
        userId: updated.id,
        amount: -level.glitcoinValue,
        type: 'membership',
        description: `Membership updated by admin (cash): ${membershipTier}${note ? ` — ${note}` : ''}`,
      },
    })

    if (level.freeMonthlyGlitcoins > 0) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: updated.id,
          amount: level.freeMonthlyGlitcoins,
          type: 'bonus',
          description: `Monthly free Glitcoins for ${membershipTier} membership (admin cash update)`,
        },
      })
    }

    try {
      const db = getAdminFirestore()
      if (db) {
        await db.collection('admin_membership_updates').add({
          email,
          userId: updated.id,
          clerkUserId: updated.clerkUserId || null,
          membershipTier,
          membershipStartDate: startDate.toISOString(),
          membershipEndDate: endDate.toISOString(),
          maxItemsAllowed: level.maxItems,
          monthlyFreeGlitcoins: level.freeMonthlyGlitcoins,
          depositPaid: updated.depositPaid,
          note: note || null,
          updatedBy: userEmail,
          updatedByClerkUserId: (user as any)?.id || null,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (e) {
      console.error('Failed to write admin_membership_updates audit log:', e)
    }

    return NextResponse.json({ ok: true, user: updated }, { status: 200 })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prismaCode = (error as any)?.code
    if (prismaCode === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.error('Admin memberships POST error:', error)
    return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 })
  }
}
