'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'

const BASE_IMAGE_SRC = '/images/Membership Images/DeliNotSelected.png'

const SELECTED_IMAGE_SRC: Record<MembershipTier, string> = {
  Eeeehs: '/images/Membership Images/EeeehsSelected.png',
  Oooohs: '/images/Membership Images/OooohsSelected.png',
  Aaaaahs: '/images/Membership Images/AaaagsSelected.png',
  Mmmmms: '/images/Membership Images/MmmmsSelected.png',
}

export default function InteractiveMembershipList() {
  const [hoveredTier, setHoveredTier] = useState<MembershipTier | null>(null)
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null)
  const [checkoutTier, setCheckoutTier] = useState<MembershipTier | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="mx-auto w-full max-w-6xl px-6">
      {error && (
        <div className="mb-6 rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="relative mx-auto w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-black shadow-lg">
        <Image
          src={hoveredTier ? SELECTED_IMAGE_SRC[hoveredTier] : BASE_IMAGE_SRC}
          alt="Membership tiers"
          width={1024}
          height={576}
          priority
          className="h-auto w-full scale-[1.3] select-none"
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
                redirectToStripeCheckout('Eeeehs')
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
                redirectToStripeCheckout('Oooohs')
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
                redirectToStripeCheckout('Aaaaahs')
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
                redirectToStripeCheckout('Mmmmms')
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
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Tap/click the same tier again to continue to checkout.
        </div>
      )}
    </div>
  )
}
