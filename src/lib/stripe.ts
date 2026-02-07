import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('Missing STRIPE_SECRET_KEY in environment')
}

/** Server-side Stripe instance. Use only in API routes or server code. */
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
})
