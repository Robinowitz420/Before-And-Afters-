import { NextRequest, NextResponse } from 'next/server'

import { requireAdminOrThrow } from '@/lib/admin'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

async function requireAdminOrSecret(request: NextRequest) {
  const sharedSecret = process.env.WARDROBE_MANAGER_ADMIN_SECRET
  const headerSecret = request.headers.get('x-wardrobe-admin-secret')
  if (sharedSecret && headerSecret && headerSecret === sharedSecret) {
    return { mode: 'secret' as const }
  }

  await requireAdminOrThrow()
  return { mode: 'clerk' as const }
}

function parseLimit(raw: string | null) {
  const n = raw ? Number(raw) : 0
  if (!Number.isFinite(n) || n <= 0) return 200
  return Math.min(500, Math.floor(n))
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminOrSecret(request)

    const url = new URL(request.url)
    const limit = parseLimit(url.searchParams.get('limit'))
    const cursor = url.searchParams.get('cursor')

    const users = await prisma.user.findMany({
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
      select: {
        id: true,
        email: true,
        name: true,
        membershipTier: true,
        membershipEndDate: true,
      },
    })

    const nextCursor = users.length === limit ? users[users.length - 1]?.id : null

    return NextResponse.json({ users, nextCursor }, { status: 200 })
  } catch (error) {
    const status = (error as any)?.status
    if (status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('Admin memberships list error:', error)
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}
