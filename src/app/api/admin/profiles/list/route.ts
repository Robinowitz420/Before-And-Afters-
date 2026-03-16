import { NextRequest, NextResponse } from 'next/server'

import { requireAdminOrThrow } from '@/lib/admin'
import { getAdminFirestore } from '@/lib/firebase/admin'
import { prisma } from '@/lib/prisma'

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

function parseLimit(raw: string | null) {
  const n = raw ? Number(raw) : 0
  if (!Number.isFinite(n) || n <= 0) return 200
  return Math.min(2000, Math.floor(n))
}

type ProfileListRow = {
  id: string
  clerkUserId: string
  displayName: string | null
  email: string | null
  membershipTier: string | null
  membershipEndDate: string | null
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSecret(request)

    const url = new URL(request.url)
    const limit = parseLimit(url.searchParams.get('limit'))

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore unavailable' }, { status: 500 })
    }

    const snap = await db.collection('profiles').limit(limit).get()

    const rawRows: Array<{
      id: string
      clerkUserId: string
      displayName: string | null
      email: string | null
    }> = snap.docs.map((doc) => {
      const raw = doc.data() as any
      const data = raw?.data && typeof raw.data === 'object' ? (raw.data as any) : {}

      const displayName =
        (typeof data.displayName === 'string' && data.displayName.trim()) ||
        (typeof data.fullName === 'string' && data.fullName.trim()) ||
        (typeof data.nickname === 'string' && data.nickname.trim()) ||
        null

      const email = typeof data.email === 'string' && data.email.trim() ? data.email.trim() : null

      return {
        id: doc.id,
        clerkUserId: String(raw?.clerkUserId || doc.id),
        displayName,
        email,
      }
    })

    // Collect unique emails and clerkUserIds to look up memberships
    const emails = Array.from(new Set(rawRows.map((r) => r.email).filter(Boolean))) as string[]
    const clerkUserIds = Array.from(new Set(rawRows.map((r) => r.clerkUserId).filter(Boolean))) as string[]

    // Debug: check if hughes.khalil@gmail.com is in profiles
    const hughesProfile = rawRows.find(r => r.email?.toLowerCase() === 'hughes.khalil@gmail.com')
    console.log('DEBUG: hughes.khalil@gmail.com profile found:', !!hughesProfile, hughesProfile)
    console.log('DEBUG: All emails being looked up:', emails)
    console.log('DEBUG: All clerkUserIds being looked up:', clerkUserIds)

    // Look up Prisma users by email or clerkUserId
    const prismaUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { in: emails } },
          { clerkUserId: { in: clerkUserIds } },
        ],
      },
      select: {
        id: true,
        email: true,
        clerkUserId: true,
        membershipTier: true,
        membershipEndDate: true,
      },
    })

    console.log('DEBUG: Prisma users found:', prismaUsers.length, prismaUsers.map(u => ({ email: u.email, clerkUserId: u.clerkUserId, tier: u.membershipTier })))

    // Build lookup maps
    const byEmail = new Map<string, typeof prismaUsers[0]>()
    const byClerkUserId = new Map<string, typeof prismaUsers[0]>()
    for (const u of prismaUsers) {
      if (u.email) byEmail.set(u.email.toLowerCase(), u)
      if (u.clerkUserId) byClerkUserId.set(u.clerkUserId, u)
    }

    // Join profiles with membership info
    const rows: ProfileListRow[] = rawRows.map((r) => {
      const membership = byEmail.get((r.email || '').toLowerCase()) || byClerkUserId.get(r.clerkUserId)
      return {
        id: r.id,
        clerkUserId: r.clerkUserId,
        displayName: r.displayName,
        email: r.email,
        membershipTier: membership?.membershipTier ?? null,
        membershipEndDate: membership?.membershipEndDate?.toISOString() ?? null,
      }
    })

    rows.sort((a, b) => {
      const an = (a.displayName || a.email || a.clerkUserId).toLowerCase()
      const bn = (b.displayName || b.email || b.clerkUserId).toLowerCase()
      if (an < bn) return -1
      if (an > bn) return 1
      return 0
    })

    return NextResponse.json({ users: rows, nextCursor: null }, { status: 200 })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Admin profiles list error:', error)
    return NextResponse.json({ error: 'Failed to list profiles' }, { status: 500 })
  }
}
