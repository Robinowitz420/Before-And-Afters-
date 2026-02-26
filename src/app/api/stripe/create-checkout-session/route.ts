import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { stripe } from '@/lib/stripe'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { DEPOSIT_AMOUNT } from '@/lib/business-rules'

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') || (request.url.startsWith('https') ? 'https' : 'http')
  if (host) return `${proto}://${host}`
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function POST(request: NextRequest) {
  try {
    await auth.protect()
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses?.[0]?.emailAddress ?? undefined
    if (!email) {
      return NextResponse.json({ error: 'Email required for checkout' }, { status: 400 })
    }

    const body = await request.json()
    const tier = body?.tier as string | undefined
    if (!tier || !Object.keys(MEMBERSHIP_LEVELS).includes(tier)) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 })
    }

    const level = MEMBERSHIP_LEVELS[tier as MembershipTier]
    const firstMonthCents = Math.round(level.monthlyPrice * 100)
    const depositCents = Math.round(DEPOSIT_AMOUNT * 100)
    const baseUrl = getBaseUrl(request)

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
            unit_amount: firstMonthCents,
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
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe create-checkout-session error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
