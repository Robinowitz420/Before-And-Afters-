import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { calculateLostItemFee } from '@/lib/business-rules'

// POST /api/rentals/[id]/lost - Mark item as lost
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await auth.protect()
    const { userId } = await auth()
    const { id: rentalId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
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

    if (rental.status === 'lost') {
      return NextResponse.json(
        { error: 'Item is already marked as lost' },
        { status: 400 }
      )
    }

    // Calculate lost item fee
    const lostFee = calculateLostItemFee(
      rental.item.lustLostPrice,
      rental.item.sentimental || rental.item.designer // Cherished items
    )

    // Update rental status
    const updatedRental = await prisma.rental.update({
      where: { id: rentalId },
      data: {
        status: 'lost',
        lateFees: rental.lateFees + lostFee // Add lost fee to existing late fees
      }
    })

    // Create lost item fee transaction
    await prisma.glitcoinTransaction.create({
      data: {
        userId: rental.user.id,
        amount: -lostFee,
        type: 'fee',
        description: `Lost item fee for ${rental.item.name}`,
        reference: rentalId
      }
    })

    // Update user's rental count
    await prisma.user.update({
      where: { clerkUserId: userId },
      data: { itemsCurrentlyRented: rental.user.itemsCurrentlyRented - 1 }
    })

    return NextResponse.json({
      message: 'Item marked as lost and fee charged',
      rental: updatedRental,
      lostFee,
      totalCharged: lostFee + (rental.lateFees || 0)
    })
  } catch (error) {
    console.error('Error processing lost item:', error)
    return NextResponse.json(
      { error: 'Failed to process lost item' },
      { status: 500 }
    )
  }
}