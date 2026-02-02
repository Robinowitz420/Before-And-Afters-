import fs from 'fs'
import path from 'path'

import { TasteTunerClient } from '../taste-tuner/tasteTunerClient'

type ClothingImage = {
  src: string
  category: string
}

function listClothingImages(): ClothingImage[] {
  const publicRoot = path.join(process.cwd(), 'public')
  const clothingRoot = path.join(publicRoot, 'images', 'clothing')

  if (!fs.existsSync(clothingRoot)) return []

  const categories = fs
    .readdirSync(clothingRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)

  const images: ClothingImage[] = []

  for (const category of categories) {
    const categoryDir = path.join(clothingRoot, category)
    if (!fs.existsSync(categoryDir)) continue

    const files = fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((f) => f.isFile())
      .map((f) => f.name)
      .filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name))

    for (const file of files) {
      images.push({
        src: `/images/clothing/${category}/${file}`,
        category,
      })
    }
  }

  // Simple shuffle to avoid "category clumps" (no AI claims, just variety)
  for (let i = images.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = images[i]
    images[i] = images[j]
    images[j] = tmp
  }

  return images
}

export default function ProfilePage() {
  const images = listClothingImages()

  return <TasteTunerClient images={images} />
}
