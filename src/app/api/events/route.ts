import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

import { getAdminFirestore } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type EventDoc = {
  title?: string
  description?: string
  date?: string // YYYY-MM-DD
  startTime?: string | null // HH:MM
  endTime?: string | null // HH:MM
  location?: string | null
  imageUrls?: string[]
  createdAt?: string
  updatedAt?: string
}

function normalizeDate(input: unknown): string {
  if (typeof input !== 'string') return ''
  const trimmed = input.trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return ''
  return trimmed
}

function normalizeString(input: unknown): string {
  return typeof input === 'string' ? input.trim() : ''
}

function normalizeStringOrNull(input: unknown): string | null {
  const v = normalizeString(input)
  return v ? v : null
}

function normalizeImageUrls(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  return input
    .filter((v) => typeof v === 'string')
    .map((v) => v.trim())
    .filter(Boolean)
    .slice(0, 6)
}

export async function GET() {
  const db = getAdminFirestore()
  if (!db) {
    return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
  }

  const snap = await db.collection('events').orderBy('date', 'asc').get()
  const events = snap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as EventDoc) }))
  return NextResponse.json({ events })
}

export async function POST(request: NextRequest) {
  // URL-hidden admin: still require a signed-in user so random visitors can't spam.
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminFirestore()
  if (!db) {
    return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))

  const date = normalizeDate(body?.date)
  const title = normalizeString(body?.title)
  const description = normalizeString(body?.description)

  if (!date || !title) {
    return NextResponse.json({ error: 'Missing date or title' }, { status: 400 })
  }

  const now = new Date().toISOString()

  const docRef = await db.collection('events').add({
    date,
    title,
    description,
    startTime: normalizeStringOrNull(body?.startTime),
    endTime: normalizeStringOrNull(body?.endTime),
    location: normalizeStringOrNull(body?.location),
    imageUrls: normalizeImageUrls(body?.imageUrls),
    createdAt: now,
    updatedAt: now,
    createdBy: userId,
  })

  return NextResponse.json({ ok: true, id: docRef.id })
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminFirestore()
  if (!db) {
    return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
  }

  const body = await request.json().catch(() => ({}))
  const id = normalizeString(body?.id)

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const patch: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
    updatedBy: userId,
  }

  if (body?.date !== undefined) {
    const date = normalizeDate(body?.date)
    if (!date) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
    patch.date = date
  }

  if (body?.title !== undefined) patch.title = normalizeString(body?.title)
  if (body?.description !== undefined) patch.description = normalizeString(body?.description)
  if (body?.startTime !== undefined) patch.startTime = normalizeStringOrNull(body?.startTime)
  if (body?.endTime !== undefined) patch.endTime = normalizeStringOrNull(body?.endTime)
  if (body?.location !== undefined) patch.location = normalizeStringOrNull(body?.location)
  if (body?.imageUrls !== undefined) patch.imageUrls = normalizeImageUrls(body?.imageUrls)

  await db.collection('events').doc(id).set(patch, { merge: true })

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getAdminFirestore()
  if (!db) {
    return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
  }

  const url = new URL(request.url)
  const id = normalizeString(url.searchParams.get('id'))
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await db.collection('events').doc(id).delete()
  return NextResponse.json({ ok: true })
}
