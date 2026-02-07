'use client'

import { Suspense } from 'react'
import { MembershipList } from './MembershipList'

export default function MembershipsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Membership</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Tiers</h1>
        <p className="mt-2 text-sm text-[color:var(--brand-text-secondary-hex)]">
          Pick the level that matches your ritual.
        </p>
      </div>

      <Suspense fallback={<div className="text-muted-foreground">Loading tiers…</div>}>
        <MembershipList />
      </Suspense>
    </div>
  )
}
