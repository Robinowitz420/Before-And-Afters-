'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

const BASE_IMAGE_SRC =
  '/images/Membership%20Images/Backgrounds/Website%20Page%20Breakdown%20(USE%20THIS)%20(1)/1.png'

export default function InteractiveMembershipList() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false)
  const [pendingTier, setPendingTier] = useState<string | null>(null)

  const STRIPE_TIER_ID = 'Oooohs'

  const membershipDisclaimer = `Membership Agreement & Disclaimer
Please read carefully before completing your purchase.

By purchasing a Before & Afters membership, you acknowledge and agree to the following:

Financial Responsibility

You are financially responsible for any borrowed items that are not returned, damaged beyond normal wear, or lost while in your possession.
Replacement costs will be charged to your payment method on file based on the item’s current resale value.
Continued failure to return items may result in membership suspension or termination and potential legal action.

Health & Safety

You use all clothing, accessories, makeup, and beauty products at your own risk.
Before & Afters is not responsible for any allergic reactions, skin sensitivities, or health issues that may arise from use of shared clothing, cosmetics, or hygiene products.
If you have known allergies or sensitivities, please take appropriate precautions before using any shared items.
All items are cleaned according to our standard protocols, but we cannot guarantee they will be suitable for individuals with specific sensitivities.

General Liability

You participate in all Before & Afters activities, events, and services at your own risk.
Before & Afters, its owners, staff, and affiliates are not liable for any injuries, losses, damages, or adverse reactions that may occur while using our services, facilities, or borrowed items.
Photography and media taken at Before & Afters events or facilities may be used for promotional purposes unless you explicitly opt out.

Membership Terms

Memberships are billed monthly and renew automatically until canceled.
You may cancel at any time, but no refunds will be issued for partial months.
All borrowed items must be returned before cancellation is finalized.
`

  const redirectToStripeCheckout = async (tier: string) => {
    setCheckoutTier(tier)
    setError(null)
    try {
      console.log('Creating checkout session for tier:', tier)
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      console.log('Checkout session response status:', res.status)
      
      const data = await res.json().catch((e) => {
        console.error('Failed to parse response:', e)
        return {}
      })
      console.log('Checkout session response data:', data)
      
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to join a membership.')
          return
        }
        const errorMsg = (data as any)?.error || `Server error (${res.status}). Please try again.`
        console.error('Checkout error:', errorMsg)
        setError(errorMsg)
        return
      }
      
      const url = (data as any)?.url
      if (!url || typeof url !== 'string') {
        console.error('Invalid checkout URL received:', data)
        setError('Invalid checkout URL received from server.')
        return
      }
      
      console.log('Redirecting to Stripe checkout:', url)
      window.location.assign(url)
    } catch (e) {
      console.error('Checkout error:', e)
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
    } finally {
      setCheckoutTier(null)
    }
  }

  const openDisclaimerForTier = (tier: string) => {
    setPendingTier(tier)
    setDisclaimerAgreed(false)
    setDisclaimerOpen(true)
  }

  return (
    <div className="relative h-[100svh] w-screen overflow-hidden bg-black">
      {error && (
        <div className="absolute left-1/2 top-4 z-[60] w-[min(92vw,56rem)] -translate-x-1/2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="absolute inset-0">
        <Image
          src={BASE_IMAGE_SRC}
          alt="Membership"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-black/10" />

      <div className="absolute inset-0 z-40 flex items-center justify-center px-4">
        <div className="flex w-full max-w-sm flex-col items-center">
          <Button
            type="button"
            size="lg"
            className="w-full rounded-full bg-black/80 text-white hover:bg-black border border-white/25"
            onClick={() => {
              setSelectedTier(STRIPE_TIER_ID)
              openDisclaimerForTier(STRIPE_TIER_ID)
            }}
            disabled={checkoutTier !== null}
          >
            Join here
          </Button>

          <div className="mt-4 flex flex-col items-center gap-2">
            <div className="text-2xl leading-none text-white drop-shadow">↑</div>
            <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-black shadow">
              Its a button! Click it!
            </div>
          </div>

          {checkoutTier ? (
            <div className="mt-6 w-full rounded-2xl bg-black/60 px-4 py-3 text-center text-sm text-white">
              Redirecting to checkout…
            </div>
          ) : null}
        </div>
      </div>

      {disclaimerOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-10">
          <div className="w-full max-w-3xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Membership Agreement</div>
            <div className="mt-2 text-xl font-semibold text-[hsl(var(--ink))]">Membership Agreement & Disclaimer</div>
            <div className="mt-4 max-h-[40vh] overflow-auto whitespace-pre-wrap rounded-xl border border-[hsl(var(--border))] bg-white/60 p-4 text-sm leading-relaxed text-[hsl(var(--ink))]">
              {membershipDisclaimer}
            </div>

            <label className="mt-4 flex items-start gap-3 text-sm text-[hsl(var(--ink))]">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4"
                checked={disclaimerAgreed}
                onChange={(e) => setDisclaimerAgreed(e.target.checked)}
              />
              <span>I agree to the Membership Agreement & Disclaimer</span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setDisclaimerOpen(false)
                  setPendingTier(null)
                }}
                disabled={checkoutTier !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!pendingTier) return
                  setDisclaimerOpen(false)
                  await redirectToStripeCheckout(pendingTier)
                }}
                disabled={!disclaimerAgreed || pendingTier === null || checkoutTier !== null}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
