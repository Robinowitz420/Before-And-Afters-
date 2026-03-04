import { NextRequest, NextResponse } from 'next/server'

import { requireAdminOrThrow } from '@/lib/admin'
import { getAdminFirestore } from '@/lib/firebase/admin'

function normalizeCode(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, '-')
}

export async function GET() {
  try {
    await requireAdminOrThrow()

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
    }

    const snap = await db.collection('employees').orderBy('createdAt', 'desc').get()
    const employees = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json({ employees })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminOrThrow()

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Firestore unavailable' }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const rawCode = typeof body?.code === 'string' ? body.code : ''
    const rawName = typeof body?.name === 'string' ? body.name : ''

    const code = normalizeCode(rawCode)
    const name = rawName.trim()

    if (!code || !name) {
      return NextResponse.json({ error: 'Missing name or code' }, { status: 400 })
    }

    await db
      .collection('employees')
      .doc(code)
      .set(
        {
          code,
          name,
          active: true,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      )

    return NextResponse.json({ ok: true })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Error creating employee:', error)
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}
