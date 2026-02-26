'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

async function fetchWizardProfileExists(): Promise<boolean> {
  const res = await fetch('/api/profile', {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })

  if (res.status === 401) return false
  if (!res.ok) return false

  const payload = (await res.json().catch(() => null)) as { data?: unknown } | null
  if (!payload || payload === null) return false

  const data = (payload as any).data
  if (!data || typeof data !== 'object') return false

  return Object.keys(data as Record<string, unknown>).length > 0
}

export const dynamic = 'force-dynamic'

function PostCheckoutInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    if (!sessionId) {
      router.replace('/profile')
      return
    }

    let cancelled = false

    fetchWizardProfileExists()
      .then((exists) => {
        if (cancelled) return
        router.replace(exists ? '/profile' : '/profile-wizard')
      })
      .catch((e) => {
        console.error(e)
        if (cancelled) return
        setError('Could not complete checkout redirect. Please continue to your profile.')
      })

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center px-6 py-12">
      <div className="w-full rounded-2xl border border-[hsl(var(--border))] bg-white/60 p-6 text-center shadow-sm backdrop-blur">
        <div className="text-sm font-medium text-[hsl(var(--ink))]">Finishing up…</div>
        <div className="mt-2 text-sm text-[hsl(var(--ink))]/70">Redirecting you to the right place.</div>
        {error ? <div className="mt-4 text-sm text-destructive">{error}</div> : null}
      </div>
    </div>
  )
}

export default function PostCheckoutPage() {
  return (
    <Suspense>
      <PostCheckoutInner />
    </Suspense>
  )
}
