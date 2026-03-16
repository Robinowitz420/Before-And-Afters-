import { NextRequest, NextResponse } from 'next/server'

import { getAdminFirestore } from '@/lib/firebase/admin'

export const dynamic = 'force-dynamic'

function normalizeCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

function maskEmail(email: string) {
  const at = email.indexOf('@')
  if (at <= 0) return '***'
  const name = email.slice(0, at)
  const domain = email.slice(at + 1)
  const visible = name.slice(0, 1)
  return `${visible}***@${domain}`
}

type ReferralDoc = {
  employeeCode?: string
  createdAt?: string
  memberEmail?: string
  clerkUserId?: string
  source?: string
}

export async function GET(request: NextRequest) {
  try {
    const codeParam = request.nextUrl.searchParams.get('code')
    if (!codeParam || !codeParam.trim()) {
      return NextResponse.json({ error: 'Missing code' }, { status: 400 })
    }

    const code = normalizeCode(codeParam)

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
    }

    const snap = await db
      .collection('referrals')
      .where('employeeCode', '==', code)
      .orderBy('createdAt', 'desc')
      .limit(200)
      .get()

    const referrals = snap.docs.map((d) => ({ id: d.id, ...(d.data() as ReferralDoc) }))

    const total = referrals.length
    const commissionPerSignup = 20
    const totalEarnings = total * commissionPerSignup

    const recent = referrals.slice(0, 50).map((r) => ({
      id: (r as any).id as string,
      createdAt: typeof r.createdAt === 'string' ? r.createdAt : null,
      memberEmailMasked:
        typeof r.memberEmail === 'string' && r.memberEmail.trim() ? maskEmail(r.memberEmail.trim()) : null,
      source: typeof r.source === 'string' ? r.source : null,
    }))

    return NextResponse.json({
      code,
      totalSignups: total,
      commissionPerSignup,
      totalEarnings,
      recent,
    })
  } catch (error) {
    console.error('Error fetching public referral stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
