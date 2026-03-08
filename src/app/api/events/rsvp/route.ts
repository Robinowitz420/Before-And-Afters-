import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

import { getAdminFirestore } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : ''
}

export async function GET(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminFirestore()
  if (!db) {
    return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
  }

  const url = new URL(request.url)
  const eventId = normalizeString(url.searchParams.get('eventId'))

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
  }

  const snap = await db.collection('eventRsvps').doc(`${eventId}_${userId}`).get()
  if (!snap.exists) {
    return NextResponse.json({ status: 'none' })
  }

  return NextResponse.json({ status: (snap.data() as any)?.status ?? 'none' })
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminFirestore()
  if (!db) {
    return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const eventId = normalizeString(body?.eventId)
  const status = normalizeString(body?.status)

  if (!eventId || !['attending', 'not_attending'].includes(status)) {
    return NextResponse.json({ error: 'Invalid eventId or status' }, { status: 400 })
  }

  const now = new Date().toISOString()
  await db.collection('eventRsvps').doc(`${eventId}_${userId}`).set(
    {
      eventId,
      userId,
      status,
      updatedAt: now,
    },
    { merge: true }
  )

  return NextResponse.json({ ok: true })
}
