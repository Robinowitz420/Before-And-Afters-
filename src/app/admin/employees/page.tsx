'use client'

import { useEffect, useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type Employee = {
  id: string
  code?: string
  name?: string
  active?: boolean
  createdAt?: string
}

const MEMBERSHIPS_BASE_URL = 'https://beforeandafters.vercel.app/memberships'

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [creating, setCreating] = useState(false)

  const normalizedCode = useMemo(() => code.trim().toLowerCase().replace(/\s+/g, '-'), [code])

  const loadEmployees = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/employees')
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data as any)?.error || 'Failed to load employees')
        setEmployees([])
        return
      }
      const list = Array.isArray((data as any)?.employees) ? (data as any).employees : []
      setEmployees(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load employees')
      setEmployees([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onCreate = async () => {
    if (!name.trim() || !normalizedCode) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), code: normalizedCode }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError((data as any)?.error || 'Failed to create employee')
        return
      }
      setName('')
      setCode('')
      await loadEmployees()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create employee')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return <div className="mx-auto w-full max-w-5xl px-6 py-10 text-[hsl(var(--ink))]/70">Loading…</div>
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
      <div>
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Admin</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Employees</h1>
        <p className="mt-2 text-sm text-[hsl(var(--ink))]/80">
          Create employees, then copy their invite link / QR code.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">{error}</div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Create employee</CardTitle>
          <CardDescription>Code becomes the ref used in invite links (lowercase, no spaces).</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Elize" />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-medium">Code</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="elize" />
            <div className="text-xs text-[hsl(var(--ink))]/70">Normalized: {normalizedCode || '—'}</div>
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <Button type="button" onClick={onCreate} disabled={creating || !name.trim() || !normalizedCode}>
              {creating ? 'Saving…' : 'Save employee'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {employees.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-[hsl(var(--ink))]/70">No employees yet.</CardContent>
          </Card>
        ) : (
          employees.map((emp) => {
            const empCode = typeof emp.code === 'string' && emp.code ? emp.code : emp.id
            const link = `${MEMBERSHIPS_BASE_URL}?ref=${encodeURIComponent(empCode)}`

            return (
              <Card key={emp.id} className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-3">
                    <span>{emp.name || empCode}</span>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/60">
                      {empCode}
                    </span>
                  </CardTitle>
                  <CardDescription className="break-all">{link}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-[1fr,220px] sm:items-center">
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(link)
                        } catch {
                          // ignore
                        }
                      }}
                    >
                      Copy link
                    </Button>

                    <Button
                      type="button"
                      onClick={() => {
                        window.open(link, '_blank', 'noopener,noreferrer')
                      }}
                    >
                      Open memberships link
                    </Button>
                  </div>

                  <div className="rounded-2xl bg-white p-4 ring-1 ring-[hsl(var(--border))] shadow-sm">
                    <QRCodeCanvas value={link} size={180} bgColor="#ffffff" fgColor="#000000" />
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
