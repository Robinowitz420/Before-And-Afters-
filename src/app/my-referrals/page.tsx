'use client'

import { useState } from 'react'

type ReferralStats = {
  code: string
  totalSignups: number
  commissionPerSignup: number
  totalEarnings: number
  recent: Array<{
    id: string
    createdAt: string | null
    memberEmailMasked: string | null
    source: string | null
  }>
}

export default function MyReferralsPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<ReferralStats | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStats(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/referrals/stats?code=${encodeURIComponent(code)}`)
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError((data as any)?.error || 'Failed to load stats')
        return
      }

      setStats(data as ReferralStats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  const shareLink = stats ? `${window.location.origin}/memberships?ref=${encodeURIComponent(stats.code)}` : ''

  return (
    <main className="min-h-[100svh] bg-black px-6 py-12 text-white">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">My Referrals</h1>
        <p className="mt-2 text-white/80">
          Enter your code to see how many memberships you&apos;ve generated.
        </p>

        <form onSubmit={onSubmit} className="mt-8 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
          <label className="block text-sm font-semibold text-white/90">Referral code</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="VERONA"
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-lg font-semibold uppercase tracking-wider text-white outline-none placeholder:text-white/40"
            required
          />

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-opacity disabled:opacity-50"
            >
              {loading ? 'Loading…' : 'View stats'}
            </button>

            {stats ? (
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(shareLink)
                }}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white"
              >
                Copy my link
              </button>
            ) : null}
          </div>

          {error ? <div className="mt-4 text-sm font-medium text-red-200">{error}</div> : null}
        </form>

        {stats ? (
          <div className="mt-10 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Code</div>
                  <div className="mt-1 text-3xl font-black tracking-tight">{stats.code}</div>
                </div>
                <div className="text-white/80">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Share link</div>
                  <div className="mt-1 break-all rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm">
                    {shareLink}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Signups</div>
                <div className="mt-2 text-4xl font-black">{stats.totalSignups}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Commission</div>
                <div className="mt-2 text-4xl font-black">${stats.commissionPerSignup}</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Total earned</div>
                <div className="mt-2 text-4xl font-black">${stats.totalEarnings}</div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Recent signups</div>
              {stats.recent.length === 0 ? (
                <div className="mt-4 text-white/70">No signups yet.</div>
              ) : (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                  <div className="grid grid-cols-[1.2fr_1fr_0.9fr] gap-0 bg-black/40 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    <div>Email</div>
                    <div>Date</div>
                    <div>Source</div>
                  </div>
                  {stats.recent.map((r) => (
                    <div
                      key={r.id}
                      className="grid grid-cols-[1.2fr_1fr_0.9fr] gap-0 border-t border-white/10 px-4 py-3 text-sm text-white/85"
                    >
                      <div className="truncate">{r.memberEmailMasked ?? '—'}</div>
                      <div>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</div>
                      <div className="truncate">{r.source ?? '—'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}
