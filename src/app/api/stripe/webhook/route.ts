import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { DEPOSIT_GLITCOIN } from '@/lib/business-rules'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
if (!webhookSecret) {
  console.warn('STRIPE_WEBHOOK_SECRET is not set; webhook signature verification will fail')
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    if (event.type !== 'checkout.session.completed') {
      return NextResponse.json({ received: true })
    }

    const session = event.data.object as Stripe.Checkout.Session
    const clerkUserId = session.metadata?.clerkUserId as string | undefined
    const membershipTier = session.metadata?.membershipTier as string | undefined
    const email = session.customer_details?.email ?? session.customer_email ?? null

    if (!membershipTier || !Object.keys(MEMBERSHIP_LEVELS).includes(membershipTier)) {
      console.error('Webhook: invalid or missing membershipTier in metadata', session.metadata)
      return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 })
    }

    if (!email) {
      console.error('Webhook: no customer email on session', session.id)
      return NextResponse.json({ error: 'Missing customer email' }, { status: 400 })
    }

    const level = MEMBERSHIP_LEVELS[membershipTier as MembershipTier]
    const membershipStartDate = new Date()
    const membershipEndDate = new Date()
    membershipEndDate.setMonth(membershipEndDate.getMonth() + 1)

    let user = clerkUserId
      ? await prisma.user.findFirst({ where: { clerkUserId } })
      : null
    if (!user) {
      user = await prisma.user.findUnique({ where: { email } })
    }

    const membershipData = {
      membershipTier,
      membershipStartDate,
      membershipEndDate,
      maxItemsAllowed: level.maxItems,
      monthlyFreeGlitcoins: level.freeMonthlyGlitcoins,
      depositPaid: true,
    }

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...membershipData,
          ...(clerkUserId && !user.clerkUserId ? { clerkUserId } : {}),
        },
      })
    } else {
      const name = session.customer_details?.name ?? email.split('@')[0] ?? 'Member'
      user = await prisma.user.create({
        data: {
          email,
          name,
          clerkUserId: clerkUserId ?? null,
          ...membershipData,
          glitcoinBalance: 0,
        },
      })
    }

    await prisma.glitcoinTransaction.create({
      data: {
        userId: user.id,
        amount: -level.glitcoinValue,
        type: 'membership',
        description: `Initial ${membershipTier} membership payment (Stripe)`,
      },
    })

    await prisma.glitcoinTransaction.create({
      data: {
        userId: user.id,
        amount: -DEPOSIT_GLITCOIN,
        type: 'fee',
        description: 'Membership deposit payment (Stripe)',
      },
    })

    if (level.freeMonthlyGlitcoins > 0) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: user.id,
          amount: level.freeMonthlyGlitcoins,
          type: 'bonus',
          description: `Monthly free Glitcoins for ${membershipTier} membership`,
        },
      })
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
