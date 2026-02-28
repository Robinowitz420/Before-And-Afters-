import { PrismaClient } from '@prisma/client'
import { MEMBERSHIP_LEVELS } from '../src/types'

const prisma = new PrismaClient()

// Mock data generators
const firstNames = ['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Quinn', 'Avery', 'Cameron', 'Sam', 'Drew', 'Jamie', 'Parker', 'Hayden', 'Kennedy', 'Bailey', 'Reese', 'Charlie', 'Sage', 'Finley']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
const neighborhoods = ['Williamsburg', 'Bushwick', 'Park Slope', 'Greenpoint', 'Bed-Stuy', 'Crown Heights', 'Fort Greene', 'Red Hook', 'DUMBO', 'Gowanus', 'Prospect Heights', 'Clinton Hill', 'East Village', 'Lower East Side', 'Soho', 'Chelsea', 'West Village', 'Harlem', 'Astoria', 'Long Island City']
const brands = ['Prada', 'Gucci', 'Versace', 'Chanel', 'Dior', 'Louis Vuitton', 'Balenciaga', 'Saint Laurent', 'Givenchy', 'Valentino', 'Alexander McQueen', 'Burberry', 'Fendi', 'Moschino', 'Dolce & Gabbana', 'Off-White', 'Supreme', 'Vetements', 'Acne Studios', 'Issey Miyake']
const categories = ['tops', 'bottoms', 'dresses', 'outerwear', 'accessories', 'shoes']
const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'multicolor']
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size']
const conditions = ['excellent', 'good', 'fair', 'poor']
const eventTitles = ['Spring Fashion Show', 'Vintage Swap Meet', 'Designer Sample Sale', 'DIY Workshop', 'Fashion Week Mixer', 'Closet Cleanout Party', 'Style Consultation Day', 'Runway Workshop', 'Textile Art Show', 'Sustainable Fashion Talk', 'Glitter & Gold Gala', 'Backstage Pass Event', 'Member Appreciation Night', 'New Collection Preview', 'Fashion Photography 101']
const eventCategories = ['fashion', 'workshop', 'social', 'sale', 'education', 'art']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 999)}@${randomChoice(domains)}`
}

async function seedUsers(count: number = 50) {
  console.log(`Creating ${count} mock users...`)
  const users = []
  
  for (let i = 0; i < count; i++) {
    const firstName = randomChoice(firstNames)
    const lastName = randomChoice(lastNames)
    const membershipTier = randomChoice(Object.keys(MEMBERSHIP_LEVELS)) as keyof typeof MEMBERSHIP_LEVELS
    const membership = MEMBERSHIP_LEVELS[membershipTier]
    
    // Random membership dates
    const membershipStartDate = randomDate(new Date('2023-01-01'), new Date())
    const membershipEndDate = new Date(membershipStartDate)
    membershipEndDate.setMonth(membershipEndDate.getMonth() + randomInt(1, 12))
    
    const user = await prisma.user.create({
      data: {
        email: generateEmail(firstName, lastName),
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        displayName: randomChoice([`${firstName} the Fabulous`, `${firstName} ${lastName}`, `${firstName}`, null]),
        pronouns: randomChoice(['they/them', 'she/her', 'he/him', 'she/they', 'he/they', null]),
        homeNeighborhood: randomChoice(neighborhoods),
        styleDescription: randomChoice(['Avant-garde', 'Vintage-inspired', 'Minimalist', 'Maximalist', 'Streetwear', 'High fashion', 'Casual chic', 'Bohemian', null]),
        signatureColor: randomChoice(colors),
        membershipTier,
        membershipStartDate,
        membershipEndDate: Math.random() > 0.3 ? membershipEndDate : null, // 30% expired
        glitcoinBalance: randomInt(0, 500),
        itemsCurrentlyRented: 0, // Will be updated after rentals
        maxItemsAllowed: membership.maxItems,
        trustLevel: randomChoice(['new', 'established', 'vip']),
        depositPaid: Math.random() > 0.2, // 80% have paid deposit
        monthlyFreeGlitcoins: membership.freeMonthlyGlitcoins,
        instagram: randomChoice([`@${firstName.toLowerCase()}${lastName.toLowerCase()}`, null]),
        work: randomChoice(['Designer', 'Artist', 'Musician', 'Writer', 'Photographer', 'Stylist', 'Model', 'Creative Director', null]),
        partyVibe: randomChoice(['Wallflower', 'Social butterfly', 'Dance floor king/queen', 'Deep conversations', 'Networker', null]),
        powerLetter: randomChoice(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']),
        createdAt: randomDate(new Date('2023-01-01'), new Date()),
      }
    })
    users.push(user)
  }
  
  console.log(`Created ${users.length} users`)
  return users
}

async function seedClothingItems(count: number = 100) {
  console.log(`Creating ${count} mock clothing items...`)
  const items = []
  
  for (let i = 0; i < count; i++) {
    const category = randomChoice(categories)
    const brand = Math.random() > 0.5 ? randomChoice(brands) : null
    const condition = randomChoice(conditions)
    const isDesigner = brand !== null && ['Prada', 'Gucci', 'Versace', 'Chanel', 'Dior', 'Louis Vuitton', 'Balenciaga', 'Saint Laurent'].includes(brand)
    
    const item = await prisma.clothingItem.create({
      data: {
        name: `${randomChoice(['Vintage', 'Designer', 'Statement', 'Signature', 'Classic', 'Trendy', 'Unique', 'Limited Edition'])} ${brand || randomChoice(['Silk', 'Velvet', 'Leather', 'Denim', 'Cotton', 'Linen', 'Wool'])} ${category.slice(0, -1)}`,
        description: `A stunning ${condition} condition ${category.slice(0, -1)} perfect for any occasion. Features unique design elements and high-quality craftsmanship.`,
        category,
        size: randomChoice(sizes),
        color: randomChoice(colors),
        brand,
        condition,
        rentalPrice: randomInt(0, 20), // 0-20 Glitcoin
        lustLostPrice: randomInt(50, 500), // 50-500 Glitcoin
        images: JSON.stringify([`/images/items/${category}_${i}.jpg`]),
        tags: JSON.stringify([category, randomChoice(colors), brand, condition, isDesigner ? 'designer' : null].filter(Boolean)),
        available: Math.random() > 0.3, // 70% available
        dryCleanOnly: Math.random() > 0.7,
        designer: isDesigner,
        sentimental: Math.random() > 0.9, // 10% cherished items
        createdAt: randomDate(new Date('2023-01-01'), new Date()),
      }
    })
    items.push(item)
  }
  
  console.log(`Created ${items.length} clothing items`)
  return items
}

async function seedRentals(users: any[], items: any[], count: number = 150) {
  console.log(`Creating ${count} mock rentals...`)
  const rentals = []
  
  const availableItems = items.filter(item => item.available)
  
  for (let i = 0; i < count; i++) {
    const user = randomChoice(users)
    const item = randomChoice(availableItems)
    
    const rentedAt = randomDate(new Date('2024-01-01'), new Date())
    const dueDate = new Date(rentedAt)
    dueDate.setDate(dueDate.getDate() + randomInt(7, 30))
    
    // Determine status
    const statusRandom = Math.random()
    let status: string
    let returnedAt: Date | null = null
    let lateFees = 0
    
    if (statusRandom < 0.4) {
      status = 'active'
    } else if (statusRandom < 0.7) {
      status = 'returned'
      returnedAt = new Date(rentedAt)
      returnedAt.setDate(returnedAt.getDate() + randomInt(5, 35))
      
      // Calculate late fees if overdue
      if (returnedAt > dueDate) {
        const daysOverdue = Math.floor((returnedAt.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysOverdue > 3) {
          lateFees = Math.min(daysOverdue - 3, 7) * 25 + Math.max(0, daysOverdue - 10) * 50
        }
      }
    } else if (statusRandom < 0.85) {
      status = 'overdue'
      dueDate.setDate(dueDate.getDate() - randomInt(1, 14)) // Past due
      lateFees = randomInt(25, 200)
    } else {
      status = 'lost'
      lateFees = item.lustLostPrice
    }
    
    const rental = await prisma.rental.create({
      data: {
        userId: user.id,
        itemId: item.id,
        rentedAt,
        dueDate,
        returnedAt,
        extendedCount: status === 'active' || status === 'overdue' ? randomInt(0, 2) : 0,
        lateFees,
        status,
        notes: Math.random() > 0.8 ? randomChoice(['Handle with care', 'Special dry clean only', 'Member favorite', 'Fragile embellishments', null]) : null,
      }
    })
    rentals.push(rental)
    
    // Update item availability if active or overdue
    if (status === 'active' || status === 'overdue') {
      await prisma.clothingItem.update({
        where: { id: item.id },
        data: { available: false }
      })
    }
    
    // Update user's rental count
    await prisma.user.update({
      where: { id: user.id },
      data: { itemsCurrentlyRented: { increment: 1 } }
    })
    
    // Create glitcoin transaction for rental
    if (item.rentalPrice > 0) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: user.id,
          amount: -item.rentalPrice,
          type: 'rental',
          description: `Rental fee for ${item.name}`,
          reference: rental.id,
          timestamp: rentedAt,
        }
      })
    }
    
    // Create glitcoin transaction for late fees
    if (lateFees > 0 && (status === 'returned' || status === 'lost')) {
      await prisma.glitcoinTransaction.create({
        data: {
          userId: user.id,
          amount: -lateFees,
          type: 'fee',
          description: status === 'lost' ? `Lost item fee for ${item.name}` : `Late fee for ${item.name}`,
          reference: rental.id,
          timestamp: returnedAt || new Date(),
        }
      })
    }
  }
  
  console.log(`Created ${rentals.length} rentals`)
  return rentals
}

async function seedReservations(users: any[], items: any[], count: number = 30) {
  console.log(`Creating ${count} mock reservations...`)
  const reservations = []
  
  for (let i = 0; i < count; i++) {
    const user = randomChoice(users)
    const item = randomChoice(items)
    
    const reservedAt = randomDate(new Date('2024-01-01'), new Date())
    const expiresAt = new Date(reservedAt)
    expiresAt.setHours(expiresAt.getHours() + 24) // 24 hour reservation
    
    const status = Math.random() > 0.5 ? 'confirmed' : randomChoice(['pending', 'cancelled', 'expired'])
    
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        itemId: item.id,
        reservedAt,
        expiresAt,
        status,
      }
    })
    reservations.push(reservation)
  }
  
  console.log(`Created ${reservations.length} reservations`)
  return reservations
}

async function seedEvents(count: number = 20) {
  console.log(`Creating ${count} mock events...`)
  const events = []
  
  for (let i = 0; i < count; i++) {
    const startTime = randomDate(new Date('2024-03-01'), new Date('2024-12-31'))
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + randomInt(2, 8))
    
    const maxParticipants = Math.random() > 0.3 ? randomInt(10, 100) : null
    const glitcoinCost = Math.random() > 0.7 ? randomInt(5, 50) : null
    
    const event = await prisma.event.create({
      data: {
        title: randomChoice(eventTitles),
        description: `Join us for an exciting ${randomChoice(eventCategories)} event! Experience fashion, creativity, and community in a unique setting.`,
        startTime,
        endTime,
        location: randomChoice(['before_and_afters', 'dorothy_bus']),
        maxParticipants,
        currentParticipants: maxParticipants ? randomInt(0, maxParticipants) : randomInt(5, 50),
        membershipRequired: Math.random() > 0.3,
        glitcoinCost,
        category: randomChoice(eventCategories),
        host: randomChoice([`${randomChoice(firstNames)} ${randomChoice(lastNames)}`, null]),
        createdAt: randomDate(new Date('2023-01-01'), new Date()),
      }
    })
    events.push(event)
  }
  
  console.log(`Created ${events.length} events`)
  return events
}

async function seedEventParticipations(users: any[], events: any[]) {
  console.log('Creating event participations...')
  let count = 0
  
  for (const event of events) {
    const participantCount = randomInt(0, Math.min(event.currentParticipants, users.length))
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random())
    const participants = shuffledUsers.slice(0, participantCount)
    
    for (const user of participants) {
      await prisma.eventParticipation.create({
        data: {
          eventId: event.id,
          userId: user.id,
          joinedAt: randomDate(event.createdAt, event.startTime),
        }
      })
      count++
    }
  }
  
  console.log(`Created ${count} event participations`)
}

async function seedAdditionalTransactions(users: any[], count: number = 200) {
  console.log(`Creating ${count} additional mock transactions...`)
  
  for (let i = 0; i < count; i++) {
    const user = randomChoice(users)
    const type = randomChoice(['purchase', 'membership', 'refund', 'bonus'])
    const isCredit = type === 'refund' || type === 'bonus' || Math.random() > 0.5
    const amount = isCredit ? randomInt(10, 100) : -randomInt(10, 100)
    
    await prisma.glitcoinTransaction.create({
      data: {
        userId: user.id,
        amount,
        type,
        description: `${type === 'purchase' ? 'Item purchase' : type === 'membership' ? 'Membership upgrade' : type === 'refund' ? 'Refund processed' : 'Bonus Glitcoins'}`,
        timestamp: randomDate(new Date('2024-01-01'), new Date()),
      }
    })
  }
  
  console.log(`Created ${count} additional transactions`)
}

async function clearExistingData() {
  console.log('Clearing existing mock data...')
  
  // Delete in order to respect foreign key constraints
  await prisma.eventParticipation.deleteMany()
  await prisma.event.deleteMany()
  await prisma.glitcoinTransaction.deleteMany()
  await prisma.rental.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.clothingItem.deleteMany()
  await prisma.user.deleteMany({
    where: {
      clerkUserId: null // Only delete mock users (not real Clerk users)
    }
  })
  
  console.log('Existing data cleared')
}

async function main() {
  try {
    console.log('🌱 Starting database seeding...\n')
    
    // Clear existing mock data first (optional - comment out if you want to keep existing)
    await clearExistingData()
    
    // Create mock data
    const users = await seedUsers(50)
    const items = await seedClothingItems(100)
    const rentals = await seedRentals(users, items, 150)
    const reservations = await seedReservations(users, items, 30)
    const events = await seedEvents(20)
    await seedEventParticipations(users, events)
    await seedAdditionalTransactions(users, 200)
    
    console.log('\n✅ Database seeding completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   Users: ${users.length}`)
    console.log(`   Clothing Items: ${items.length}`)
    console.log(`   Rentals: ${rentals.length}`)
    console.log(`   Reservations: ${reservations.length}`)
    console.log(`   Events: ${events.length}`)
    console.log(`   Glitcoin Transactions: 350+`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
