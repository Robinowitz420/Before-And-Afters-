import { NextRequest, NextResponse } from 'next/server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'

export const runtime = 'nodejs'

function isValidTier(tier: any): tier is MembershipTier {
  return typeof tier === 'string' && Object.keys(MEMBERSHIP_LEVELS).includes(tier)
}

export async function POST(request: NextRequest) {
  try {
    await auth.protect()
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const sessionId = typeof body?.sessionId === 'string' ? body.sessionId.trim() : ''

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const clerkUser = await currentUser()
    const clerkEmail =
      clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || null

    if (!clerkEmail) {
      return NextResponse.json({ error: 'Missing email address' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const sessionClerkUserId = (session.metadata?.clerkUserId as string | undefined) || null
    if (sessionClerkUserId && sessionClerkUserId !== userId) {
      return NextResponse.json({ error: 'Session does not belong to current user' }, { status: 403 })
    }

    const tierRaw = session.metadata?.membershipTier
    if (!isValidTier(tierRaw)) {
      return NextResponse.json({ error: 'Missing or invalid membership tier' }, { status: 400 })
    }

    const membershipTier = tierRaw
    const level = MEMBERSHIP_LEVELS[membershipTier]

    const membershipStartDate = new Date()
    const membershipEndDate = new Date()
    membershipEndDate.setMonth(membershipEndDate.getMonth() + 1)

    let user = await prisma.user.findFirst({ where: { clerkUserId: userId } })
    if (!user) {
      user = await prisma.user.findUnique({ where: { email: clerkEmail.toLowerCase() } })
    }

    const membershipData = {
      membershipTier,
      membershipStartDate,
      membershipEndDate,
      maxItemsAllowed: level.maxItems,
      monthlyFreeGlitcoins: level.freeMonthlyGlitcoins,
    }

    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...membershipData,
          ...(user.clerkUserId ? {} : { clerkUserId: userId }),
        },
      })
    } else {
      const name = clerkUser?.fullName || clerkEmail.split('@')[0] || 'Member'
      user = await prisma.user.create({
        data: {
          email: clerkEmail.toLowerCase(),
          name,
          clerkUserId: userId,
          ...membershipData,
          glitcoinBalance: 0,
          depositPaid: false,
        },
      })
    }

    const existingTx = await prisma.glitcoinTransaction.findFirst({
      where: { reference: session.id, type: 'membership' },
      select: { id: true },
    })

    if (!existingTx) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: user.id,
          amount: -level.glitcoinValue,
          type: 'membership',
          description: `Initial ${membershipTier} membership payment (Stripe)` ,
          reference: session.id,
        },
      })

      if (level.freeMonthlyGlitcoins > 0) {
        await prisma.glitcoinTransaction.create({
          data: {
            userId: user.id,
            amount: level.freeMonthlyGlitcoins,
            type: 'bonus',
            description: `Monthly free Glitcoins for ${membershipTier} membership`,
            reference: session.id,
          },
        })
      }
    }

    return NextResponse.json({ ok: true, userId: user.id }, { status: 200 })
  } catch (error) {
    const maybeStatus = (error as any)?.status
    if (maybeStatus === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Stripe fulfill-session error:', error)
    return NextResponse.json({ error: 'Failed to fulfill session' }, { status: 500 })
  }
}
