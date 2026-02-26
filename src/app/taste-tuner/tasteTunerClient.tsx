'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useUser, UserButton } from '@clerk/nextjs'
import * as Dialog from '@radix-ui/react-dialog'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function SelectedChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1.5 text-sm',
        'bg-primary text-primary-foreground shadow-[0_8px_18px_hsl(var(--primary)/0.18)]'
      )}
    >
      {children}
    </span>
  )
}

function MutedChip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1.5 text-sm',
        'border-[color:var(--brand-border-hex)] text-[hsl(var(--ink))]'
      )}
    >
      {children}
    </span>
  )
}

function TogglePill({
  selected,
  onClick,
  children,
}: {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        selected
          ? 'border-transparent bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.22)]'
          : 'border-[color:var(--brand-border-hex)] bg-transparent text-[hsl(var(--ink))] hover:border-[hsl(var(--ink))/0.28]'
      )}
    >
      {children}
    </button>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm text-[hsl(var(--ink))] outline-none placeholder:text-[hsl(var(--ink))]/50 focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    />
  )
}

function ToggleSwitch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="flex items-center justify-between gap-3 rounded-xl border border-[hsl(var(--border))] bg-white/40 px-4 py-3"
    >
      <span className="text-sm font-medium text-[hsl(var(--ink))]">{label}</span>
      <span
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
          checked ? 'border-transparent bg-primary' : 'border-[color:var(--brand-border-hex)] bg-[hsl(var(--secondary))] '
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
        />
      </span>
    </button>
  )
}

type ClothingImage = {
  src: string
  category: string
}

async function fetchProfile(): Promise<WizardProfile | null> {
  const res = await fetch('/api/profile', {
    method: 'GET',
    headers: { 'content-type': 'application/json' },
  })

  if (res.status === 401) {
    return null
  }

  if (!res.ok) {
    return null
  }

  const payload = (await res.json()) as { data?: unknown } | null
  if (!payload?.data || typeof payload.data !== 'object') return null
  return payload.data as WizardProfile
}

async function saveProfile(next: WizardProfile): Promise<WizardProfile> {
  const res = await fetch('/api/profile', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(next ?? {}),
  })

  if (!res.ok) {
    throw new Error('Failed to save profile')
  }

  const payload = (await res.json()) as { data?: unknown } | null
  if (!payload?.data || typeof payload.data !== 'object') return next
  return payload.data as WizardProfile
}

type WizardProfile = {
  displayName?: string
  avatar?: string
  tones?: string[]
  vibes?: string[]
  eras?: string[]
}

type CatalogueGarmentCard = {
  id: string
  name?: string | null
  brand?: string | null
  category?: string | null
  size?: string | null
  availabilityStatus?: string
  primaryPhotoUrl?: string | null
  photoUrls?: string[]
  tags?: Record<string, unknown>
}

type CatalogueListResponse = {
  data: CatalogueGarmentCard[]
  nextCursor?: string | null
}

type CatalogueDetailResponse = {
  data: CatalogueGarmentCard & Record<string, unknown>
}

type CatalogueAlternativeResponse = {
  data: CatalogueGarmentCard[]
}

type TasteTunerSave = {
  likes: string[]
  dislikes: string[]
}

const STORAGE_KEY = 'cyo_taste_tuner_v1'
const RESERVED_KEY = 'cyo_reserved_v1'
const REQUESTED_KEY = 'cyo_requested_v1'
const RESERVATION_TOKEN_KEY = 'cyo_reservation_token_v1'

function readStringArray(key: string): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}

function writeStringArray(key: string, value: string[]) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function getReservationToken(): string {
  if (typeof window === 'undefined' || !window.localStorage) return 'anon'
  const existing = window.localStorage.getItem(RESERVATION_TOKEN_KEY)
  if (existing && existing.trim()) return existing
  const token =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`
  window.localStorage.setItem(RESERVATION_TOKEN_KEY, token)
  return token
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

const VIBES_GROUPS = [
  {
    title: 'Core',
    options: ['Romantic', 'Goth', 'Avant-garde', 'Minimal', 'Maximal', 'Vintage', 'Futurist'] as const,
  },
  {
    title: 'Contexts',
    options: ['Party', 'Office', 'Formal', 'Casual', 'Loungewear', 'Performance'] as const,
  },
  {
    title: 'Energy',
    options: ['Soft', 'Hard', 'Playful', 'Sexy', 'Cozy', 'Powerful'] as const,
  },
  {
    title: 'Personas',
    options: ['Cowgirl', 'Sacred', 'Androgynous', 'Street', 'Grandpa', 'Daddy'] as const,
  },
  {
    title: 'Archetypes',
    options: ['Classic', 'Gentleman', 'Sleepover', 'Nautical', 'Main Character'] as const,
  },
  {
    title: 'Attitude',
    options: ['Trendy', 'Glam', 'Club Kid', 'Boss Bitch', 'Cunt'] as const,
  },
  {
    title: 'Wildcards',
    options: ['Acid Trip', 'Cougar', 'Y2K', 'Showgirl'] as const,
  },
] as const

const ALL_VIBES = VIBES_GROUPS.flatMap((g) => g.options)
const ALLOWED_VIBES_SET = new Set<string>(ALL_VIBES as readonly string[])

function readTasteSave(): TasteTunerSave {
  if (typeof window === 'undefined' || !window.localStorage) return { likes: [], dislikes: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { likes: [], dislikes: [] }
    const parsed = JSON.parse(raw) as Partial<TasteTunerSave>
    return {
      likes: Array.isArray(parsed.likes) ? parsed.likes.filter((v) => typeof v === 'string') : [],
      dislikes: Array.isArray(parsed.dislikes) ? parsed.dislikes.filter((v) => typeof v === 'string') : [],
    }
  } catch {
    return { likes: [], dislikes: [] }
  }
}

function writeTasteSave(save: TasteTunerSave) {
  if (typeof window === 'undefined' || !window.localStorage) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(save))
}

export function TasteTunerClient({ images }: { images: ClothingImage[] }) {
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState<WizardProfile>({})
  const { isLoaded, isSignedIn, user } = useUser()
  const router = useRouter()

  const [catalogueItems, setCatalogueItems] = useState<CatalogueGarmentCard[]>([])
  const [catalogueLoading, setCatalogueLoading] = useState(true)
  const [catalogueError, setCatalogueError] = useState<string | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editSection, setEditSection] = useState<'tones' | 'vibes' | 'eras' | null>(null)
  const [draftTones, setDraftTones] = useState<string[]>([])
  const [draftVibes, setDraftVibes] = useState<string[]>([])
  const [draftEras, setDraftEras] = useState<string[]>([])
  const [vibesOtherEnabled, setVibesOtherEnabled] = useState(false)
  const [vibesOtherText, setVibesOtherText] = useState('')

  const [avatarUploading, setAvatarUploading] = useState(false)

  const [closetOpen, setClosetOpen] = useState(false)
  const [closetItemSrc, setClosetItemSrc] = useState<string | null>(null)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detailGarmentId, setDetailGarmentId] = useState<string | null>(null)
  const [detailGarment, setDetailGarment] = useState<(CatalogueGarmentCard & Record<string, unknown>) | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  const [reservedIds, setReservedIds] = useState<string[]>([])
  const [requestedIds, setRequestedIds] = useState<string[]>([])
  const [reservePopup, setReservePopup] = useState<{ type: 'accepted' | 'unavailable'; message: string; alternatives: CatalogueGarmentCard[] } | null>(null)

  const [browseMode, setBrowseMode] = useState(false)

  const [save, setSave] = useState<TasteTunerSave>({ likes: [], dislikes: [] })
  const [index, setIndex] = useState(0)

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartX = useRef<number | null>(null)

  const usingCatalogue = images.length === 0

  // Group garments by category for browse mode
  const garmentsByCategory = useMemo(() => {
    if (!usingCatalogue) return new Map<string, CatalogueGarmentCard[]>()
    const map = new Map<string, CatalogueGarmentCard[]>()
    for (const g of catalogueItems) {
      const cat = g.category || 'Other'
      const list = map.get(cat) || []
      list.push(g)
      map.set(cat, list)
    }
    return map
  }, [catalogueItems, usingCatalogue])

  const deck = useMemo(() => {
    if (usingCatalogue) {
      const seen = new Set([...save.likes, ...save.dislikes])
      const filtered = catalogueItems.filter((g) => !seen.has(g.id))
      return filtered.length ? filtered : catalogueItems
    }
    const seen = new Set([...save.likes, ...save.dislikes])
    const filtered = images.filter((img) => !seen.has(img.src))
    return filtered.length ? filtered : images
  }, [catalogueItems, images, save.dislikes, save.likes, usingCatalogue])

  const current = deck[index % Math.max(1, deck.length)] as any

  const currentCard: { id: string; src: string; category: string } | null = useMemo(() => {
    if (!current) return null
    if (usingCatalogue) {
      const g = current as CatalogueGarmentCard
      return {
        id: g.id,
        src: typeof g.primaryPhotoUrl === 'string' && g.primaryPhotoUrl ? g.primaryPhotoUrl : (Array.isArray(g.photoUrls) && g.photoUrls[0] ? g.photoUrls[0] : ''),
        category: typeof g.category === 'string' && g.category ? g.category : 'Garment',
      }
    }
    const img = current as ClothingImage
    return { id: img.src, src: img.src, category: img.category }
  }, [current, usingCatalogue])

  useEffect(() => {
    setMounted(true)
    setSave(readTasteSave())
    setReservedIds(readStringArray(RESERVED_KEY))
    setRequestedIds(readStringArray(REQUESTED_KEY))
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!usingCatalogue) return
    setCatalogueLoading(true)
    setCatalogueError(null)

    fetch('/api/catalog/garments?limit=60', {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as CatalogueListResponse | null
        if (!res.ok || !json || !Array.isArray(json.data)) {
          throw new Error('Failed to load catalogue')
        }
        setCatalogueItems(json.data.filter((g) => g && typeof g.id === 'string' && g.id))
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load catalogue'
        setCatalogueError(msg)
      })
      .finally(() => setCatalogueLoading(false))
  }, [mounted, usingCatalogue])

  useEffect(() => {
    if (!mounted) return
    if (!isLoaded) return

    if (!isSignedIn) return

    fetchProfile()
      .then((data) => {
        if (data) setProfile(data)
      })
      .catch(() => {
        // ignore
      })
  }, [isLoaded, isSignedIn, mounted, user?.id])

  useEffect(() => {
    if (!mounted) return
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent('/profile')}`)
      return
    }

    // Skip wizard redirect when using catalogue mode - allow browsing without completed profile
    if (usingCatalogue) return

    fetchProfile()
      .then((data) => {
        if (!data) router.push('/profile-wizard')
      })
      .catch(() => {
        router.push('/profile-wizard')
      })
  }, [isLoaded, isSignedIn, mounted, router, user?.id, usingCatalogue])

  useEffect(() => {
    if (!mounted) return
    if (!editOpen) return

    const tones = Array.isArray(profile.tones) ? profile.tones.filter((t) => typeof t === 'string') : []
    const vibes = Array.isArray(profile.vibes) ? profile.vibes.filter((v) => typeof v === 'string') : []
    const eras = Array.isArray(profile.eras) ? profile.eras.filter((e) => typeof e === 'string') : []

    setDraftTones(tones)
    setDraftVibes(vibes)
    setDraftEras(eras)

    const hasCustomVibe = vibes.some((v) => !ALLOWED_VIBES_SET.has(v))
    setVibesOtherEnabled(hasCustomVibe)
    setVibesOtherText('')
  }, [editOpen, mounted, profile.eras, profile.tones, profile.vibes])

  useEffect(() => {
    if (!mounted) return
    // Membership fetch removed from this page for now. `/memberships` shows tiers.
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    writeTasteSave(save)
  }, [mounted, save])

  useEffect(() => {
    if (!mounted) return
    writeStringArray(RESERVED_KEY, reservedIds)
  }, [mounted, reservedIds])

  useEffect(() => {
    if (!mounted) return
    writeStringArray(REQUESTED_KEY, requestedIds)
  }, [mounted, requestedIds])

  const openEditor = (section: 'tones' | 'vibes' | 'eras') => {
    setEditSection(section)
    setEditOpen(true)
  }

  const closeEditor = () => {
    setEditOpen(false)
    setEditSection(null)
  }

  const saveEditor = () => {
    if (!editSection) return

    let patch: Partial<WizardProfile> = {}

    if (editSection === 'tones') {
      patch = { tones: draftTones }
    } else if (editSection === 'eras') {
      patch = { eras: draftEras }
    } else {
      patch = {
        vibes: vibesOtherEnabled
          ? draftVibes
          : draftVibes.filter((v) => ALLOWED_VIBES_SET.has(v)),
      }
    }

    const next = { ...(profile || {}), ...patch } as WizardProfile
    setProfile(next)
    saveProfile(next).catch(() => {
      // ignore
    })
    closeEditor()
  }

  const pageName =
    user?.fullName ||
    user?.firstName ||
    (typeof profile.displayName === 'string' && profile.displayName.trim() ? profile.displayName.trim() : null) ||
    'Your profile'

  const closetItem = useMemo(() => {
    if (!closetItemSrc) return null
    if (usingCatalogue) {
      const match = catalogueItems.find((g) => g.id === closetItemSrc)
      const src = match
        ? typeof match.primaryPhotoUrl === 'string' && match.primaryPhotoUrl
          ? match.primaryPhotoUrl
          : Array.isArray(match.photoUrls) && match.photoUrls[0]
            ? match.photoUrls[0]
            : ''
        : ''
      return { src, category: match?.category ?? 'Garment', name: match?.name ?? null, id: closetItemSrc }
    }
    const match = images.find((img) => img.src === closetItemSrc)
    return match || { src: closetItemSrc, category: 'Closet item', id: closetItemSrc }
  }, [catalogueItems, closetItemSrc, images, usingCatalogue])

  const openClosetItem = (idOrSrc: string) => {
    setClosetItemSrc(idOrSrc)
    setClosetOpen(true)
  }

  const closeClosetItem = () => {
    setClosetOpen(false)
    setClosetItemSrc(null)
  }

  const savedItems = useMemo(() => {
    const liked = Array.isArray(save.likes) ? save.likes : []
    return liked.slice(0, 12)
  }, [save.likes])

  const threshold = 140
  const likeIntensity = Math.min(1, Math.max(0, dragX / threshold))
  const dislikeIntensity = Math.min(1, Math.max(0, -dragX / threshold))

  const advance = () => {
    setIndex((i) => i + 1)
    setDragX(0)
    setDragging(false)
    dragStartX.current = null
  }

  const onLike = () => {
    if (!currentCard) return
    setSave((prev) => ({
      likes: prev.likes.includes(currentCard.id) ? prev.likes : [...prev.likes, currentCard.id],
      dislikes: prev.dislikes,
    }))
    advance()
  }

  const onDislike = () => {
    if (!currentCard) return
    setSave((prev) => ({
      likes: prev.likes,
      dislikes: prev.dislikes.includes(currentCard.id) ? prev.dislikes : [...prev.dislikes, currentCard.id],
    }))
    advance()
  }

  const openGarmentDetails = (garmentId: string) => {
    setDetailGarmentId(garmentId)
    setDetailOpen(true)
  }

  useEffect(() => {
    if (!mounted) return
    if (!detailOpen || !detailGarmentId) return
    if (!usingCatalogue) return

    setDetailLoading(true)
    setDetailError(null)
    setDetailGarment(null)

    fetch(`/api/catalog/garments/${encodeURIComponent(detailGarmentId)}`, {
      method: 'GET',
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })
      .then(async (res) => {
        const json = (await res.json().catch(() => null)) as CatalogueDetailResponse | null
        if (!res.ok || !json || !json.data || typeof json.data !== 'object') {
          throw new Error('Failed to load garment')
        }
        setDetailGarment(json.data)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : 'Failed to load garment'
        setDetailError(msg)
      })
      .finally(() => setDetailLoading(false))
  }, [detailGarmentId, detailOpen, mounted, usingCatalogue])

  const reserveCurrent = async (garmentId: string) => {
    if (!usingCatalogue) return
    const token = getReservationToken()

    setReservePopup(null)

    const res = await fetch(`/api/catalog/garments/${encodeURIComponent(garmentId)}/reserve`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ reservationToken: token }),
      cache: 'no-store',
    })

    if (res.ok) {
      setReservedIds((prev) => (prev.includes(garmentId) ? prev : [...prev, garmentId]))
      setRequestedIds((prev) => prev.filter((id) => id !== garmentId))
      setReservePopup({ type: 'accepted', message: 'Reservation accepted', alternatives: [] })
      return
    }

    if (res.status === 409) {
      setRequestedIds((prev) => (prev.includes(garmentId) ? prev : [...prev, garmentId]))

      const altRes = await fetch(`/api/catalog/garments/${encodeURIComponent(garmentId)}/alternatives?limit=3`, {
        method: 'GET',
        headers: { accept: 'application/json' },
        cache: 'no-store',
      })

      let alternatives: CatalogueGarmentCard[] = []
      if (altRes.ok) {
        const json = (await altRes.json().catch(() => null)) as CatalogueAlternativeResponse | null
        if (json && Array.isArray(json.data)) alternatives = json.data
      }

      setReservePopup({
        type: 'unavailable',
        message: 'Sorry, not available at the moment',
        alternatives,
      })

      return
    }

    const raw = await res.text().catch(() => '')
    throw new Error(raw || 'Failed to reserve item')
  }

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    dragStartX.current = e.clientX
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || dragStartX.current === null) return
    const dx = e.clientX - dragStartX.current
    setDragX(dx)
  }

  const onPointerUp = () => {
    if (!dragging) return
    if (dragX > threshold) {
      onLike()
      return
    }
    if (dragX < -threshold) {
      onDislike()
      return
    }
    setDragX(0)
    setDragging(false)
    dragStartX.current = null
  }

  return (
    <div 
      className="min-h-screen w-full"
      style={{
        backgroundImage: "url('/images/Boxes/checkerboard.svg')",
        backgroundSize: '200px 200px',
        backgroundRepeat: 'repeat',
      }}
    >
      <div className="mx-auto w-full max-w-[1600px] px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-6">
        <Link href="/search">
          <button className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white shadow-sm backdrop-blur-md hover:bg-black/40 transition-colors">
            🔍 Search Clothing
          </button>
        </Link>
        <div className="rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white shadow-sm backdrop-blur-md">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      <Dialog.Root open={editOpen} onOpenChange={(open) => (open ? setEditOpen(true) : closeEditor())}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
              'transition-opacity duration-200 ease-out',
              'data-[state=closed]:opacity-0 data-[state=open]:opacity-100'
            )}
          />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[min(900px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
              'rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl',
              'transition-[opacity,transform] duration-200 ease-out will-change-transform',
              'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
              'data-[state=open]:scale-100 data-[state=closed]:scale-95'
            )}
          >
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Edit</div>
                  <div className="mt-1 text-lg font-semibold text-[hsl(var(--ink))]">
                    {editSection === 'tones' ? 'Tones' : editSection === 'vibes' ? 'Vibes' : 'Eras'}
                  </div>
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1 text-sm font-medium text-[hsl(var(--ink))] hover:bg-[hsl(var(--secondary))]"
                  >
                    Close
                  </button>
                </Dialog.Close>
              </div>

              <div className="mt-5 max-h-[min(620px,calc(100vh-14rem))] overflow-y-auto pr-2">
                {editSection === 'tones' ? (
                  <div className="flex flex-wrap gap-2">
                    {TONES.map((tone) => (
                      <TogglePill
                        key={tone}
                        selected={draftTones.includes(tone)}
                        onClick={() =>
                          setDraftTones((prev) =>
                            prev.includes(tone) ? prev.filter((t) => t !== tone) : [...prev, tone]
                          )
                        }
                      >
                        {tone}
                      </TogglePill>
                    ))}
                  </div>
                ) : null}

                {editSection === 'eras' ? (
                  <div className="flex flex-wrap gap-2">
                    {ERAS.map((era) => (
                      <TogglePill
                        key={era}
                        selected={draftEras.includes(era)}
                        onClick={() =>
                          setDraftEras((prev) =>
                            prev.includes(era) ? prev.filter((e) => e !== era) : [...prev, era]
                          )
                        }
                      >
                        {era}
                      </TogglePill>
                    ))}
                  </div>
                ) : null}

                {editSection === 'vibes' ? (
                  <div className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      {VIBES_GROUPS.map((group) => (
                        <div
                          key={group.title}
                          className="rounded-2xl border border-[hsl(var(--border))] bg-white/40 p-4 shadow-sm"
                        >
                          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--ink))]/70">
                            {group.title}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {group.options.map((v) => (
                              <TogglePill
                                key={v}
                                selected={draftVibes.includes(v)}
                                onClick={() =>
                                  setDraftVibes((prev) =>
                                    prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
                                  )
                                }
                              >
                                {v}
                              </TogglePill>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <ToggleSwitch
                        checked={vibesOtherEnabled}
                        onCheckedChange={(checked: boolean) => {
                          setVibesOtherEnabled(checked)
                          if (!checked) {
                            setVibesOtherText('')
                            setDraftVibes((prev) => prev.filter((v) => ALLOWED_VIBES_SET.has(v)))
                          }
                        }}
                        label="Other"
                      />

                      {vibesOtherEnabled ? (
                        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/40 p-4 shadow-sm">
                          <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[hsl(var(--ink))]/70">
                            What’s the other vibe?
                          </div>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <Input
                              value={vibesOtherText}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVibesOtherText(e.target.value)}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  const cleaned = vibesOtherText.trim()
                                  if (!cleaned) return
                                  setDraftVibes((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]))
                                  setVibesOtherText('')
                                }
                              }}
                              placeholder="Type a vibe and add it"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="shrink-0 bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]"
                              onClick={() => {
                                const cleaned = vibesOtherText.trim()
                                if (!cleaned) return
                                setDraftVibes((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]))
                                setVibesOtherText('')
                              }}
                            >
                              Add
                            </Button>
                          </div>

                          {draftVibes.filter((v) => !ALLOWED_VIBES_SET.has(v)).length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {draftVibes
                                .filter((v) => !ALLOWED_VIBES_SET.has(v))
                                .map((v) => (
                                  <TogglePill
                                    key={v}
                                    selected={true}
                                    onClick={() => setDraftVibes((prev) => prev.filter((x) => x !== v))}
                                  >
                                    {v}
                                  </TogglePill>
                                ))}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditor}
                  className="bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]"
                >
                  Cancel
                </Button>
                <Button type="button" onClick={saveEditor}>
                  Save
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={closetOpen} onOpenChange={(open) => (open ? setClosetOpen(true) : closeClosetItem())}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn(
              'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
              'transition-opacity duration-200 ease-out',
              'data-[state=closed]:opacity-0 data-[state=open]:opacity-100'
            )}
          />
          <Dialog.Content
            className={cn(
              'fixed left-1/2 top-1/2 z-50 w-[min(520px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
              'rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl',
              'transition-[opacity,transform] duration-200 ease-out will-change-transform',
              'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
              'data-[state=open]:scale-100 data-[state=closed]:scale-95'
            )}
          >
            <div className="p-5 sm:p-6">
              <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
                <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  {closetItem?.category ?? 'Closet item'}
                </div>
                <Dialog.Close asChild>
                  <button
                    type="button"
                    className="absolute right-4 top-4 z-10 rounded-full border border-white/30 bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur hover:bg-black/70"
                  >
                    Close
                  </button>
                </Dialog.Close>

                <div className="relative aspect-[3/4]">
                  {closetItem?.src ? (
                    <Image
                      src={closetItem.src}
                      alt="Closet item"
                      fill
                      sizes="520px"
                      className="object-cover"
                    />
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]"
                  onClick={() => {
                    const src = closetItemSrc
                    if (!src) return
                    setSave((prev) => {
                      const idOrSrc = closetItemSrc
                      if (!idOrSrc) return prev
                      const inLikes = prev.likes.includes(idOrSrc)
                      const likes = inLikes ? prev.likes.filter((v) => v !== idOrSrc) : prev.likes
                      const dislikes =
                        inLikes || prev.dislikes.includes(idOrSrc) ? prev.dislikes : [...prev.dislikes, idOrSrc]
                      return { likes, dislikes }
                    })
                    closeClosetItem()
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="grid gap-6 lg:grid-cols-[280px,1fr,260px]">
        <aside className="lg:sticky lg:top-6">
          <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-4 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">My Closet</div>
            <div className="mt-1 text-lg font-semibold text-[hsl(var(--ink))]">Liked & Reserved</div>

            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs font-semibold text-[hsl(var(--ink))]">Liked ({save.likes.length})</div>
                {savedItems.length ? (
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {savedItems.slice(0, 8).map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => {
                          if (usingCatalogue) {
                            openGarmentDetails(src)
                            return
                          }
                          openClosetItem(src)
                        }}
                        className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white transition hover:shadow-sm"
                      >
                        <Image
                          src={usingCatalogue ? (catalogueItems.find((g) => g.id === src)?.primaryPhotoUrl ?? '/placeholder.png') : src}
                          alt="Liked"
                          width={80}
                          height={80}
                          className="h-14 w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 rounded-lg border border-dashed border-[hsl(var(--border))] bg-white/50 p-3 text-center text-xs text-muted-foreground">
                    Swipe right to like
                  </div>
                )}
              </div>

              {usingCatalogue ? (
                <div>
                  <div className="text-xs font-semibold text-[hsl(var(--ink))]">Reserved ({reservedIds.length})</div>
                  {reservedIds.length ? (
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {reservedIds.slice(0, 4).map((id) => {
                        const g = catalogueItems.find((x) => x.id === id)
                        const img = g?.primaryPhotoUrl ?? (Array.isArray(g?.photoUrls) ? g?.photoUrls?.[0] : null)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => openGarmentDetails(id)}
                            className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white transition hover:shadow-sm"
                          >
                            {img ? <Image src={img} alt="Reserved" width={80} height={80} className="h-14 w-full object-cover" /> : null}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-dashed border-[hsl(var(--border))] bg-white/50 p-3 text-center text-xs text-muted-foreground">
                      No reserved items
                    </div>
                  )}
                </div>
              ) : null}

              {usingCatalogue ? (
                <div>
                  <div className="text-xs font-semibold text-[hsl(var(--ink))]">Requested ({requestedIds.length})</div>
                  {requestedIds.length ? (
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {requestedIds.slice(0, 4).map((id) => {
                        const g = catalogueItems.find((x) => x.id === id)
                        const img = g?.primaryPhotoUrl ?? (Array.isArray(g?.photoUrls) ? g?.photoUrls?.[0] : null)
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => openGarmentDetails(id)}
                            className="overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-white transition hover:shadow-sm"
                          >
                            {img ? <Image src={img} alt="Requested" width={80} height={80} className="h-14 w-full object-cover" /> : null}
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-lg border border-dashed border-[hsl(var(--border))] bg-white/50 p-3 text-center text-xs text-muted-foreground">
                      No requested items
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <section className="flex flex-col items-start justify-center">
          {/* Mode toggle */}
          {usingCatalogue && !catalogueLoading && !catalogueError ? (
            <div className="mb-4 flex gap-2">
              <Button
                type="button"
                variant={browseMode ? 'outline' : 'default'}
                size="sm"
                onClick={() => setBrowseMode(false)}
                className={!browseMode ? '' : 'bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]'}
              >
                Swipe
              </Button>
              <Button
                type="button"
                variant={browseMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBrowseMode(true)}
                className={browseMode ? '' : 'bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]'}
              >
                Browse All
              </Button>
            </div>
          ) : null}

          <div className="w-full max-w-[520px]">
            {catalogueLoading ? (
              <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-8 text-center shadow-sm">
                <div className="text-lg font-semibold text-[hsl(var(--ink))]">Loading catalogue…</div>
              </div>
            ) : catalogueError ? (
              <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-8 text-center shadow-sm">
                <div className="text-lg font-semibold text-[hsl(var(--ink))]">Failed to load items</div>
                <div className="mt-2 text-sm text-muted-foreground">{catalogueError}</div>
              </div>
            ) : !currentCard || !currentCard.src ? (
              <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-8 text-center shadow-sm">
                <div className="text-lg font-semibold text-[hsl(var(--ink))]">No items found</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Add images to <code className="font-mono">/public/images/clothing</code> and refresh.
                </div>
              </div>
            ) : browseMode ? (
              /* Browse mode - categorized grid */
              <div className="space-y-6">
                {Array.from(garmentsByCategory.entries()).map(([category, items]) => (
                  <div key={category}>
                    <div className="mb-2 text-sm font-semibold text-[hsl(var(--ink))]">{category} <span className="font-normal text-muted-foreground">({items.length})</span></div>
                    <div className="grid grid-cols-3 gap-2">
                      {items.map((g) => {
                        const img = g.primaryPhotoUrl || (Array.isArray(g.photoUrls) ? g.photoUrls[0] : null)
                        if (!img) return null
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => openGarmentDetails(g.id)}
                            className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white text-left transition hover:shadow-md"
                          >
                            <div className="relative aspect-[3/4]">
                              <Image src={img} alt={g.name || 'Garment'} fill sizes="160px" className="object-cover" />
                            </div>
                            <div className="p-2">
                              <div className="text-xs font-medium text-[hsl(var(--ink))] truncate">{g.name || 'Untitled'}</div>
                              {g.brand ? <div className="text-xs text-muted-foreground truncate">{g.brand}</div> : null}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    'relative select-none rounded-3xl border-[3px] border-blue-600 bg-yellow-100 shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
                    'touch-none'
                  )}
                  style={{
                    transform: `translateX(${dragX}px) rotate(${dragX / 18}deg)`,
                    transition: dragging ? 'none' : 'transform 220ms ease',
                  }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <div className="absolute left-4 top-4 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                    {currentCard.category}
                  </div>

                  <div
                    className="pointer-events-none absolute left-6 top-20 z-10 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
                    style={{ opacity: likeIntensity }}
                  >
                    Liked
                  </div>
                  <div
                    className="pointer-events-none absolute right-6 top-20 z-10 rounded-full border border-[hsl(var(--border))] bg-white/90 px-4 py-2 text-sm font-semibold text-[hsl(var(--ink))]"
                    style={{ opacity: dislikeIntensity }}
                  >
                    Not for you
                  </div>

                  <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
                    <button
                      type="button"
                      onClick={() => {
                        if (usingCatalogue) {
                          openGarmentDetails(currentCard.id)
                        }
                      }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={currentCard.src}
                        alt="Clothing item"
                        fill
                        sizes="(max-width: 1024px) 90vw, 520px"
                        className="object-cover"
                        priority
                      />
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onDislike}
                    className="flex-1 bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]"
                  >
                    Not for you
                  </Button>
                  <Button type="button" onClick={onLike} className="flex-1">
                    Like
                  </Button>
                </div>

                {usingCatalogue ? (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]"
                      onClick={() => {
                        if (!currentCard) return
                        reserveCurrent(currentCard.id).catch(() => {
                          // ignore
                        })
                      }}
                    >
                      Reserve item
                    </Button>
                  </div>
                ) : null}

                <div className="mt-4 text-center text-sm text-muted-foreground">Swipe left or right. No wrong answers.</div>
              </>
            )}
          </div>
        </section>

        <Dialog.Root open={detailOpen} onOpenChange={(open) => (open ? setDetailOpen(true) : setDetailOpen(false))}>
          <Dialog.Portal>
            <Dialog.Overlay
              className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                'transition-opacity duration-200 ease-out',
                'data-[state=closed]:opacity-0 data-[state=open]:opacity-100'
              )}
            />
            <Dialog.Content
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-[min(980px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
                'rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl',
                'transition-[opacity,transform] duration-200 ease-out will-change-transform',
                'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
                'data-[state=open]:scale-100 data-[state=closed]:scale-95'
              )}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Garment</div>
                    <div className="mt-1 text-lg font-semibold text-[hsl(var(--ink))]">
                      {detailGarment?.name ?? 'Details'}
                    </div>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1 text-sm font-medium text-[hsl(var(--ink))] hover:bg-[hsl(var(--secondary))]"
                    >
                      Close
                    </button>
                  </Dialog.Close>
                </div>

                <div className="mt-5 grid gap-6 md:grid-cols-[360px,1fr]">
                  <div className="relative overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
                    <div className="relative aspect-[3/4]">
                      {detailLoading ? (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">Loading…</div>
                      ) : detailError ? (
                        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">{detailError}</div>
                      ) : detailGarment ? (
                        <Image
                          src={
                            (typeof detailGarment.primaryPhotoUrl === 'string' && detailGarment.primaryPhotoUrl) ||
                            (Array.isArray(detailGarment.photoUrls) && detailGarment.photoUrls[0] ? detailGarment.photoUrls[0] : '')
                          }
                          alt={detailGarment.name ?? 'Garment'}
                          fill
                          sizes="360px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/40 p-4">
                      <div className="text-sm font-semibold text-[hsl(var(--ink))]">Details</div>
                      <div className="mt-2 text-sm text-[hsl(var(--ink))]/80">
                        {detailGarment?.brand ? `Brand: ${detailGarment.brand}` : null}
                        {detailGarment?.size ? ` • Size: ${detailGarment.size}` : null}
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {detailGarment?.category ? detailGarment.category : null}
                      </div>
                    </div>

                    <div className="mt-4">
                      {detailGarmentId ? (
                        <Button
                          type="button"
                          className="w-full"
                          onClick={() => {
                            reserveCurrent(detailGarmentId).catch(() => {
                              // ignore
                            })
                          }}
                        >
                          Reserve item
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <Dialog.Root open={Boolean(reservePopup)} onOpenChange={(open) => (!open ? setReservePopup(null) : null)}>
          <Dialog.Portal>
            <Dialog.Overlay
              className={cn(
                'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                'transition-opacity duration-200 ease-out',
                'data-[state=closed]:opacity-0 data-[state=open]:opacity-100'
              )}
            />
            <Dialog.Content
              className={cn(
                'fixed left-1/2 top-1/2 z-50 w-[min(720px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2',
                'rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl',
                'transition-[opacity,transform] duration-200 ease-out will-change-transform',
                'data-[state=open]:opacity-100 data-[state=closed]:opacity-0',
                'data-[state=open]:scale-100 data-[state=closed]:scale-95'
              )}
            >
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-lg font-semibold text-[hsl(var(--ink))]">{reservePopup?.message ?? ''}</div>
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="rounded-full border border-[hsl(var(--border))] bg-white px-3 py-1 text-sm font-medium text-[hsl(var(--ink))] hover:bg-[hsl(var(--secondary))]"
                    >
                      Close
                    </button>
                  </Dialog.Close>
                </div>

                {reservePopup?.type === 'unavailable' ? (
                  <div className="mt-4">
                    <div className="text-sm font-semibold text-[hsl(var(--ink))]">Alternatives</div>
                    {reservePopup.alternatives.length ? (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {reservePopup.alternatives.slice(0, 3).map((g) => {
                          const img = g.primaryPhotoUrl ?? (Array.isArray(g.photoUrls) ? g.photoUrls[0] : null)
                          return (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => {
                                setReservePopup(null)
                                openGarmentDetails(g.id)
                              }}
                              className="overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white text-left hover:shadow-sm"
                            >
                              {img ? <Image src={img} alt={g.name ?? 'Alternative'} width={240} height={320} className="h-28 w-full object-cover" /> : null}
                              <div className="p-2 text-xs text-[hsl(var(--ink))]">{g.name ?? 'View'}</div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="mt-2 text-sm text-muted-foreground">No alternatives found.</div>
                    )}
                  </div>
                ) : null}
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <aside className="lg:sticky lg:top-6">
          <div className="space-y-3">
            <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-4 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Avatar</div>
              <div className="mt-1 text-base font-semibold text-[hsl(var(--ink))]">Profile photo</div>

              <div className="mt-3 flex items-center gap-3">
                <div
                  className="h-20 w-16 shrink-0 overflow-hidden rounded-full border border-[hsl(var(--border))] bg-white"
                >
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt="Avatar"
                      width={64}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No photo</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={avatarUploading}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      setAvatarUploading(true)
                      const reader = new FileReader()
                      reader.onload = () => {
                        const result = typeof reader.result === 'string' ? reader.result : ''
                        if (result) {
                          const next = { ...(profile || {}), avatar: result } as WizardProfile
                          setProfile(next)
                          saveProfile(next).catch(() => {
                            // ignore
                          })
                        }
                        setAvatarUploading(false)
                      }
                      reader.onerror = () => {
                        setAvatarUploading(false)
                      }
                      reader.readAsDataURL(file)
                    }}
                    className="block w-full text-xs text-muted-foreground file:rounded-lg file:border file:border-[hsl(var(--border))] file:bg-white file:px-2 file:py-1 file:text-xs file:font-medium file:text-[hsl(var(--ink))] hover:file:bg-[hsl(var(--secondary))]"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-100 p-4 shadow-sm">
              <div className="text-xs font-medium text-[hsl(var(--ink))]">Not a member?</div>
              <Button asChild className="mt-2 w-full" size="sm">
                <Link href="/memberships">Join here</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </div>
  )
}
