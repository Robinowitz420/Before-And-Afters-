import { Suspense } from 'react'
import InteractiveMembershipList from './InteractiveMembershipList'

export default function MembershipsPage() {
  return (
    <div className="relative h-[100svh] w-screen overflow-hidden bg-black">
      <Suspense fallback={<div className="text-[hsl(var(--ink))]/70">Loading…</div>}>
        <InteractiveMembershipList />
      </Suspense>
    </div>
  )
}
