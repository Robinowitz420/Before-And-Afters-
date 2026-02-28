import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getAdminFirestore } from '@/lib/firebase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await auth.protect()
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const snap = await db.collection('profiles').doc(userId).get()
    
    if (!snap.exists) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      clerkUserId: userId,
      data: snap.data()?.data ?? {},
      createdAt: snap.data()?.createdAt,
      updatedAt: snap.data()?.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await auth.protect()
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getAdminFirestore()
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const ref = db.collection('profiles').doc(userId)
    const snap = await ref.get()
    if (!snap.exists) {
      return NextResponse.json({ ok: true })
    }

    await ref.delete()

    return NextResponse.json({ ok: true })
  } catch (error) {
    const maybeStatus = (error as any)?.status
    const maybeErrors = (error as any)?.errors
    console.error('Error deleting profile:', {
      error,
      status: maybeStatus,
      errors: maybeErrors,
    })

    if (maybeStatus === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    await auth.protect()
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const db = getAdminFirestore()
    
    if (!db) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 })
    }

    const now = new Date().toISOString()
    
    await db.collection('profiles').doc(userId).set({
      clerkUserId: userId,
      data: body ?? {},
      createdAt: now,
      updatedAt: now,
    }, { merge: true })

    return NextResponse.json({
      clerkUserId: userId,
      data: body ?? {},
      updatedAt: now,
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
