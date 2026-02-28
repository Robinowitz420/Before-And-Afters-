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
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 401) {
          setError('Please sign in to join a membership.')
          return
        }
        setError((data as any)?.error || 'Could not start checkout. Please try again.')
        return
      }
      const url = (data as any)?.url
      if (!url || typeof url !== 'string') {
        console.error('Invalid checkout URL received:', data)
        setError('Invalid checkout URL. Please try again.')
        return
      }
      // Validate URL before redirect
      try {
        new URL(url)
      } catch (e) {
        console.error('Invalid URL format:', url)
        setError('Invalid checkout URL format. Please try again.')
        return
      }
      window.location.assign(url)
    } catch (e) {
      console.error('Checkout error:', e)
      setError('Something went wrong. Please try again.')
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
    <div className="relative left-1/2 w-screen -translate-x-1/2 px-0">
      {error && (
        <div className="mx-auto mb-6 max-w-6xl rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

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

      {/* MOBILE: Full-screen rotated */}
      <div className="md:hidden fixed inset-0 z-40">
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
          style={{ width: '100vh', height: '100vw' }}
        >
          <Image
            src={BASE_IMAGE_SRC}
            alt="Membership tiers"
            fill
            priority
            className="object-cover"
            sizes="100vh"
          />
        </div>

        {/* Single click zone for $100 membership */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90"
          style={{ width: '100vh', height: '100vw' }}
        >
          <button
            type="button"
            aria-label="Join Membership"
            className="absolute inset-0 cursor-pointer"
            onClick={() => {
              setSelectedTier(STRIPE_TIER_ID)
              openDisclaimerForTier(STRIPE_TIER_ID)
            }}
            disabled={checkoutTier !== null}
          />
        </div>

        {checkoutTier && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white z-50">
            Redirecting to checkout…
          </div>
        )}
      </div>

      {/* DESKTOP: Normal */}
      <div className="hidden md:block relative mx-auto w-full border-y border-[hsl(var(--border))] bg-black shadow-lg">
        <div className="flex items-center justify-center">
          <Image
            src={BASE_IMAGE_SRC}
            alt="Membership tiers"
            width={1024}
            height={576}
            priority
            className="h-auto w-full select-none object-contain"
          />
        </div>

        {/* Single click zone for $100 membership */}
        <div className="absolute inset-0">
          <button
            type="button"
            aria-label="Join Membership"
            className="absolute inset-0 focus:outline-none focus:ring-4 focus:ring-primary/40"
            onClick={() => {
              setSelectedTier(STRIPE_TIER_ID)
              openDisclaimerForTier(STRIPE_TIER_ID)
            }}
            disabled={checkoutTier !== null}
          />
        </div>

        {checkoutTier && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
            Redirecting to checkout…
          </div>
        )}
      </div>

      {selectedTier ? null : null}
    </div>
  )
}
