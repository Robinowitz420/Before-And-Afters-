import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { DEPOSIT_GLITCOIN } from '@/lib/business-rules'
import { getAdminFirestore } from '@/lib/firebase/admin'

const PROMO_CODE = 'FIRST70'

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
    const promoReservationId = session.metadata?.promoReservationId as string | undefined
    const promoCode = session.metadata?.promoCode as string | undefined
    const referralCodeRaw = session.metadata?.referralCode as string | undefined
    const referralCode = typeof referralCodeRaw === 'string' ? referralCodeRaw.trim() : ''
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

    if (promoReservationId && promoCode === PROMO_CODE) {
      try {
        const db = getAdminFirestore()
        if (!db) {
          throw new Error('Firestore unavailable')
        }

        await db
          .collection('promotions')
          .doc(PROMO_CODE)
          .collection('redemptions')
          .doc(promoReservationId)
          .set(
            {
              status: 'redeemed',
              redeemedAt: new Date().toISOString(),
              stripeSessionId: session.id,
              email,
              clerkUserId: clerkUserId ?? null,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          )
      } catch (error) {
        console.error('Failed to finalize promo redemption (Stripe webhook):', error)
      }
    }

    if (referralCode && clerkUserId) {
      try {
        const db = getAdminFirestore()

        if (!db) {
          throw new Error('Firestore unavailable')
        }

        await db.collection('referrals').add({
          employeeCode: referralCode,
          clerkUserId,
          memberEmail: email,
          source: 'stripe_checkout',
          createdAt: new Date().toISOString(),
        })

        await db.collection('members').doc(clerkUserId).set(
          {
            referredByEmployeeCode: referralCode,
            referredAt: new Date().toISOString(),
          },
          { merge: true }
        )

        // Forward referral conversion to wardrobe-manager2
        const referralSecret = process.env.REFERRAL_CONVERSION_SECRET
        if (referralSecret) {
          await fetch('https://wardrobe-manager2.vercel.app/api/referrals/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-referral-secret': referralSecret,
            },
            body: JSON.stringify({
              referralCode: referralCode.toUpperCase(),
              stripeEventId: event.id,
              stripeCheckoutSessionId: session.id,
              amountTotal: session.amount_total,
              currency: session.currency,
              customerEmail: email,
              membershipPlan: membershipTier,
            }),
          })
        } else {
          console.warn('REFERRAL_CONVERSION_SECRET not set; skipping wardrobe-manager2 referral conversion')
        }
      } catch (error) {
        console.error('Failed to write referral attribution (Stripe webhook):', error)
      }
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
