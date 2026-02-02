import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌟 Seeding sample data...')

  // Create sample clothing items
  const clothingItems = [
    {
      name: 'Magical Purple Dress',
      description: 'A flowing purple dress that holds the energy of transformation',
      category: 'dresses',
      size: 'M',
      color: 'Purple',
      condition: 'excellent',
      rentalPrice: 8, // 8 Glitcoin = $40
      lustLostPrice: 200, // 200 Glitcoin = $1000
      images: JSON.stringify(['/placeholder-dress.jpg']),
      tags: JSON.stringify(['magical', 'transformation', 'purple', 'flowy']),
      sentimental: true,
    },
    {
      name: 'Golden Crown Jewelry Set',
      description: 'Designer crown and necklace set for your inner royalty',
      category: 'jewelry',
      size: 'one-size',
      color: 'Gold',
      condition: 'excellent',
      rentalPrice: 12, // 12 Glitcoin = $60
      lustLostPrice: 300, // 300 Glitcoin = $1500
      images: JSON.stringify(['/placeholder-jewelry.jpg']),
      tags: JSON.stringify(['crown', 'gold', 'designer', 'royal']),
      designer: true,
    },
    {
      name: 'Rainbow Tutu Skirt',
      description: 'Perfect for magical gatherings and costume parties',
      category: 'bottoms',
      size: 'L',
      color: 'Rainbow',
      condition: 'good',
      rentalPrice: 5, // 5 Glitcoin = $25
      lustLostPrice: 50, // 50 Glitcoin = $250
      images: JSON.stringify(['/placeholder-tutu.jpg']),
      tags: JSON.stringify(['tutu', 'rainbow', 'party', 'magical']),
    },
  ]

  for (const item of clothingItems) {
    await prisma.clothingItem.create({
      data: item,
    })
    console.log(`👗 Added clothing item: ${item.name}`)
  }

  console.log('🎉 Seeding complete! Your magical clothing rental platform is ready.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
