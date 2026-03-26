import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { clerkUserId: userId },
    })

    if (!profile) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      clerkUserId: userId,
      data: profile.data ?? {},
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.profile.delete({
      where: { clerkUserId: userId },
    }).catch(() => {
      // Profile might not exist, that's fine
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error deleting profile:', error)
    return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const profile = await prisma.profile.upsert({
      where: { clerkUserId: userId },
      create: {
        clerkUserId: userId,
        data: body ?? {},
      },
      update: {
        data: body ?? {},
      },
    })

    return NextResponse.json({
      clerkUserId: userId,
      data: profile.data ?? {},
      updatedAt: profile.updatedAt,
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
