'use client'

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type ReportRow = {
  code: string
  name: string
  today: number
  week: number
  month: number
  recent: Array<{ id: string; createdAt: string; memberEmail?: string; clerkUserId?: string; source?: string }>
}

type ReportResponse = {
  range: {
    todayStart: string
    weekStart: string
    monthStart: string
  }
  rows: ReportRow[]
}

function formatDate(value: string) {
  const d = new Date(value)
  if (!Number.isFinite(d.getTime())) return value
  return d.toLocaleString()
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReportResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openCode, setOpenCode] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/referrals')
      const json = (await res.json().catch(() => null)) as any
      if (!res.ok) {
        setError(json?.error || 'Failed to load report')
        setData(null)
        return
      }
      setData(json as ReportResponse)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load report')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const summary = useMemo(() => {
    if (!data) return null
    const totalToday = data.rows.reduce((acc, r) => acc + (r.today || 0), 0)
    const totalWeek = data.rows.reduce((acc, r) => acc + (r.week || 0), 0)
    const totalMonth = data.rows.reduce((acc, r) => acc + (r.month || 0), 0)
    return { totalToday, totalWeek, totalMonth }
  }, [data])

  if (loading) {
    return <div className="mx-auto w-full max-w-6xl px-6 py-10 text-[hsl(var(--ink))]/70">Loading…</div>
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-6 py-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Admin</div>
          <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Referrals</h1>
          <p className="mt-2 text-sm text-[hsl(var(--ink))]/80">
            Calendar week is Mon–Sun (UTC). Month is current calendar month (UTC).
          </p>
        </div>

        <Button type="button" variant="outline" onClick={load}>
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
      ) : null}

      {data?.range ? (
        <Card>
          <CardHeader>
            <CardTitle>Range</CardTitle>
            <CardDescription>
              Week start: {formatDate(data.range.weekStart)} | Month start: {formatDate(data.range.monthStart)}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Total today:</span> {summary?.totalToday ?? 0}
            </div>
            <div>
              <span className="font-medium">Total this week:</span> {summary?.totalWeek ?? 0}
            </div>
            <div>
              <span className="font-medium">Total this month:</span> {summary?.totalMonth ?? 0}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4">
        {(data?.rows || []).length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-[hsl(var(--ink))]/70">No referrals yet.</CardContent>
          </Card>
        ) : (
          (data?.rows || []).map((row) => {
            const isOpen = openCode === row.code
            return (
              <Card key={row.code} className="overflow-hidden">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setOpenCode(isOpen ? null : row.code)}
                >
                  <CardHeader>
                    <CardTitle className="flex flex-wrap items-center justify-between gap-3">
                      <span>{row.name}</span>
                      <span className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/60">
                        {row.code}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Today: {row.today} | Week: {row.week} | Month: {row.month}
                    </CardDescription>
                  </CardHeader>
                </button>

                {isOpen ? (
                  <CardContent className="grid gap-2 text-sm">
                    {row.recent.length === 0 ? (
                      <div className="text-[hsl(var(--ink))]/70">No recent signups.</div>
                    ) : (
                      <div className="overflow-auto rounded-lg border border-[hsl(var(--border))]">
                        <table className="min-w-full border-collapse text-sm">
                          <thead className="bg-muted/40">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium">Created</th>
                              <th className="px-3 py-2 text-left font-medium">Member email</th>
                              <th className="px-3 py-2 text-left font-medium">Source</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.recent.map((r) => (
                              <tr key={r.id} className="border-t border-[hsl(var(--border))]">
                                <td className="px-3 py-2 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                                <td className="px-3 py-2 break-all">{r.memberEmail || '—'}</td>
                                <td className="px-3 py-2">{r.source || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                ) : null}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
