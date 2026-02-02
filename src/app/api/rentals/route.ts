import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import {
  calculateRentalFee,
  calculateLateFees,
  LATE_FEE_START_DAYS
} from '@/lib/business-rules'

// GET /api/rentals - Get user's rentals
export async function GET() {
  try {
    await auth.protect()
    const { userId } = await auth()

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const rentals = await prisma.rental.findMany({
      where: { userId: user.id },
      include: {
        item: true
      },
      orderBy: { rentedAt: 'desc' }
    })

    return NextResponse.json(rentals)
  } catch (error) {
    console.error('Error fetching rentals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rentals' },
      { status: 500 }
    )
  }
}

// POST /api/rentals - Create new rental
export async function POST(request: NextRequest) {
  try {
    await auth.protect()
    const { userId } = await auth()
    const body = await request.json()

    const {
      itemId,
      rentalDays = 7,
      additionalFee = 0 // For premium items
    } = body

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    // Get user and membership info
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has paid deposit
    if (!user.depositPaid) {
      return NextResponse.json(
        { error: 'Deposit payment required before renting items' },
        { status: 400 }
      )
    }

    // Get item info
    const item = await prisma.clothingItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    if (!item.available) {
      return NextResponse.json(
        { error: 'Item is not available for rent' },
        { status: 400 }
      )
    }

    // Check if user is at their rental limit
    if (user.itemsCurrentlyRented >= user.maxItemsAllowed) {
      return NextResponse.json(
        { error: 'You have reached your maximum rental limit' },
        { status: 400 }
      )
    }

    // Calculate rental fee
    const baseFee = additionalFee || 0 // Many items are 0Ġ, premium items have additional fees
    const totalFee = calculateRentalFee(
      baseFee,
      user.itemsCurrentlyRented + 1, // +1 for this new rental
      user.membershipTier,
      user.trustLevel
    )

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + rentalDays)

    // Create rental transaction
    const rental = await prisma.rental.create({
      data: {
        userId: user.id,
        itemId,
        dueDate,
        status: 'active'
      }
    })

    // Create Glitcoin transaction for rental fee
    if (totalFee > 0) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: user.id,
          amount: -totalFee, // Negative for debit
          type: 'rental',
          description: `Rental fee for ${item.name}`,
          reference: rental.id
        }
      })
    }

    // Update item availability
    await prisma.clothingItem.update({
      where: { id: itemId },
      data: { available: false }
    })

    // Update user's current rentals count
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { itemsCurrentlyRented: user.itemsCurrentlyRented + 1 }
    })

    return NextResponse.json({
      message: 'Rental created successfully',
      rental,
      fee: totalFee
    })
  } catch (error) {
    console.error('Error creating rental:', error)
    return NextResponse.json(
      { error: 'Failed to create rental' },
      { status: 500 }
    )
  }
}

// PUT /api/rentals/[id]/return - Return an item
export async function PUT(request: NextRequest) {
  try {
    await auth.protect()
    const { userId } = await auth()

    const url = new URL(request.url)
    const rentalId = url.pathname.split('/').pop()

    if (!rentalId) {
      return NextResponse.json(
        { error: 'Rental ID is required' },
        { status: 400 }
      )
    }

    const rental = await prisma.rental.findUnique({
      where: { id: rentalId },
      include: { item: true, user: true }
    })

    if (!rental || rental.user.clerkUserId !== userId) {
      return NextResponse.json(
        { error: 'Rental not found' },
        { status: 404 }
      )
    }

    if (rental.status !== 'active') {
      return NextResponse.json(
        { error: 'Rental is not active' },
        { status: 400 }
      )
    }

    const returnDate = new Date()
    const daysOverdue = Math.max(0, Math.floor((returnDate.getTime() - rental.dueDate.getTime()) / (1000 * 60 * 60 * 24)))

    // Calculate late fees if overdue
    let lateFees = 0
    if (daysOverdue > LATE_FEE_START_DAYS) {
      lateFees = calculateLateFees(daysOverdue, rental.item.lustLostPrice)
    }

    // Update rental status
    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        returnedAt: returnDate,
        status: 'returned',
        lateFees
      }
    })

    // Create late fee transaction if applicable
    if (lateFees > 0) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: rental.user.id,
          amount: -lateFees,
          type: 'fee',
          description: `Late fee for ${rental.item.name}`,
          reference: rentalId
        }
      })
    }

    // Update item availability
    await prisma.clothingItem.update({
      where: { id: rental.itemId },
      data: { available: true }
    })

    // Update user's rental count
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { itemsCurrentlyRented: rental.user.itemsCurrentlyRented - 1 }
    })

    return NextResponse.json({
      message: 'Item returned successfully',
      rental: updatedRental,
      lateFees
    })
  } catch (error) {
    console.error('Error returning rental:', error)
    return NextResponse.json(
      { error: 'Failed to return rental' },
      { status: 500 }
    )
  }
}