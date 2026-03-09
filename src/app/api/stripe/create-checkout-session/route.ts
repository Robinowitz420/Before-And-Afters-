import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { DEPOSIT_AMOUNT } from '@/lib/business-rules'
import { getAdminFirestore } from '@/lib/firebase/admin'

const PROMO_CODE = 'FIRST70'
const PROMO_MAX_USES = 70
const PROMO_AMOUNT_OFF_CENTS = 5000
const PROMO_RESERVATION_MINUTES = 30

type PromoStatus = {
  eligible: boolean
  remaining: number
  amountOffCents: number
  reservationId?: string
}

async function getPromoStatus(params: { clerkUserId: string; email: string }): Promise<PromoStatus> {
  const db = getAdminFirestore()
  if (!db) {
    return { eligible: false, remaining: 0, amountOffCents: 0 }
  }

  const promoRef = db.collection('promotions').doc(PROMO_CODE)
  const redemptionsRef = promoRef.collection('redemptions')
  const userRedemptionRef = redemptionsRef.doc(params.clerkUserId)

  const now = new Date()
  const expiresAt = new Date(now.getTime() + PROMO_RESERVATION_MINUTES * 60 * 1000)

  const result = await db.runTransaction(async (tx) => {
    // Firestore transactions require all reads to happen before any writes.
    const promoSnap = await tx.get(promoRef)
    const redemptionSnap = await tx.get(userRedemptionRef)

    const promoData = promoSnap.exists ? (promoSnap.data() as any) : null

    const active = promoData?.active ?? true
    const maxUses = typeof promoData?.maxUses === 'number' ? promoData.maxUses : PROMO_MAX_USES
    const amountOffCents = typeof promoData?.amountOffCents === 'number' ? promoData.amountOffCents : PROMO_AMOUNT_OFF_CENTS
    const used = typeof promoData?.used === 'number' ? promoData.used : 0

    const remaining = Math.max(0, maxUses - used)
    const redemptionData = redemptionSnap.exists ? (redemptionSnap.data() as any) : null
    const status = redemptionData?.status as string | undefined

    // Initialize promo doc if missing (write happens after all reads above).
    if (!promoSnap.exists) {
      tx.set(promoRef, {
        code: PROMO_CODE,
        name: 'First 70 memberships – $50 off first month',
        maxUses,
        amountOffCents,
        used: 0,
        active: true,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
    }

    // One-per-person: if they've already reserved or redeemed, not eligible.
    if (redemptionSnap.exists && (status === 'reserved' || status === 'redeemed')) {
      return {
        eligible: false,
        remaining,
        amountOffCents: 0,
      } as PromoStatus
    }

    if (!active || remaining <= 0) {
      return {
        eligible: false,
        remaining,
        amountOffCents: 0,
      } as PromoStatus
    }

    // Reserve a slot immediately so we never exceed 70.
    const reservationId = userRedemptionRef.id
    tx.set(
      userRedemptionRef,
      {
        clerkUserId: params.clerkUserId,
        email: params.email,
        status: 'reserved',
        reservedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        updatedAt: now.toISOString(),
      },
      { merge: true }
    )
    tx.set(promoRef, { used: used + 1, updatedAt: now.toISOString() }, { merge: true })

    return {
      eligible: true,
      remaining: Math.max(0, remaining - 1),
      amountOffCents,
      reservationId,
    } as PromoStatus
  })

  return result
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http')
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is properly initialized
    const stripeKeyExists = !!process.env.STRIPE_SECRET_KEY
    const stripeKeyLength = process.env.STRIPE_SECRET_KEY?.length || 0
    console.log('Stripe checkout - Key exists:', stripeKeyExists, 'Key length:', stripeKeyLength)
    
    if (!stripeKeyExists) {
      console.error('STRIPE_SECRET_KEY is not set in environment variables')
      return NextResponse.json(
        { error: 'Payment service is not configured. Please contact support.' },
        { status: 500 }
      )
    }

    const authResult = await auth()
    const { userId } = authResult
    console.log('Stripe checkout - User ID:', userId ? 'Found' : 'Missing')
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? undefined
    console.log('Stripe checkout - Email:', email ? 'Found' : 'Missing')
    
    if (!email) {
      return NextResponse.json({ error: 'Email required for checkout' }, { status: 400 })
    }

    const body = await request.json()
    const tier = body?.tier as string | undefined
    const referralCodeRaw = body?.referralCode as string | null | undefined
    const referralCode = typeof referralCodeRaw === 'string' ? referralCodeRaw.trim() : ''
    console.log('Stripe checkout - Tier:', tier)
    
    if (!tier || !Object.keys(MEMBERSHIP_LEVELS).includes(tier)) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 })
    }

    const level = MEMBERSHIP_LEVELS[tier as MembershipTier]
    const firstMonthCents = Math.round(level.monthlyPrice * 100)
    const depositCents = Math.round(DEPOSIT_AMOUNT * 100)
    const baseUrl = getBaseUrl(request)

    const promo = await getPromoStatus({ clerkUserId: userId, email })
    const promoAmountOffCents = promo.eligible ? Math.min(promo.amountOffCents, firstMonthCents) : 0
    const discountedFirstMonthCents = firstMonthCents - promoAmountOffCents
    
    console.log('Stripe checkout - Creating session:', {
      tier,
      email,
      baseUrl,
      firstMonthCents,
      depositCents,
      promo: {
        canUsePromo: promo.eligible,
        remaining: promo.remaining,
        discountedFirstMonthCents,
        promoAmountOffCents,
      },
    })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${level.name.split(' - ')[0]} – First month`,
              description: level.name.split(' - ')[1] ?? undefined,
              images: undefined,
            },
            unit_amount: discountedFirstMonthCents,
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Membership deposit',
              description: '$25 deposit (refundable per terms)',
            },
            unit_amount: depositCents,
          },
        },
      ],
      success_url: `${baseUrl}/post-checkout?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/memberships?canceled=1`,
      metadata: {
        clerkUserId: userId,
        membershipTier: tier,
        ...(promo.reservationId ? { promoReservationId: promo.reservationId, promoCode: PROMO_CODE } : {}),
        ...(referralCode ? { referralCode } : {}),
      },
    })

    if (promo.reservationId) {
      const db = getAdminFirestore()
      if (db) {
        const promoRef = db.collection('promotions').doc(PROMO_CODE)
        await promoRef
          .collection('redemptions')
          .doc(promo.reservationId)
          .set({ stripeSessionId: session.id, updatedAt: new Date().toISOString() }, { merge: true })
      }
    }

    console.log('Stripe checkout - Session created:', session.id, 'URL:', session.url ? 'Valid' : 'Missing')

    if (!session.url) {
      console.error('Stripe session created but no URL returned:', session)
      return NextResponse.json(
        { error: 'Failed to create checkout URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: session.url,
      promo: {
        applied: promoAmountOffCents > 0,
        remaining: promo.remaining,
        amountOffCents: promoAmountOffCents,
        code: PROMO_CODE,
      },
    })
  } catch (error) {
    console.error('Stripe create-checkout-session error:', error)
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    if (error instanceof Error && error.stack) {
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
