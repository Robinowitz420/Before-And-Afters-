import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  console.warn('Missing STRIPE_SECRET_KEY in environment - Stripe features will be unavailable')
}

/** Server-side Stripe instance. Use only in API routes or server code. */
export const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  typescript: true,
}) : null as unknown as Stripe
