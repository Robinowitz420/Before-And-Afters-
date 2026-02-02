import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { DEPOSIT_GLITCOIN } from '@/lib/business-rules'

// POST /api/deposit - Process deposit payment
export async function POST(request: NextRequest) {
  try {
    await auth.protect()
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.depositPaid) {
      return NextResponse.json(
        { error: 'Deposit has already been paid' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Deposit is collected during membership signup' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error processing deposit:', error)
    return NextResponse.json(
      { error: 'Failed to process deposit' },
      { status: 500 }
    )
  }
}

// GET /api/deposit - Check deposit status
export async function GET() {
  try {
    await auth.protect()
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { depositPaid: true, glitcoinBalance: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      depositPaid: user.depositPaid,
      glitcoinBalance: user.glitcoinBalance,
      depositRequired: DEPOSIT_GLITCOIN
    })
  } catch (error) {
    console.error('Error checking deposit status:', error)
    return NextResponse.json(
      { error: 'Failed to check deposit status' },
      { status: 500 }
    )
  }
}