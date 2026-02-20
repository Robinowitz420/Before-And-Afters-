'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MembershipSignupForm } from './MembershipSignupForm'

const TIER_IMAGE: Record<MembershipTier, string> = {
  Eeeehs: '/images/MEMBERSHIPS/Eeeehs.png',
  Oooohs: '/images/MEMBERSHIPS/Oooohs.png',
  Aaaaahs: '/images/MEMBERSHIPS/Aaaahs.png',
  Mmmmms: '/images/MEMBERSHIPS/Mmmms.png',
}

interface Membership {
  id: string
  email: string
  name: string
  membershipTier: MembershipTier
  membershipStartDate: string
  membershipEndDate: string | null
  glitcoinBalance: number
  itemsCurrentlyRented: number
  maxItemsAllowed: number
  trustLevel: string
  depositPaid?: boolean
  createdAt: string
}

export function MembershipList() {
  const [mounted, setMounted] = useState(false)
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTier, setSelectedTier] = useState<MembershipTier | ''>('')
  const [checkoutTier, setCheckoutTier] = useState<MembershipTier | null>(null)

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
        setError(data?.error || 'Could not start checkout')
        return
      }
      if (data?.url) {
        window.location.href = data.url
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

  useEffect(() => {
    setMounted(true)
  }, [])

  const searchParams = useSearchParams()

  useEffect(() => {
    if (mounted) {
      fetchMemberships()
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    const paid = searchParams.get('paid')
    const canceled = searchParams.get('canceled')
    if (paid === '1') {
      fetchMemberships()
    }
  }, [mounted, searchParams])

  const fetchMemberships = async () => {
    // Only run on client side
    if (typeof window === 'undefined') return

    setError(null)
    try {
      const response = await fetch('/api/memberships')
      const contentType = response.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')
      const data = isJson ? await response.json().catch(() => null) : null

      if (!response.ok) {
        const message =
          (data && typeof data === 'object' && 'error' in data && typeof (data as any).error === 'string')
            ? (data as any).error
            : `Failed to fetch memberships (${response.status})`

        setMembership(null)
        setError(message)
        return
      }

      // Single-user portal: endpoint returns a single membership record or null.
      if (data === null) {
        setMembership(null)
        return
      }

      if (!data || typeof data !== 'object') {
        setMembership(null)
        setError('Unexpected response from server')
        return
      }

      setMembership(data as Membership)
    } catch (error) {
      console.error('Error fetching memberships:', error)
      setMembership(null)
      setError('Failed to fetch memberships')
    } finally {
      setLoading(false)
    }
  }


  if (!mounted || loading) {
    return <div>Loading memberships...</div>
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn&apos;t load memberships</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => { setLoading(true); fetchMemberships() }}>
            Try again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const paid = searchParams.get('paid') === '1'
  const canceled = searchParams.get('canceled') === '1'

  return (
    <div className="space-y-8">
      {paid && (
        <div className="rounded-lg bg-green-500/10 text-green-800 dark:text-green-200 px-4 py-2 text-sm">
          Payment successful. Your membership is being activated—refresh in a moment if you don’t see it yet.
        </div>
      )}
      {canceled && (
        <div className="rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-200 px-4 py-2 text-sm">
          Checkout was canceled. You can pick a tier whenever you’re ready.
        </div>
      )}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[hsl(var(--ink))]">Membership Tiers</h1>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="text-yellow-800">
            <strong>Important:</strong> All memberships require a $25 (5Ġ) deposit upfront.
            You&apos;ll receive monthly free Glitcoins based on your membership tier.
          </div>
        </div>
      </div>

      {showCreateForm && (
        <MembershipSignupForm
          initialTier={selectedTier}
          onClose={() => {
            setShowCreateForm(false)
            setSelectedTier('')
          }}
          onSuccess={() => {
            setShowCreateForm(false)
            setSelectedTier('')
            fetchMemberships()
          }}
        />
      )}

      {membership ? (
        <Card>
          <CardHeader>
            <CardTitle>Your membership</CardTitle>
            <CardDescription>
              {MEMBERSHIP_LEVELS[membership.membershipTier]?.name ?? membership.membershipTier}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Rental limit:</span> {membership.maxItemsAllowed}
            </div>
            <div>
              <span className="font-medium">Currently rented:</span> {membership.itemsCurrentlyRented}
            </div>
            <div>
              <span className="font-medium">Trust level:</span> {membership.trustLevel}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {error && (
        <div className="rounded-lg bg-destructive/10 text-destructive px-4 py-2 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Tiers – giant round buttons with badge benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-12 w-full max-w-8xl mx-auto">
        {Object.entries(MEMBERSHIP_LEVELS).map(([tier, level]) => {
          const tierKey = tier as MembershipTier
          const isRedirecting = checkoutTier === tierKey
          return (
            <button
              key={tier}
              type="button"
              disabled={isRedirecting}
              className="relative w-full aspect-[4/3] rounded-full bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--border))] border-4 border-[hsl(var(--border))] hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-4 disabled:opacity-70 overflow-hidden group shadow-lg"
              onClick={() => redirectToStripeCheckout(tierKey)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TIER_IMAGE[tierKey]}
                alt={level.name.split(' — ')[0]}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                <div className="text-3xl font-bold text-[hsl(var(--ink))] mb-2 drop-shadow-lg">
                  {level.name.split(' — ')[0]}
                </div>
                <div className="text-lg font-bold text-[hsl(var(--accent))] mb-6 drop-shadow-md">
                  ${level.monthlyPrice}/mo
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-[90%]">
                  {level.benefits.map((benefit, idx) => (
                    <Badge key={idx} variant="accent" className="text-xs font-medium shadow-sm">
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>
              {isRedirecting && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-lg font-medium">
                  Redirecting to checkout…
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
