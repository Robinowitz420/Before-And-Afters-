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
  const attendees = url.searchParams.get('attendees') === 'true'

  if (!eventId) {
    return NextResponse.json({ error: 'Missing eventId' }, { status: 400 })
  }

  // If attendees=true, return list of attendees
  if (attendees) {
    const snap = await db
      .collection('eventRsvps')
      .where('eventId', '==', eventId)
      .where('status', '==', 'attending')
      .get()

    const attendeeUserIds = snap.docs.map((doc) => (doc.data() as any)?.userId).filter(Boolean)

    // Fetch user display names from profiles (look up by clerkUserId field)
    const profiles = await Promise.all(
      attendeeUserIds.map(async (uid: string) => {
        try {
          // Try to find profile where clerkUserId matches
          const profileQuery = await db
            .collection('profiles')
            .where('clerkUserId', '==', uid)
            .limit(1)
            .get()

          if (!profileQuery.empty) {
            const doc = profileQuery.docs[0]
            const raw = doc.data() as any
            const data = raw?.data && typeof raw.data === 'object' ? (raw.data as any) : raw

            const displayName =
              (typeof data.displayName === 'string' && data.displayName.trim()) ||
              (typeof data.fullName === 'string' && data.fullName.trim()) ||
              (typeof data.nickname === 'string' && data.nickname.trim()) ||
              null

            return {
              userId: uid,
              displayName: displayName || 'Anonymous',
            }
          }

          // Fallback: try to get name from Prisma User table
          const { prisma } = await import('@/lib/prisma')
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { clerkUserId: uid },
                { email: { in: [] } }, // placeholder for OR
              ],
            },
            select: { displayName: true, name: true, email: true },
          })

          if (user) {
            return {
              userId: uid,
              displayName: user.displayName || user.name || user.email?.split('@')[0] || 'Anonymous',
            }
          }

          return { userId: uid, displayName: 'Anonymous' }
        } catch {
          return { userId: uid, displayName: 'Anonymous' }
        }
      })
    )

    return NextResponse.json({ attendees: profiles })
  }

  // Otherwise return current user's RSVP status
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
