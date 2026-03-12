'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'

const BASE_IMAGE_SRC = '/images/Backgrounds/Background2.jpg'

const TIER_IMAGES: Record<MembershipTier, string> = {
  Eeeehs: '/images/Memberships/eeeehs.jpg',
  Oooohs: '/images/Memberships/Oooohs.jpg',
  Aaaaahs: '/images/Memberships/Aaaahs.jpg',
  Mmmmms: '/images/Memberships/Mmmms.jpg',
}

export default function InteractiveMembershipList() {
  const [selectedTier, setSelectedTier] = useState<string | null>(null)
  const [checkoutTier, setCheckoutTier] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [promoInfo, setPromoInfo] = useState<{ applied: boolean; remaining: number } | null>(null)
  const [disclaimerOpen, setDisclaimerOpen] = useState(false)
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false)
  const [pendingTier, setPendingTier] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      const ref = url.searchParams.get('ref')
      const tierParam = url.searchParams.get('tier') as string | null

      if (ref && ref.trim()) {
        window.localStorage.setItem('baa_ref', ref.trim())
      }

      // Auto-select tier if valid tier parameter in URL
      if (tierParam && Object.keys(MEMBERSHIP_LEVELS).includes(tierParam)) {
        setSelectedTier(tierParam)
        openDisclaimerForTier(tierParam)
      }
    } catch {
      // ignore
    }
  }, [])

  const redirectToStripeCheckout = async (tier: string) => {
    setCheckoutTier(tier)
    setError(null)
    try {
      console.log('Creating checkout session for tier:', tier)

      let referralCode: string | null = null
      try {
        referralCode = window.localStorage.getItem('baa_ref')
        if (referralCode) referralCode = referralCode.trim()
        if (!referralCode) referralCode = null
      } catch {
        referralCode = null
      }

      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tier, referralCode }),
      })
      console.log('Checkout session response status:', res.status)
      
      const data = await res.json().catch((e) => {
        console.error('Failed to parse response:', e)
        return {}
      })
      console.log('Checkout session response data:', data)

      const promo = (data as any)?.promo
      if (promo && typeof promo === 'object') {
        setPromoInfo({
          applied: !!promo.applied,
          remaining: typeof promo.remaining === 'number' ? promo.remaining : 0,
        })
      } else {
        setPromoInfo(null)
      }
      
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

  const membershipDisclaimer = `Membership Agreement & Disclaimer
Please read carefully before completing your purchase.

By purchasing a Before & Afters membership, you acknowledge and agree to the following:

Financial Responsibility

You are financially responsible for any borrowed items that are not returned, damaged beyond normal wear, or lost while in your possession.
Replacement costs will be charged to your payment method on file based on the item's current resale value.
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

  const openDisclaimerForTier = (tier: string) => {
    setPendingTier(tier)
    setDisclaimerAgreed(false)
    setDisclaimerOpen(true)
  }

  return (
    <div className="relative min-h-[100svh] w-screen overflow-x-hidden overflow-y-auto bg-black lg:h-[100svh] lg:overflow-hidden">
      {promoInfo?.applied ? (
        <div className="absolute left-1/2 top-4 z-[60] w-[min(92vw,56rem)] -translate-x-1/2 rounded-xl border border-yellow-300/60 bg-yellow-200/90 px-4 py-3 text-center text-sm font-semibold text-black shadow-lg backdrop-blur">
          $50 off applied to your first month. {promoInfo.remaining > 0 ? `${promoInfo.remaining} spots left.` : ''}
        </div>
      ) : null}

      {error && (
        <div className="absolute left-1/2 top-4 z-[60] w-[min(92vw,56rem)] -translate-x-1/2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Mobile: scrollable single column, Desktop: fixed fullscreen */}
      <div className="relative min-h-full w-full lg:fixed lg:inset-0">
        <Image
          src={BASE_IMAGE_SRC}
          alt="Membership"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-black/20" />

        {/* Mobile: vertical scrollable layout, Desktop: centered grid */}
        <div className="relative flex flex-col items-center gap-4 p-4 pb-8 sm:hidden">
          {(Object.keys(MEMBERSHIP_LEVELS) as MembershipTier[]).map((tier) => {
            const level = MEMBERSHIP_LEVELS[tier]
            return (
              <button
                key={tier}
                type="button"
                className="group relative w-full max-w-sm overflow-hidden rounded-2xl border-4 border-white/30 bg-black/20 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/80 hover:shadow-yellow-400/20 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-100"
                onClick={() => {
                  setSelectedTier(tier)
                  openDisclaimerForTier(tier)
                }}
                disabled={checkoutTier !== null}
              >
                <div className="relative w-full">
                  <Image
                    src={TIER_IMAGES[tier]}
                    alt={level.name}
                    width={400}
                    height={533}
                    className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="100vw"
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* Desktop: centered 4-column grid */}
        <div className="absolute inset-0 hidden items-center justify-center p-8 sm:flex">
          <div className="grid w-full max-w-7xl grid-cols-2 gap-4 lg:grid-cols-4">
            {(Object.keys(MEMBERSHIP_LEVELS) as MembershipTier[]).map((tier) => {
              const level = MEMBERSHIP_LEVELS[tier]
              return (
                <button
                  key={tier}
                  type="button"
                  className="group relative overflow-hidden rounded-2xl border-4 border-white/30 bg-black/20 shadow-2xl backdrop-blur-sm transition-all duration-300 hover:border-yellow-400/80 hover:shadow-yellow-400/20 hover:scale-105 hover:shadow-[0_0_30px_rgba(250,204,21,0.3)] focus:outline-none focus:ring-4 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50 active:scale-100"
                  onClick={() => {
                    setSelectedTier(tier)
                    openDisclaimerForTier(tier)
                  }}
                  disabled={checkoutTier !== null}
                >
                  <div className="relative w-full">
                    <Image
                      src={TIER_IMAGES[tier]}
                      alt={level.name}
                      width={400}
                      height={533}
                      className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {checkoutTier ? (
        <div className="absolute inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="w-full max-w-sm rounded-2xl bg-black/60 px-4 py-3 text-center text-sm text-white">
            Redirecting to checkout…
          </div>
        </div>
      ) : null}

      {disclaimerOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-10">
          <div className="w-full max-w-3xl rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-6 shadow-2xl font-[family-name:var(--font-inter)]">
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
                className="font-[family-name:var(--font-inter)]"
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
                className="font-[family-name:var(--font-inter)]"
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
