'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'

const BASE_IMAGE_SRC = '/images/Membership Images/DeliNotSelected.jpg'

const SELECTED_IMAGE_SRC: Record<MembershipTier, string> = {
  Eeeehs: '/images/Membership Images/EeeehsSelected.jpg',
  Oooohs: '/images/Membership Images/OooohsSelected.jpg',
  Aaaaahs: '/images/Membership Images/AaaagsSelected.jpg',
  Mmmmms: '/images/Membership Images/MmmmsSelected.jpg',
}

export default function InteractiveMembershipList() {
  const [hoveredTier, setHoveredTier] = useState<MembershipTier | null>(null)
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null)
  const [checkoutTier, setCheckoutTier] = useState<MembershipTier | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false)
  const [pendingTier, setPendingTier] = useState<MembershipTier | null>(null)

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

  const redirectToStripeCheckout = async (tier: MembershipTier) => {
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
        setError((data as any)?.error || 'Could not start checkout')
        return
      }
      if ((data as any)?.url) {
        window.location.href = (data as any).url as string
        return
      }
      setError('Invalid response from server')
    } catch (e) {
      console.error(e)
      setError('Something went wrong. Please try again.')
    } finally {
      setCheckoutTier(null)
    }
  }

  const openDisclaimerForTier = (tier: MembershipTier) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-10">
          <div className="w-full max-w-3xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-2xl">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Membership Agreement</div>
            <div className="mt-2 text-xl font-semibold text-[hsl(var(--ink))]">Membership Agreement & Disclaimer</div>
            <div className="mt-4 max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-xl border border-[hsl(var(--border))] bg-white/60 p-4 text-sm leading-relaxed text-[hsl(var(--ink))]">
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
                onClick={() => {
                  if (!pendingTier) return
                  setDisclaimerOpen(false)
                  redirectToStripeCheckout(pendingTier)
                }}
                disabled={!disclaimerAgreed || pendingTier === null || checkoutTier !== null}
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="relative mx-auto w-full border-y border-[hsl(var(--border))] bg-black shadow-lg">
        <Image
          src={hoveredTier ? SELECTED_IMAGE_SRC[hoveredTier] : BASE_IMAGE_SRC}
          alt="Membership tiers"
          width={1024}
          height={576}
          priority
          className="h-auto w-full select-none object-contain"
        />

        {/* Clickable quadrants */}
        <div className="absolute inset-0">
          {/* Top-left: Eeeehs */}
          <button
            type="button"
            aria-label={MEMBERSHIP_LEVELS.Eeeehs.name}
            className="absolute left-0 top-0 h-1/2 w-1/2 focus:outline-none focus:ring-4 focus:ring-primary/40"
            onMouseEnter={() => setHoveredTier('Eeeehs')}
            onMouseLeave={() => setHoveredTier(null)}
            onClick={() => {
              if (selectedTier === 'Eeeehs') {
                openDisclaimerForTier('Eeeehs')
                return
              }
              setSelectedTier('Eeeehs')
              setHoveredTier('Eeeehs')
            }}
            disabled={checkoutTier !== null}
          />

          {/* Top-right: Oooohs */}
          <button
            type="button"
            aria-label={MEMBERSHIP_LEVELS.Oooohs.name}
            className="absolute right-0 top-0 h-1/2 w-1/2 focus:outline-none focus:ring-4 focus:ring-primary/40"
            onMouseEnter={() => setHoveredTier('Oooohs')}
            onMouseLeave={() => setHoveredTier(null)}
            onClick={() => {
              if (selectedTier === 'Oooohs') {
                openDisclaimerForTier('Oooohs')
                return
              }
              setSelectedTier('Oooohs')
              setHoveredTier('Oooohs')
            }}
            disabled={checkoutTier !== null}
          />

          {/* Bottom-left: Aaaaahs */}
          <button
            type="button"
            aria-label={MEMBERSHIP_LEVELS.Aaaaahs.name}
            className="absolute left-0 bottom-0 h-1/2 w-1/2 focus:outline-none focus:ring-4 focus:ring-primary/40"
            onMouseEnter={() => setHoveredTier('Aaaaahs')}
            onMouseLeave={() => setHoveredTier(null)}
            onClick={() => {
              if (selectedTier === 'Aaaaahs') {
                openDisclaimerForTier('Aaaaahs')
                return
              }
              setSelectedTier('Aaaaahs')
              setHoveredTier('Aaaaahs')
            }}
            disabled={checkoutTier !== null}
          />

          {/* Bottom-right: Mmmmms */}
          <button
            type="button"
            aria-label={MEMBERSHIP_LEVELS.Mmmmms.name}
            className="absolute right-0 bottom-0 h-1/2 w-1/2 focus:outline-none focus:ring-4 focus:ring-primary/40"
            onMouseEnter={() => setHoveredTier('Mmmmms')}
            onMouseLeave={() => setHoveredTier(null)}
            onClick={() => {
              if (selectedTier === 'Mmmmms') {
                openDisclaimerForTier('Mmmmms')
                return
              }
              setSelectedTier('Mmmmms')
              setHoveredTier('Mmmmms')
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

      {selectedTier && (
        <div className="mx-auto mt-6 max-w-6xl px-6 text-center text-sm text-muted-foreground">
          Tap/click the same tier again to continue to checkout.
        </div>
      )}
    </div>
  )
}
