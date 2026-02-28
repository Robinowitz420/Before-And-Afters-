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
    console.log('Stripe checkout - Tier:', tier)
    
    if (!tier || !Object.keys(MEMBERSHIP_LEVELS).includes(tier)) {
      return NextResponse.json({ error: 'Invalid membership tier' }, { status: 400 })
    }

    const level = MEMBERSHIP_LEVELS[tier as MembershipTier]
    const firstMonthCents = Math.round(level.monthlyPrice * 100)
    const depositCents = Math.round(DEPOSIT_AMOUNT * 100)
    const baseUrl = getBaseUrl(request)
    
    console.log('Stripe checkout - Creating session:', { tier, email, baseUrl, firstMonthCents, depositCents })

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

    console.log('Stripe checkout - Session created:', session.id, 'URL:', session.url ? 'Valid' : 'Missing')

    if (!session.url) {
      console.error('Stripe session created but no URL returned:', session)
      return NextResponse.json(
        { error: 'Failed to create checkout URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: session.url })
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
