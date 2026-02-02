#!/usr/bin/env tsx

import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Unsplash API configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const BASE_URL = 'https://api.unsplash.com'

// Clothing categories to search for
const CLOTHING_CATEGORIES = [
  'tops', 'bottoms', 'dresses', 'outerwear', 'shoes',
  'accessories', 'jewelry', 'bags', 'costumes', 'special-occasion'
]

// Search terms for each category
const CATEGORY_SEARCH_TERMS = {
  tops: ['t-shirt', 'blouse', 'sweater', 'shirt', 'tank top'],
  bottoms: ['jeans', 'pants', 'skirt', 'shorts', 'leggings'],
  dresses: ['dress', 'gown', 'maxi dress', 'mini dress', 'cocktail dress'],
  outerwear: ['jacket', 'coat', 'blazer', 'cardigan', 'hoodie'],
  shoes: ['sneakers', 'heels', 'boots', 'sandals', 'flats'],
  accessories: ['hat', 'scarf', 'belt', 'gloves', 'sunglasses'],
  jewelry: ['necklace', 'earrings', 'bracelet', 'ring', 'brooch'],
  bags: ['handbag', 'backpack', 'clutch', 'tote bag', 'wallet'],
  costumes: ['costume', 'halloween costume', 'masquerade', 'themed outfit'],
  'special-occasion': ['wedding dress', 'tuxedo', 'formal wear', 'prom dress']
}

interface UnsplashPhoto {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string
  description: string
}

async function searchUnsplash(query: string, perPage: number = 10): Promise<UnsplashPhoto[]> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY environment variable is required')
  }

  try {
    const response = await axios.get(`${BASE_URL}/search/photos`, {
      params: {
        query,
        per_page: perPage,
        orientation: 'portrait', // Better for clothing items
      },
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    })

    return response.data.results
  } catch (error) {
    console.error(`Error searching for "${query}":`, error.message)
    return []
  }
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    })

    // Process image with sharp to ensure consistent format
    const imageBuffer = await sharp(response.data)
      .jpeg({ quality: 85 })
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .toBuffer()

    await fs.writeFile(filepath, imageBuffer)
    console.log(`✓ Downloaded: ${path.basename(filepath)}`)
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error.message)
  }
}

async function scrapeCategoryImages(category: string, count: number = 5): Promise<void> {
  const searchTerms = CATEGORY_SEARCH_TERMS[category as keyof typeof CATEGORY_SEARCH_TERMS]
  const categoryDir = path.join('public', 'images', 'clothing', category)

  // Ensure directory exists
  await fs.ensureDir(categoryDir)

  console.log(`\n📸 Scraping ${count} images for category: ${category}`)

  let downloadedCount = 0

  for (const term of searchTerms) {
    if (downloadedCount >= count) break

    const photos = await searchUnsplash(`clothing ${term}`, 5)

    for (const photo of photos) {
      if (downloadedCount >= count) break

      const filename = `${category}_${photo.id}.jpg`
      const filepath = path.join(categoryDir, filename)

      // Skip if file already exists
      if (await fs.pathExists(filepath)) {
        console.log(`⏭️  Skipped (exists): ${filename}`)
        downloadedCount++
        continue
      }

      await downloadImage(photo.urls.regular, filepath)
      downloadedCount++

      // Add small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  if (downloadedCount === 0) {
    console.log(`⚠️  No images found for category: ${category}`)
  } else {
    console.log(`✅ Completed ${category}: ${downloadedCount} images`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const category = args[0]
  const count = parseInt(args[1]) || 10

  console.log('🔍 Checking for API key...')
  console.log('UNSPLASH_ACCESS_KEY:', UNSPLASH_ACCESS_KEY ? 'Found' : 'Not found')

  if (!UNSPLASH_ACCESS_KEY) {
    console.error('❌ Error: UNSPLASH_ACCESS_KEY environment variable is required')
    console.log('\n📝 How to get an Unsplash API key:')
    console.log('1. Go to https://unsplash.com/developers')
    console.log('2. Create an account or log in')
    console.log('3. Create a new app')
    console.log('4. Copy your Access Key')
    console.log('5. Create a .env file in the project root:')
    console.log('   UNSPLASH_ACCESS_KEY=your_access_key_here')
    console.log('\n💡 Or run with: UNSPLASH_ACCESS_KEY=your_key npm run scrape-images ...')
    process.exit(1)
  }

  console.log('🧥 Clothing Image Scraper')
  console.log('========================')

  if (category && CLOTHING_CATEGORIES.includes(category)) {
    // Scrape specific category
    await scrapeCategoryImages(category, count)
  } else if (category === 'all') {
    // Scrape all categories
    for (const cat of CLOTHING_CATEGORIES) {
      await scrapeCategoryImages(cat, count)
    }
  } else {
    console.log('❌ Invalid category. Available categories:')
    console.log('  - all (scrape all categories)')
    CLOTHING_CATEGORIES.forEach(cat => console.log(`  - ${cat}`))
    console.log('\nUsage:')
    console.log('  npm run scrape-images <category> [count]')
    console.log('  npm run scrape-images all 5')
    console.log('  npm run scrape-images dresses 10')
    process.exit(1)
  }

  console.log('\n🎉 Image scraping completed!')
  console.log('Images saved to: public/images/clothing/')
}

main().catch(console.error)
