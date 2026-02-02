'use client'

import { useState, useEffect } from 'react'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MembershipSignupForm } from './MembershipSignupForm'

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
  const [selectedTier, setSelectedTier] = useState<string>('')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchMemberships()
    }
  }, [mounted])

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

  return (
    <div className="space-y-8">
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
            You'll receive monthly free Glitcoins based on your membership tier.
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

      {/* Memberships List */}
      <div className="grid gap-6">
        {Object.entries(MEMBERSHIP_LEVELS).map(([tier, level]) => (
          <Card key={tier} className="overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{level.name.split(' - ')[0]}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {level.name.split(' - ')[1]}
                  </p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-bold">
                      {level.glitcoinValue}Ġ
                    </span>
                    <span className="text-muted-foreground">/ month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {level.maxItems} item{level.maxItems !== 1 ? 's' : ''} at a time
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {level.freeCheckMeowtItems} free Check Meowt
                  </div>
                  <div className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-medium text-secondary-foreground">
                    {level.freeMonthlyGlitcoins} free Ġ/month
                  </div>
                </div>
              </div>

              <ul className="mt-6 space-y-2">
                {level.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center">
                    <svg
                      className="mr-2 h-4 w-4 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="mt-6 w-full"
                onClick={() => {
                  setSelectedTier(tier)
                  setShowCreateForm(true)
                }}
              >
                Join {level.name.split(' - ')[0]}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
