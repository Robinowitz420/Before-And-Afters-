'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

function getVibeImageSrc(vibe: string): string {
  const slug = vibe.toLowerCase().replace(/\s+/g, '-')
  return `${encodeURI('/images/Vibe Buttons')}/${slug}.jpg`
}

const TONE_IMAGES: Record<string, string> = {
  'Dark': 'Dark.jpg',
  'Dark Hues': 'DarkHues.jpg',
  'Light': 'Light.jpg',
  'Gothic': 'Gothic.jpg',
  'Muted': 'Muted.jpg',
  'Soft Contrast': 'Soft Contrast.jpg',
  'High Contrast': 'High contrast.jpg',
  'Bold': 'BOLD.jpg',
  'Metallic': 'Metallic.jpg',
  'Monochromatic': 'Monochromatic.jpg',
}

function getToneImageSrc(tone: string): string {
  const base = encodeURI('/images/ColorTones')
  const filename = TONE_IMAGES[tone] ?? `${tone.replace(/\s+/g, '-')}.jpg`
  return `${base}/${encodeURIComponent(filename)}`
}

function getEraImageSrc(era: string): string {
  const slug = era.toLowerCase().replace(/\s+/g, '-')
  return `${encodeURI('/images/Era Buttons/B')}/${slug}.jpg`
}

const GARMENT_TYPE_IMAGES: Record<string, string> = {
  'Tops': 'Tops.jpg',
  'Bottoms': 'Bottoms.jpg',
  'Dresses': 'Dresses.jpg',
  'Jumpsuits & Rompers': 'Jumpsuitsandrompers.jpg',
  'Outerwear': 'outerwear.jpg',
  'Activewear': 'activewear.jpg',
  'Swimwear': 'swimwear.jpg',
  'Shoes': 'shoes.jpg',
  'Accessories': 'accessories.jpg',
}

function getGarmentTypeImageSrc(type: string): string {
  const base = encodeURI('/images/Garment Type Buttons')
  const filename = GARMENT_TYPE_IMAGES[type] ?? `${type.toLowerCase().replace(/\s+/g, '-')}.jpg`
  return `${base}/${filename}`
}

const POCKETS = [
  'No Pockets',
  'Patch Pockets',
  'Slash Pockets',
  'Welt Pockets',
  'Kangaroo Pocket',
  'Cargo Pockets',
  'Hidden Pockets',
  'Zippered Pockets',
] as const

const POCKET_IMAGES: Record<string, string> = {
  'No Pockets': 'AAAAAAAAAA_r2_c2_processed_by_imagy.jpg',
  'Patch Pockets': 'AAAAAAAAAA_r2_c3_processed_by_imagy.jpg',
  'Slash Pockets': 'AAAAAAAAAA_r2_c4_processed_by_imagy.jpg',
  'Welt Pockets': 'AAAAAAAAAA_r2_c5_processed_by_imagy.jpg',
  'Kangaroo Pocket': 'AAAAAAAAAA_r3_c2_processed_by_imagy.jpg',
  'Cargo Pockets': 'AAAAAAAAAA_r3_c3_processed_by_imagy.jpg',
  'Hidden Pockets': 'AAAAAAAAAA_r3_c4_processed_by_imagy.jpg',
  'Zippered Pockets': 'AAAAAAAAAA_r3_c5_processed_by_imagy.jpg',
}

function getPocketImageSrc(pocket: string): string {
  const base = encodeURI('/images/PocketsButtons')
  const filename = POCKET_IMAGES[pocket] ?? `${pocket.toLowerCase().replace(/\s+/g, '-')}.jpg`
  return `${base}/${encodeURIComponent(filename)}`
}

const ENCLOSURES = [
  'Buttons',
  'Zipper',
  'Snaps',
  'Hooks & Eyes',
  'Laces',
  'Velcro',
  'Buckles',
  'Ties',
  'Toggles',
  'Magnetic Closure',
  'Pull-On',
] as const

const ENCLOSURE_IMAGES: Record<string, string> = {
  'Buttons': 'AAAAAAAAAA_r2_c2_processed_by_imagy.jpg',
  'Zipper': 'AAAAAAAAAA_r2_c3_processed_by_imagy.jpg',
  'Snaps': 'AAAAAAAAAA_r2_c4_processed_by_imagy.jpg',
  'Hooks & Eyes': 'AAAAAAAAAA_r2_c5_processed_by_imagy.jpg',
  'Laces': 'AAAAAAAAAA_r3_c2_processed_by_imagy.jpg',
  'Velcro': 'AAAAAAAAAA_r3_c3_processed_by_imagy.jpg',
  'Buckles': 'AAAAAAAAAA_r3_c4_processed_by_imagy.jpg',
  'Ties': 'AAAAAAAAAA_r3_c5_processed_by_imagy.jpg',
  'Toggles': 'AAAAAAAAAA_r4_c2_processed_by_imagy.jpg',
  'Magnetic Closure': 'AAAAAAAAAA_r4_c3_processed_by_imagy.jpg',
  'Pull-On': 'AAAAAAAAAA_r4_c4_processed_by_imagy.jpg',
}

function getEnclosureImageSrc(enclosure: string): string {
  const base = encodeURI('/images/EnclosureButtons')
  const filename = ENCLOSURE_IMAGES[enclosure] ?? `${enclosure.toLowerCase().replace(/\s+/g, '-')}.jpg`
  return `${base}/${encodeURIComponent(filename)}`
}

interface SearchPreferences {
  tones: string[]
  vibes: string[]
  eras: string[]
  sizes: string[]
  garmentTypes: string[]
  pockets: string[]
  enclosures: string[]
}

const TONES = [
  'Dark',
  'Dark Hues',
  'Light',
  'Gothic',
  'Muted',
  'Soft Contrast',
  'High Contrast',
  'Bold',
  'Metallic',
  'Monochromatic',
] as const

const ERAS = ['60s', '70s', '80s', '90s', 'Y2K', '2010s', 'Contemporary'] as const

const VIBES = [
  'Romantic',
  'Goth',
  'Avant-garde',
  'Minimal',
  'Maximal',
  'Vintage',
  'Futurist',
  'Party',
  'Office',
  'Formal',
  'Casual',
  'Loungewear',
  'Performance',
  'Soft',
  'Hard',
  'Playful',
  'Sexy',
  'Cozy',
  'Powerful',
  'Cowgirl',
  'Sacred',
  'Androgynous',
  'Street',
  'Grandpa',
  'Daddy',
  'Classic',
  'Gentleman',
  'Sleepover',
  'Nautical',
  'Main Character',
  'Trendy',
  'Glam',
  'Club Kid',
  'Boss Bitch',
  'Cunt',
  'Acid Trip',
  'Cougar',
  'Y2K',
  'Showgirl',
  'Edgy',
  'Preppy',
  'Bohemian',
  'Athletic',
  'Corporate',
  'Grunge',
  'Ethereal',
  'Punk',
  'Luxury',
  'Artsy',
  'Retro',
  'Tomboy',
  'Baddie',
  'Clean Girl',
  'Cottage Core',
  'Dark Academia',
] as const

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Varies'] as const

const SIZE_IMAGES: Record<string, string> = {
  'XS': 'XS.jpg',
  'S': 'S.jpg',
  'M': 'M.jpg',
  'L': 'L.jpg',
  'XL': 'XL.jpg',
  'XXL': 'XXL.jpg',
  'Varies': 'Varies.jpg',
}

function getSizeImageSrc(size: string): string {
  const filename = SIZE_IMAGES[size] ?? `${size}.jpg`
  return `/images/SizeButtons/${filename}`
}

/** Size-appropriate dimensions: smaller labels get smaller buttons, scaling up by size. */
function getSizeButtonDimensions(size: string): string {
  const dimensions: Record<string, string> = {
    'XS': 'w-12 h-12 sm:w-14 sm:h-14',
    'S': 'w-14 h-14 sm:w-16 sm:h-16',
    'M': 'w-16 h-16 sm:w-20 sm:h-20',
    'L': 'w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24',
    'XL': 'w-20 h-20 sm:w-24 sm:h-24',
    'XXL': 'w-24 h-24 sm:w-28 sm:h-28',
    'Varies': 'w-16 h-16 sm:w-20 sm:h-20',
  }
  return dimensions[size] ?? 'w-16 h-16 sm:w-20 sm:h-20'
}

const GARMENT_TYPES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Jumpsuits & Rompers',
  'Outerwear',
  'Activewear',
  'Swimwear',
  'Shoes',
  'Accessories',
] as const

const STORAGE_KEY = 'cyo_search_preferences_v2'

export default function SearchPage() {
  const router = useRouter()
  const [preferences, setPreferences] = useState<SearchPreferences>({
    tones: [],
    vibes: [],
    eras: [],
    sizes: [],
    garmentTypes: [],
    pockets: [],
    enclosures: [],
  })
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    // Load saved preferences
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<SearchPreferences>
        setPreferences({
          tones: parsed.tones ?? [],
          vibes: parsed.vibes ?? [],
          eras: parsed.eras ?? [],
          sizes: parsed.sizes ?? [],
          garmentTypes: parsed.garmentTypes ?? [],
          pockets: parsed.pockets ?? [],
          enclosures: parsed.enclosures ?? [],
        })
      } catch (error) {
        console.error('Error loading search preferences:', error)
      }
    }
  }, [])

  const savePreferences = (newPreferences: SearchPreferences) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences))
    setPreferences(newPreferences)
  }

  const toggleTone = (tone: string) => {
    const newPreferences = {
      ...preferences,
      tones: preferences.tones.includes(tone)
        ? preferences.tones.filter(t => t !== tone)
        : [...preferences.tones, tone]
    }
    savePreferences(newPreferences)
  }

  const toggleVibe = (vibe: string) => {
    const newPreferences = {
      ...preferences,
      vibes: preferences.vibes.includes(vibe)
        ? preferences.vibes.filter(v => v !== vibe)
        : [...preferences.vibes, vibe]
    }
    savePreferences(newPreferences)
  }

  const toggleEra = (era: string) => {
    const newPreferences = {
      ...preferences,
      eras: preferences.eras.includes(era)
        ? preferences.eras.filter(e => e !== era)
        : [...preferences.eras, era]
    }
    savePreferences(newPreferences)
  }

  const toggleSize = (size: string) => {
    const newPreferences = {
      ...preferences,
      sizes: preferences.sizes.includes(size)
        ? preferences.sizes.filter(s => s !== size)
        : [...preferences.sizes, size]
    }
    savePreferences(newPreferences)
  }

  const toggleGarmentType = (type: string) => {
    const newPreferences = {
      ...preferences,
      garmentTypes: preferences.garmentTypes.includes(type)
        ? preferences.garmentTypes.filter(g => g !== type)
        : [...preferences.garmentTypes, type]
    }
    savePreferences(newPreferences)
  }

  const togglePocket = (pocket: string) => {
    const newPreferences = {
      ...preferences,
      pockets: preferences.pockets.includes(pocket)
        ? preferences.pockets.filter(p => p !== pocket)
        : [...preferences.pockets, pocket]
    }
    savePreferences(newPreferences)
  }

  const toggleEnclosure = (enclosure: string) => {
    const newPreferences = {
      ...preferences,
      enclosures: preferences.enclosures.includes(enclosure)
        ? preferences.enclosures.filter(e => e !== enclosure)
        : [...preferences.enclosures, enclosure]
    }
    savePreferences(newPreferences)
  }

  const handleSearch = () => {
    // TODO: Implement actual search logic
    setHasSearched(true)
    console.log('Searching with preferences:', preferences)
  }

  const clearAll = () => {
    const cleared = { tones: [], vibes: [], eras: [], sizes: [], garmentTypes: [], pockets: [], enclosures: [] }
    savePreferences(cleared)
    setHasSearched(false)
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 -z-10 bg-[url('/images/checkered-background.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Explore Joni&apos;s Closet
          </h1>
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button
              onClick={handleSearch}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg"
            >
              🔍 Search Clothing
            </Button>
            <Button
              variant="outline"
              onClick={clearAll}
              className="px-6 py-3 bg-black text-white hover:bg-black/80 border-white/20"
            >
              Clear All
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="px-6 py-3 bg-black text-white hover:bg-black/80 border-white/20"
            >
              ← Back to Profile
            </Button>
          </div>
        </div>

        {/* Search Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tones */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Color Tones
              </CardTitle>
              <CardDescription>
                What color palettes resonate with you?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {TONES.map((tone) => {
                  const src = getToneImageSrc(tone)
                  const selected = preferences.tones.includes(tone)
                  return (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => toggleTone(tone)}
                      title={tone}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-purple-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className="relative flex w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md">
                        <Image
                          src={src}
                          alt={tone}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[5rem] leading-tight">
                        {tone}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Eras */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⏰ Style Eras
              </CardTitle>
              <CardDescription>
                Which time periods inspire your style?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {ERAS.map((era) => {
                  const src = getEraImageSrc(era)
                  const selected = preferences.eras.includes(era)
                  return (
                    <button
                      key={era}
                      type="button"
                      onClick={() => toggleEra(era)}
                      title={era}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-indigo-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className="relative flex w-[4.8rem] h-[4.8rem] sm:w-[6rem] sm:h-[6rem] shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md">
                        <Image
                          src={src}
                          alt={era}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[5rem] leading-tight">
                        {era}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Vibes */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✨ Style Vibes
              </CardTitle>
              <CardDescription>
                Choose the vibes that match your personal style energy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {VIBES.map((vibe) => {
                  const src = getVibeImageSrc(vibe)
                  const selected = preferences.vibes.includes(vibe)
                  return (
                    <button
                      key={vibe}
                      type="button"
                      onClick={() => toggleVibe(vibe)}
                      title={vibe}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-pink-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className="relative flex w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md">
                        <Image
                          src={src}
                          alt={vibe}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[5rem] leading-tight">
                        {vibe}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Size */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📏 Size
              </CardTitle>
              <CardDescription>
                Filter by your size(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {SIZES.map((size) => {
                  const src = getSizeImageSrc(size)
                  const selected = preferences.sizes.includes(size)
                  const dims = getSizeButtonDimensions(size)
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      title={size}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-purple-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className={`relative flex shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md ${dims}`}>
                        <Image
                          src={src}
                          alt={size}
                          fill
                          sizes="(max-width: 640px) 56px, 72px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[4rem] leading-tight">
                        {size}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Garment Type */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👗 Garment Type
              </CardTitle>
              <CardDescription>
                What kind of pieces are you looking for?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {GARMENT_TYPES.map((type) => {
                  const src = getGarmentTypeImageSrc(type)
                  const selected = preferences.garmentTypes.includes(type)
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleGarmentType(type)}
                      title={type}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-rose-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className="relative flex w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md">
                        <Image
                          src={src}
                          alt={type}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[5rem] leading-tight">
                        {type}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Pockets */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👖 Pockets
              </CardTitle>
              <CardDescription>
                What pocket styles do you want?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {POCKETS.map((pocket) => {
                  const src = getPocketImageSrc(pocket)
                  const selected = preferences.pockets.includes(pocket)
                  return (
                    <button
                      key={pocket}
                      type="button"
                      onClick={() => togglePocket(pocket)}
                      title={pocket}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-amber-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className="relative flex w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md">
                        <Image
                          src={src}
                          alt={pocket}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[5rem] leading-tight">
                        {pocket}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Enclosures */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔘 Enclosures
              </CardTitle>
              <CardDescription>
                What kinds of closures do you want?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {ENCLOSURES.map((enclosure) => {
                  const src = getEnclosureImageSrc(enclosure)
                  const selected = preferences.enclosures.includes(enclosure)
                  return (
                    <button
                      key={enclosure}
                      type="button"
                      onClick={() => toggleEnclosure(enclosure)}
                      title={enclosure}
                      className={`flex flex-col items-center gap-2 rounded-full transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                        selected ? 'ring-2 ring-sky-600 ring-offset-2 shadow-lg' : ''
                      }`}
                    >
                      <span className="relative flex w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full overflow-hidden bg-gray-100 shadow-md">
                        <Image
                          src={src}
                          alt={enclosure}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </span>
                      <span className="text-xs font-medium text-gray-700 text-center max-w-[5rem] leading-tight">
                        {enclosure}
                      </span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Results Placeholder */}
        {hasSearched && (
          <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>🔍 Search Results</CardTitle>
              <CardDescription>
                Based on your preferences: {[
                  preferences.tones.length && `${preferences.tones.length} tones`,
                  preferences.eras.length && `${preferences.eras.length} eras`,
                  preferences.vibes.length && `${preferences.vibes.length} vibes`,
                  preferences.sizes.length && `${preferences.sizes.length} sizes`,
                  preferences.garmentTypes.length && `${preferences.garmentTypes.length} garment types`,
                  preferences.pockets.length && `${preferences.pockets.length} pockets`,
                  preferences.enclosures.length && `${preferences.enclosures.length} enclosures`
                ].filter(Boolean).join(', ')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔮</div>
                <h3 className="text-xl font-semibold mb-2">Searching the Endless Closet...</h3>
                <p className="text-gray-600 mb-4">
                  We&apos;re finding pieces that match your unique style preferences
                </p>
                <div className="text-sm text-gray-500">
                  (Search functionality will be implemented with the clothing database)
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}