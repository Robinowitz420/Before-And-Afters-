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

type TasteTunerSave = {
  likes: string[]
  dislikes: string[]
}

const STORAGE_KEY = 'cyo_taste_tuner_v1'

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

  const [save, setSave] = useState<TasteTunerSave>({ likes: [], dislikes: [] })
  const [index, setIndex] = useState(0)

  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartX = useRef<number | null>(null)

  const deck = useMemo(() => {
    const seen = new Set([...save.likes, ...save.dislikes])
    const filtered = images.filter((img) => !seen.has(img.src))
    return filtered.length ? filtered : images
  }, [images, save.dislikes, save.likes])

  const current = deck[index % Math.max(1, deck.length)]

  useEffect(() => {
    setMounted(true)
    setSave(readTasteSave())
  }, [])

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

    fetchProfile()
      .then((data) => {
        if (!data) router.push('/profile-wizard')
      })
      .catch(() => {
        router.push('/profile-wizard')
      })
  }, [isLoaded, isSignedIn, mounted, router, user?.id])

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
    const match = images.find((img) => img.src === closetItemSrc)
    return match || { src: closetItemSrc, category: 'Closet item' }
  }, [closetItemSrc, images])

  const openClosetItem = (src: string) => {
    setClosetItemSrc(src)
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
    if (!current) return
    setSave((prev) => ({
      likes: prev.likes.includes(current.src) ? prev.likes : [...prev.likes, current.src],
      dislikes: prev.dislikes,
    }))
    advance()
  }

  const onDislike = () => {
    if (!current) return
    setSave((prev) => ({
      likes: prev.likes,
      dislikes: prev.dislikes.includes(current.src) ? prev.dislikes : [...prev.dislikes, current.src],
    }))
    advance()
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
                      const inLikes = prev.likes.includes(src)
                      const likes = inLikes ? prev.likes.filter((v) => v !== src) : prev.likes
                      const dislikes =
                        inLikes || prev.dislikes.includes(src) ? prev.dislikes : [...prev.dislikes, src]
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

      <div className="grid gap-8 lg:grid-cols-[360px,1fr,320px]">
        <aside className="lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-6 shadow-sm">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">My Closet</div>
            <div className="mt-2 text-2xl font-semibold text-[hsl(var(--ink))]">Liked items & picks for you</div>
            <div className="mt-2 text-sm text-[hsl(var(--ink))]/80">
              Your saved likes and personalized recommendations.
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="text-sm font-semibold text-[hsl(var(--ink))]">Liked items</div>
                <div className="mt-2 text-xs text-[hsl(var(--ink))]/70">
                  {save.likes.length} saved · Like cards in the tuner to add more
                </div>
                {savedItems.length ? (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {savedItems.map((src) => (
                      <button
                        key={src}
                        type="button"
                        onClick={() => openClosetItem(src)}
                        className="overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white text-left transition hover:shadow-sm"
                      >
                        <Image src={src} alt="Liked item" width={240} height={320} className="h-24 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-[hsl(var(--border))] bg-white/50 p-6 text-center text-sm text-muted-foreground">
                    No liked items yet. Swipe right on pieces in the tuner to add them here.
                  </div>
                )}
              </div>

              <div className="rounded-xl border-[3px] border-blue-600 bg-yellow-200 p-4">
                <div className="text-sm font-semibold text-[hsl(var(--ink))]">Recommendations</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Picks based on your likes and style — coming soon.
                </div>
                <div className="mt-4 rounded-lg border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-6 text-center text-sm text-muted-foreground">
                  Recommendations will appear here once we hook up the algorithm.
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section className="flex items-start justify-center">
          <div className="w-full max-w-[520px]">
            {!current ? (
              <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-8 text-center shadow-sm">
                <div className="text-lg font-semibold text-[hsl(var(--ink))]">No items found</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Add images to <code className="font-mono">/public/images/clothing</code> and refresh.
                </div>
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
                    {current.category}
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
                    <Image
                      src={current.src}
                      alt="Clothing item"
                      fill
                      sizes="(max-width: 1024px) 90vw, 520px"
                      className="object-cover"
                      priority
                    />
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

                <div className="mt-4 text-center text-sm text-muted-foreground">Swipe left or right. No wrong answers.</div>
              </>
            )}
          </div>
        </section>

        <aside className="lg:sticky lg:top-10 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <div className="space-y-4">
            <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-200 p-6 shadow-sm">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Avatar</div>
              <div className="mt-2 text-lg font-semibold text-[hsl(var(--ink))]">Profile photo</div>
              <div className="mt-2 text-sm text-[color:var(--brand-text-secondary-hex)]">
                Upload a photo so your profile feels personal.
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                <div
                  className="w-full max-w-[240px] overflow-hidden border border-[hsl(var(--border))] bg-white"
                  style={{ aspectRatio: '9 / 16', clipPath: 'polygon(50% 3%, 62% 6%, 70% 14%, 74% 24%, 78% 40%, 84% 58%, 82% 70%, 74% 83%, 62% 92%, 50% 97%, 38% 92%, 26% 83%, 18% 70%, 16% 58%, 22% 40%, 26% 24%, 30% 14%, 38% 6%)' }}
                >
                  {profile.avatar ? (
                    <Image
                      src={profile.avatar}
                      alt="Your avatar"
                      width={540}
                      height={960}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">No photo</div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <label className="text-sm font-medium text-[hsl(var(--ink))]">Upload</label>
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
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-[hsl(var(--border))] file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[hsl(var(--ink))] hover:file:bg-[hsl(var(--secondary))]"
                  />

                  {profile.avatar ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-1 bg-[hsl(var(--background))] hover:bg-[hsl(var(--secondary))]"
                      onClick={() => {
                        const next = { ...(profile || {}), avatar: '' } as WizardProfile
                        setProfile(next)
                        saveProfile(next).catch(() => {
                          // ignore
                        })
                      }}
                    >
                      Remove photo
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="mt-5" />
            </div>

            <div className="rounded-2xl border-[3px] border-blue-600 bg-yellow-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-[hsl(var(--ink))]">Not a member? Join here</div>
              <Button asChild className="mt-3 w-full">
                <Link href="/memberships">Memberships</Link>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
