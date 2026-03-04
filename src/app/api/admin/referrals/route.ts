import { NextRequest, NextResponse } from 'next/server'

import { requireAdminOrThrow } from '@/lib/admin'
import { getAdminFirestore } from '@/lib/firebase/admin'

type EmployeeDoc = {
  code?: string
  name?: string
  active?: boolean
  createdAt?: string
}

type ReferralDoc = {
  employeeCode?: string
  createdAt?: string
  memberEmail?: string
  clerkUserId?: string
  source?: string
}

function startOfDayUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
}

function startOfWeekUtcMonday(date: Date) {
  const day = date.getUTCDay() // 0=Sun
  const diff = (day + 6) % 7 // Mon=0
  const start = startOfDayUtc(date)
  start.setUTCDate(start.getUTCDate() - diff)
  return start
}

function startOfMonthUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0))
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrThrow()

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
    }

    const now = new Date()
    const todayStart = startOfDayUtc(now)
    const weekStart = startOfWeekUtcMonday(now)
    const monthStart = startOfMonthUtc(now)

    const employeeSnap = await db.collection('employees').get()
    const employees = employeeSnap.docs.map((d) => ({ id: d.id, ...(d.data() as EmployeeDoc) }))

    const referralSnap = await db
      .collection('referrals')
      .where('createdAt', '>=', monthStart.toISOString())
      .get()

    const referrals = referralSnap.docs.map((d) => ({ id: d.id, ...(d.data() as ReferralDoc) }))

    const statsByCode = new Map<
      string,
      {
        code: string
        name: string
        today: number
        week: number
        month: number
        recent: Array<{ id: string; createdAt: string; memberEmail?: string; clerkUserId?: string; source?: string }>
      }
    >()

    const ensure = (code: string) => {
      const existing = statsByCode.get(code)
      if (existing) return existing
      const entry = {
        code,
        name: code,
        today: 0,
        week: 0,
        month: 0,
        recent: [] as Array<{ id: string; createdAt: string; memberEmail?: string; clerkUserId?: string; source?: string }>,
      }
      statsByCode.set(code, entry)
      return entry
    }

    for (const emp of employees) {
      const code = (typeof emp.code === 'string' && emp.code.trim()) ? emp.code.trim() : emp.id
      const entry = ensure(code)
      if (typeof emp.name === 'string' && emp.name.trim()) {
        entry.name = emp.name.trim()
      }
    }

    for (const r of referrals) {
      const code = typeof r.employeeCode === 'string' && r.employeeCode.trim() ? r.employeeCode.trim() : ''
      const createdAt = typeof r.createdAt === 'string' ? r.createdAt : ''
      if (!code || !createdAt) continue

      const entry = ensure(code)

      const created = new Date(createdAt)
      if (!Number.isFinite(created.getTime())) continue

      entry.month += 1
      if (created >= weekStart) entry.week += 1
      if (created >= todayStart) entry.today += 1

      entry.recent.push({
        id: (r as any).id as string,
        createdAt,
        memberEmail: typeof r.memberEmail === 'string' ? r.memberEmail : undefined,
        clerkUserId: typeof r.clerkUserId === 'string' ? r.clerkUserId : undefined,
        source: typeof r.source === 'string' ? r.source : undefined,
      })
    }

    const rows = Array.from(statsByCode.values())
      .map((r) => ({
        ...r,
        recent: r.recent.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 50),
      }))
      .sort((a, b) => b.month - a.month)

    return NextResponse.json({
      range: {
        todayStart: todayStart.toISOString(),
        weekStart: weekStart.toISOString(),
        monthStart: monthStart.toISOString(),
      },
      rows,
    })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error fetching referrals report:', error)
    return NextResponse.json({ error: 'Failed to fetch referrals report' }, { status: 500 })
  }
}
