import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { MEMBERSHIP_LEVELS } from '@/types'
import { DEPOSIT_GLITCOIN } from '@/lib/business-rules'

export async function GET() {
  try {
    const { userId } = await auth()

    // Not signed in (or no Clerk session). Treat as "no membership" so the UI can
    // still render the pricing/promotions without throwing.
    if (!userId) {
      return NextResponse.json(null)
    }

    const clerkUser = await currentUser()
    const email = clerkUser?.primaryEmailAddress?.emailAddress
      || clerkUser?.emailAddresses?.[0]?.emailAddress
      || null

    if (!email) {
      return NextResponse.json(null)
    }

    const membership = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        membershipTier: true,
        membershipStartDate: true,
        membershipEndDate: true,
        glitcoinBalance: true,
        itemsCurrentlyRented: true,
        maxItemsAllowed: true,
        trustLevel: true,
        depositPaid: true,
        createdAt: true,
      },
    })

    return NextResponse.json(membership)
  } catch (error) {
    console.error('Error fetching memberships:', error)
    return NextResponse.json(
      { error: 'Failed to fetch memberships' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await auth.protect()
    await auth()

    // Handle both JSON and FormData (for file uploads)
    const contentType = request.headers.get('content-type') || ''
    let body: any = {}

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())

      // Handle file uploads
      if (body.avatar && body.avatar instanceof File) {
        // In a real app, you'd upload to cloud storage and get a URL
        // For now, we'll store as base64 or skip file handling
        body.avatar = 'uploaded-avatar-url' // Placeholder
      }
    } else {
      body = await request.json()
    }

    const {
      email,
      firstName,
      middleName,
      lastName,
      displayName,
      partyNames,
      pronouns,
      phone,
      instagram,
      socialLinks,
      homeAddress,
      homeNeighborhood,
      additionalAddresses,
      styleDescription,
      signatureColor,
      signaturePatterns,
      sizing,
      wardrobeSources,
      favoriteBrands,
      wardrobeSatisfaction,
      makesClothes,
      work,
      artForms,
      borrowingExcitement,
      partyVibe,
      sleepSchedule,
      powerLetter,
      membershipTier
    } = body

    // Validate required fields
    if (!email || !firstName || !lastName || !displayName || !phone || !membershipTier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate membership tier
    if (!Object.keys(MEMBERSHIP_LEVELS).includes(membershipTier)) {
      return NextResponse.json(
        { error: 'Invalid membership tier' },
        { status: 400 }
      )
    }

    const membershipLevel = MEMBERSHIP_LEVELS[membershipTier as keyof typeof MEMBERSHIP_LEVELS]

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Membership already exists for this account' },
        { status: 409 }
      )
    }

    // Create new membership
    const membershipStartDate = new Date()
    const membershipEndDate = new Date()
    membershipEndDate.setFullYear(membershipEndDate.getFullYear() + 1) // 1 year membership

    const newMembership = await prisma.user.create({
      data: {
        // Basic info
        email,
        name: displayName, // Keep name field for backward compatibility
        firstName,
        middleName,
        lastName,
        displayName,
        partyNames: typeof partyNames === 'string' ? partyNames : JSON.stringify(partyNames || []),
        pronouns,

        // Contact
        phone,
        instagram,
        socialLinks: typeof socialLinks === 'string' ? socialLinks : JSON.stringify(socialLinks || []),

        // Addresses
        homeAddress,
        homeNeighborhood,
        additionalAddresses: typeof additionalAddresses === 'string' ? additionalAddresses : JSON.stringify(additionalAddresses || []),

        // Style preferences
        styleDescription,
        signatureColor,
        signaturePatterns: typeof signaturePatterns === 'string' ? signaturePatterns : JSON.stringify(signaturePatterns || []),
        sizing,

        // Shopping habits
        wardrobeSources: typeof wardrobeSources === 'string' ? wardrobeSources : JSON.stringify(wardrobeSources || []),
        favoriteBrands,
        wardrobeSatisfaction: wardrobeSatisfaction ? parseInt(wardrobeSatisfaction) : null,
        makesClothes: makesClothes === 'true' || makesClothes === true,

        // Work & interests
        work,
        artForms: typeof artForms === 'string' ? artForms : JSON.stringify(artForms || []),
        borrowingExcitement,

        // Social preferences
        partyVibe,
        sleepSchedule,
        powerLetter,

        // Membership
        membershipTier,
        membershipStartDate,
        membershipEndDate,
        maxItemsAllowed: membershipLevel.maxItems,
        monthlyFreeGlitcoins: membershipLevel.freeMonthlyGlitcoins,
        glitcoinBalance: 0, // Start with 0, they'll get monthly free coins
        depositPaid: false, // Will be updated when deposit is paid
      },
    })

    // Create initial Glitcoin transactions
    // Membership fee
    await prisma.glitcoinTransaction.create({
      data: {
        userId: newMembership.id,
        amount: -membershipLevel.glitcoinValue, // Negative for debit - membership fee
        type: 'membership',
        description: `Initial ${membershipTier} membership payment`,
      },
    })

    // Deposit (required upfront)
    await prisma.glitcoinTransaction.create({
      data: {
        userId: newMembership.id,
        amount: -DEPOSIT_GLITCOIN, // Negative for debit - deposit
        type: 'fee',
        description: 'Membership deposit payment',
      },
    })

    // Mark deposit as paid
    await prisma.user.update({
      where: { id: newMembership.id },
      data: { depositPaid: true }
    })

    // Add first month's free Glitcoins
    if (membershipLevel.freeMonthlyGlitcoins > 0) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: newMembership.id,
          amount: membershipLevel.freeMonthlyGlitcoins, // Positive for credit
          type: 'bonus',
          description: `Monthly free Glitcoins for ${membershipTier} membership`,
        },
      })
    }

    return NextResponse.json({
      message: 'Membership created successfully! Welcome to the endless closet ✨',
      membership: newMembership,
      charges: {
        membershipFee: membershipLevel.glitcoinValue,
        deposit: DEPOSIT_GLITCOIN,
        total: membershipLevel.glitcoinValue + DEPOSIT_GLITCOIN
      }
    })
  } catch (error) {
    console.error('Error creating membership:', error)
    return NextResponse.json(
      { error: 'Failed to create membership' },
      { status: 500 }
    )
  }
}
