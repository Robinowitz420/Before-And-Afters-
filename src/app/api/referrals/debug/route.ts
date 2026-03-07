import { NextRequest, NextResponse } from 'next/server'

import { getAdminFirestore } from '@/lib/firebase/admin'

type ReferralDoc = {
  employeeCode?: string
  createdAt?: string
  memberEmail?: string
  clerkUserId?: string
  source?: string
}

function normalizeLimit(value: string | null) {
  const n = value ? Number.parseInt(value, 10) : 10
  if (!Number.isFinite(n)) return 10
  return Math.min(Math.max(n, 1), 50)
}

export async function GET(request: NextRequest) {
  try {
    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
    }

    const codeParam = request.nextUrl.searchParams.get('code')
    const limit = normalizeLimit(request.nextUrl.searchParams.get('limit'))

    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = db
      .collection('referrals')
      .orderBy('createdAt', 'desc')

    if (codeParam && codeParam.trim()) {
      query = query.where('employeeCode', '==', codeParam.trim().toUpperCase().replace(/\s+/g, ''))
    }

    const snap = await query.limit(limit).get()

    const docs = snap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as ReferralDoc),
    }))

    return NextResponse.json({
      ok: true,
      limit,
      code: codeParam ? codeParam.trim() : null,
      count: docs.length,
      docs,
    })
  } catch (error) {
    console.error('Error fetching referral debug docs:', error)
    return NextResponse.json({ error: 'Failed to fetch debug info' }, { status: 500 })
  }
}
