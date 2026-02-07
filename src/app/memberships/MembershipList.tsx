'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
        <h1 className="text-2xl font-bold">Membership Plans</h1>
        {membership ? (
          <div className="text-sm text-muted-foreground">
            You already have a membership.
          </div>
        ) : (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'New Membership'}
          </Button>
        )}
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

      {/* Memberships – image only, evenly across page, 45% bigger (72.5% = 50% × 1.45) */}
      <div className="grid grid-cols-4 gap-8 w-[72.5%] max-w-5xl mx-auto">
        {Object.entries(MEMBERSHIP_LEVELS).map(([tier, level]) => {
          const tierKey = tier as MembershipTier
          const isRedirecting = checkoutTier === tierKey
          return (
            <button
              key={tier}
              type="button"
              disabled={isRedirecting}
              className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg overflow-hidden disabled:opacity-70"
              onClick={() => redirectToStripeCheckout(tierKey)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={TIER_IMAGE[tierKey]}
                alt={level.name.split(' - ')[0]}
                className="w-full h-auto block"
              />
              {isRedirecting && (
                <span className="block text-center text-sm text-muted-foreground py-2">
                  Redirecting to checkout…
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
