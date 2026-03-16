import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

import { getAdminFirestore } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type TasteTunerStateDoc = {
  likes?: string[]
  dislikes?: string[]
  reservedIds?: string[]
  requestedIds?: string[]
  reservationToken?: string | null
  updatedAt?: string
}

function normalizeStringArray(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input.filter((v) => typeof v === 'string').map((v) => v.trim()).filter(Boolean)
}

function normalizeToken(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const t = input.trim()
  return t ? t : null
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminFirestore()
  if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  const ref = db.collection('tasteTunerStates').doc(userId)
  const snap = await ref.get()

  if (!snap.exists) {
    return NextResponse.json({ data: { likes: [], dislikes: [], reservedIds: [], requestedIds: [], reservationToken: null } })
  }

  const data = (snap.data() ?? {}) as TasteTunerStateDoc

  return NextResponse.json({
    data: {
      likes: normalizeStringArray(data.likes),
      dislikes: normalizeStringArray(data.dislikes),
      reservedIds: normalizeStringArray(data.reservedIds),
      requestedIds: normalizeStringArray(data.requestedIds),
      reservationToken: normalizeToken(data.reservationToken),
      updatedAt: data.updatedAt ?? null,
    },
  })
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminFirestore()
  if (!db) return NextResponse.json({ error: 'Database not configured' }, { status: 500 })

  const body = await request.json().catch(() => ({}))

  const next: TasteTunerStateDoc = {
    likes: normalizeStringArray(body?.likes),
    dislikes: normalizeStringArray(body?.dislikes),
    reservedIds: normalizeStringArray(body?.reservedIds),
    requestedIds: normalizeStringArray(body?.requestedIds),
    reservationToken: normalizeToken(body?.reservationToken),
    updatedAt: new Date().toISOString(),
  }

  await db.collection('tasteTunerStates').doc(userId).set(next, { merge: true })

  return NextResponse.json({ data: next })
}
