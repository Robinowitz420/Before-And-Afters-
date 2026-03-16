'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type WizardData = {
  displayName: string
  nickname?: string
  email: string
  phone: string

  heightRange: string
  topSizeRange: string
  bottomSizeRange: string
  shoeSize: string
  fitNotes: string

  fabricSensitivities: string[]

  // Joni's Dressup Box Application
  fullName: string
  permaPlayaName: string
  igHandle: string
  birthday: string
  neighborhood: string
  styleVibe: string
  aboutYou: string
  wardrobeGripes: string
  favoriteStores: string
  excitementReasons: string[]
  closetMascot: string
  signatureColor: string
  powerLetter: string
  selfieUrl: string
}

const HEIGHT_RANGES = [
  'Under 5\'0"',
  '5\'0" – 5\'3"',
  '5\'4" – 5\'7"',
  '5\'8" – 5\'11"',
  '6\'0" and up',
  'Prefer not to say',
]

const SIZE_RANGES_TOP = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Varies']

const POWER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const EXCITEMENT_OPTIONS = [
  'Trying out different styles, shapes, colors and vibes without the long term commitment',
  'Elevating my going-out looks',
  'Working with style-savvy staff to find things that fit, suit me and build my confidence',
  'Reinventing myself regularly, having more eras',
  'The excitement of finding new things to wear all the time',
  'Being part of a community that loves clothes and style',
  'Having a place to change my outfit and get ready at any hour of the day',
  'Putting my own clothes into the closet',
  'Sharing and hearing stories about the clothes I wear and share',
  'Having fun bringing more Twinning and Squad coordinated looks into my lifestyle',
  'Renting stand-out pieces for performances, content and photo/video shoots',
  'Dressing for special occasions',
  'Making every day a special occasion!',
] as const

const SIGNATURE_COLORS = [
  { value: 'red', label: 'RED', emoji: '❤️', class: 'bg-red-500' },
  { value: 'orange', label: 'ORANGE', emoji: '🧡', class: 'bg-orange-500' },
  { value: 'yellow', label: 'YELLOW', emoji: '💛', class: 'bg-yellow-400' },
  { value: 'green', label: 'GREEN', emoji: '💚', class: 'bg-green-500' },
  { value: 'blue', label: 'BLUE', emoji: '💙', class: 'bg-blue-500' },
  { value: 'purple', label: 'PURPLE', emoji: '💜', class: 'bg-purple-500' },
  { value: 'pink', label: 'PINK', emoji: '💗', class: 'bg-pink-500' },
  { value: 'black', label: 'BLACK', emoji: '🖤', class: 'bg-gray-900' },
  { value: 'white', label: 'WHITE', emoji: '🤍', class: 'bg-gray-100' },
] as const

const FABRIC_SENSITIVITIES = [
  'Wool (itch)',
  'Synthetics (itch / heat)',
  'Latex',
  'Prefer not to say',
] as const

function defaultData(): WizardData {
  return {
    displayName: '',
    nickname: '',
    email: '',
    phone: '',

    heightRange: '',
    topSizeRange: '',
    bottomSizeRange: '',
    shoeSize: '',
    fitNotes: '',

    fabricSensitivities: [],

    // Joni's Dressup Box Application
    fullName: '',
    permaPlayaName: '',
    igHandle: '',
    birthday: '',
    neighborhood: '',
    styleVibe: '',
    aboutYou: '',
    wardrobeGripes: '',
    favoriteStores: '',
    excitementReasons: [],
    closetMascot: '',
    signatureColor: '',
    powerLetter: '',
    selfieUrl: '',
  }
}

async function saveProfile(data: WizardData): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data ?? {}),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      return { success: false, error: errorData?.error || `Save failed with status ${res.status}` }
    }

    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Network error' }
  }
}

function clampStep(step: number) {
  return Math.min(4, Math.max(1, step))
}

type TogglePillProps = {
  selected: boolean
  onClick: () => void
  children: React.ReactNode
  disabled?: boolean
}

function TogglePill({ selected, onClick, children, disabled }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        selected
          ? 'border-transparent bg-primary text-primary-foreground shadow-[0_8px_20px_hsl(var(--primary)/0.22)]'
          : 'border-[color:var(--brand-border-hex)] bg-transparent text-[hsl(var(--ink))] hover:border-[hsl(var(--ink))/0.28]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {children}
    </button>
  )
}

type ToggleSwitchProps = {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
}

function ToggleSwitch({ checked, onCheckedChange, label }: ToggleSwitchProps) {
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
          checked
            ? 'border-transparent bg-primary'
            : 'border-[color:var(--brand-border-hex)] bg-[hsl(var(--secondary))]'
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

function FieldLabel({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{title}</div>
      {hint ? <div className="text-xs text-[hsl(var(--ink))]/70">{hint}</div> : null}
    </div>
  )
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    />
  )
}

function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        'min-h-[96px] w-full resize-y rounded-md border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm outline-none placeholder:text-[hsl(var(--muted-foreground))] focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    />
  )
}

function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        'w-full rounded-md border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      {children}
    </select>
  )
}

export function ProfileWizard() {
  const router = useRouter()
  const { isLoaded, isSignedIn, user } = useUser()
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState<number>(1)
  const [data, setData] = useState<WizardData>(defaultData())
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const totalSteps = 4
  const progressPct = Math.round((step / totalSteps) * 100)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent('/profile-wizard')}`)
    }
  }, [isLoaded, isSignedIn, mounted, router])

  const canContinueStep1 = data.displayName.trim() !== ''
  const canContinueStep3 = true
  const canContinueStep4 = true

  const canContinue = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return canContinueStep1
      case 2:
        return true
      case 3:
        return canContinueStep3
      case 4:
        return canContinueStep4
      default:
        return false
    }
  }

  const stepTitle =
    step === 1 ? 'Start here'
      : step === 2 ? 'Fit & comfort'
      : step === 3 ? 'Style notes'
      : 'Personal Touch'

  const stepDescription =
    step === 1 ? 'Just the basics. You can complete your profile anytime.'
      : step === 2 ? 'Body-neutral, practical sizing info + fabric allergies so pulls feel good.'
      : step === 3 ? 'Tell us about your style, your wardrobe gripes, and what excites you about Joni\'s Dressup Box.'
      : 'A few fun details to complete your profile—your mascot, signature color, and selfie!'

  const goNext = () => setStep((s) => clampStep(s + 1))
  const goBack = () => setStep((s) => clampStep(s - 1))

  const hasRequiredName = data.displayName.trim().length > 0

  const onSubmit = async () => {
    setSaving(true)
    setSaveError(null)
    
    const result = await saveProfile(data)
    
    if (!result.success) {
      setSaving(false)
      setSaveError(result.error || 'Failed to save profile. Please try again.')
      return
    }
    
    router.push('/profile')
    setSubmitted(true)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[url('/images/Backgrounds/plain%20wallpaper.png')] bg-cover bg-center bg-no-repeat p-6 text-white shadow-sm">
              <div className="text-sm font-medium opacity-90">Profile Ritual</div>
              <div className="mt-1 text-2xl font-ranchers">Step {step} of 4</div>
              <div className="mt-2 text-sm opacity-90">
                {step === 1 ? 'Quick and easy. Just the essentials.' : 'Sizing + fabric allergies for better pulls.'}
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#24103f] p-6 text-white shadow-sm">
              <div className="text-sm font-semibold">What you’re setting up</div>
              <div className="mt-3 space-y-2 text-sm text-white/90">
                {step === 1 ? (
                  <>
                    <div className="rounded-lg bg-white/10 p-3">Basic identity and contact info.</div>
                    <div className="rounded-lg bg-white/10 p-3">Display name and communication preferences.</div>
                    <div className="rounded-lg bg-white/10 p-3">Foundation for your magical profile.</div>
                  </>
                ) : (
                  <>
                    <div className="rounded-lg bg-white/10 p-3">Height, sizes, and fit preferences.</div>
                    <div className="rounded-lg bg-white/10 p-3">Fabric allergies / sensitivities (optional).</div>
                    <div className="rounded-lg bg-white/10 p-3">Notes that prevent bad pulls.</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8">
          <Card className="overflow-hidden border-black/10 bg-[#f6f1e7] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Identity Basics</CardTitle>
              <CardDescription>Let’s get the essentials so the rest can feel effortless.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-[hsl(var(--ink))]/70">Loading your profile wizard...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <div className="sticky top-6 space-y-4">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[hsl(var(--ink))] p-6 text-white shadow-sm">
            <div className="text-sm font-medium opacity-90">Profile Ritual</div>
            <div className="mt-1 text-2xl font-ranchers">Step {step} of {totalSteps}</div>
            <div className="mt-2 text-sm opacity-90">Under 5 minutes. Zero pressure. Maximum clarity.</div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[hsl(var(--ink-dark))] p-6 text-white shadow-sm">
            <div className="text-sm font-semibold">What you’re setting up</div>
            <div className="mt-3 space-y-2 text-sm text-white/90">
              <div className="rounded-lg bg-white/10 p-3">Sizing + fit signals so your pulls land better.</div>
              <div className="rounded-lg bg-white/10 p-3">Style language so browsing feels like teleportation.</div>
              <div className="rounded-lg bg-white/10 p-3">Comfort boundaries so recommendations respect you.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-8">
        <Card className="overflow-hidden border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-ranchers">{stepTitle}</CardTitle>
            <CardDescription>{stepDescription}</CardDescription>

            <div className="mt-4">
              <div className="h-1.5 w-full rounded-full bg-[hsl(var(--border))]">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex min-h-[760px] flex-col gap-6">
            {submitted ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-black/10 bg-white/60 p-6 shadow-sm">
                  <div className="text-lg font-ranchers">Profile saved ✨</div>
                  <div className="mt-2 text-sm text-[hsl(var(--ink))]/80">
                    You can revisit this anytime — your answers are stored locally for now (MVP).
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    onClick={() => {
                      setSubmitted(false)
                      setStep(1)
                    }}
                    variant="outline"
                  >
                    Edit answers
                  </Button>
                  <Button
                    onClick={() => {
                      router.push('/profile')
                    }}
                  >
                    Back to app
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex-1">
                  {step === 1 ? <Step1 data={data} setData={setData} /> : null}
                  {step === 2 ? <Step2 data={data} setData={setData} /> : null}
                  {step === 3 ? <Step3 data={data} setData={setData} /> : null}
                  {step === 4 ? <Step4 data={data} setData={setData} /> : null}
                </div>

                <div className="mt-auto">
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button" variant="outline" onClick={goBack} disabled={step === 1}>
                      Back
                    </Button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {step < totalSteps ? (
                        <Button type="button" variant="outline" onClick={goNext}>
                          Next
                        </Button>
                      ) : null}

                      <div className="relative">
                        <Button type="button" onClick={onSubmit} disabled={!hasRequiredName || saving}>
                          {saving ? 'Saving...' : 'Complete'}
                        </Button>
                        {hasRequiredName && step === 1 && !saving ? (
                          <div className="absolute -top-10 left-0 sm:left-1/2 sm:-translate-x-1/2 whitespace-nowrap rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg animate-bounce">
                            You can now click Complete!
                            <div className="absolute -bottom-1 left-4 sm:left-1/2 sm:-translate-x-1/2 w-2 h-2 bg-purple-500 rotate-45" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {saveError && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                      {saveError}
                    </div>
                  )}

                  {!canContinue(step) ? (
                    <div className="mt-3 text-xs text-[hsl(var(--ink))]/70">
                      {step === 1 && 'Name is required to continue.'}
                    </div>
                  ) : null}

                  <div className="mt-3 text-xs text-[hsl(var(--ink))]/70">
                    you can complete your profile at any time!
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function BubbleComponent({
  id, icon, label, value, onChange, placeholder, required = false,
  normalSize = "w-36 h-36", expandedSize = "w-72 h-72", position, zIndex,
  gradientFrom, textColor, expandedTextSize = "text-xl",
  isExpanded, hasContent, setExpandedBubble
}: {
  id: string;
  icon: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  normalSize?: string;
  expandedSize?: string;
  position: string;
  zIndex: string;
  gradientFrom: string;
  textColor: string;
  expandedTextSize?: string;
  isExpanded: (bubbleId: string) => boolean;
  hasContent: (value: string) => boolean;
  setExpandedBubble: (bubble: string | null) => void;
}) {
  const expanded = isExpanded(id)
  const contentExists = hasContent(value)

  return (
    <div className={`absolute ${position} ${zIndex}`}>
      <div className="relative">
        <div className={`absolute -inset-2 ${gradientFrom} rounded-full blur-lg opacity-60 animate-pulse`}></div>
        <div
          className={`relative bg-white rounded-full ${expanded ? expandedSize : contentExists && value.length > 15 ? 'w-44 h-44' : contentExists && value.length > 8 ? 'w-40 h-40' : normalSize} shadow-2xl border-4 border-transparent bg-gradient-to-br from-white to-gray-50 flex flex-col items-center justify-center hover:scale-105 transition-all duration-500 cursor-pointer ${
            expanded ? 'p-8' : contentExists ? 'p-3' : 'p-6'
          }`}
          onClick={() => setExpandedBubble(expanded ? null : id)}
        >
          {!expanded ? (
            <>
              <div className="text-xl mb-2">{icon}</div>
              <div className="text-xs font-bold text-center text-[hsl(var(--ink))]">{label}</div>
              {contentExists ? (
                <div className="mt-2 px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 max-w-full">
                  <div className={`text-center font-medium ${
                    value.length > 20 ? 'text-xs' : value.length > 12 ? 'text-sm' : 'text-base'
                  } text-[hsl(var(--ink))] leading-tight break-all`}>
                    {value}
                  </div>
                </div>
              ) : (
                <div className="mt-2 px-2 py-1 bg-gray-50 rounded-full border-2 border-dashed border-gray-300">
                  <div className="text-xs text-center text-[hsl(var(--ink))]/50">
                    Click to add
                  </div>
                </div>
              )}
              {contentExists && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                  ✓
                </div>
              )}
            </>
          ) : (
            <div className="w-full text-center">
              <div className="text-2xl mb-4">{icon}</div>
              <label className="block text-sm font-bold text-[hsl(var(--ink))] mb-3">
                {label}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-transparent border-0 text-center ${expandedTextSize} font-semibold text-[hsl(var(--ink))] placeholder:text-[hsl(var(--ink))]/50 focus:outline-none focus:ring-0`}
                autoFocus
                required={required}
                onKeyDown={(e) => {
                  // Allow completion with Enter key
                  if (e.key === 'Enter' && hasContent(value)) {
                    setExpandedBubble(null)
                  }
                }}
                onBlur={() => {
                  // Auto-shrink when content exists and user moves away
                  if (hasContent(value)) {
                    setExpandedBubble(null)
                  }
                }}
              />
              <div className={`text-xs text-center font-medium mt-2 ${textColor}`}>
                {required ? 'Required' : 'Optional'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel title="Name" hint="Required" />
        <Input
          value={data.displayName}
          onChange={(e) => setData({ ...data, displayName: e.target.value })}
          placeholder="Your name"
          autoComplete="name"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel title="Email" hint="Optional" />
        <Input
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel title="Phone" hint="Optional" />
        <Input
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          placeholder="(555) 123-4567"
          autoComplete="tel"
        />
      </div>
    </div>
  )
}

function Step2({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  const toggleSensitivity = (value: (typeof FABRIC_SENSITIVITIES)[number]) => {
    if (value === 'Prefer not to say') {
      setData({ ...data, fabricSensitivities: ['Prefer not to say'] })
      return
    }

    const current = data.fabricSensitivities.filter((v) => v !== 'Prefer not to say')
    const exists = current.includes(value)
    setData({
      ...data,
      fabricSensitivities: exists ? current.filter((v) => v !== value) : [...current, value],
    })
  }

  const sensitivityButtons: Array<{
    value: (typeof FABRIC_SENSITIVITIES)[number]
    icon: string
    label: string
    selectedClass: string
    unselectedClass: string
  }> = [
    {
      value: 'Wool (itch)',
      icon: '🧶',
      label: 'Wool',
      selectedClass: 'bg-gradient-to-br from-red-500 to-pink-600 text-white border-red-500 shadow-red-500/50',
      unselectedClass: 'bg-white border-gray-200 bg-gradient-to-br from-red-50 to-pink-50 hover:border-red-300',
    },
    {
      value: 'Synthetics (itch / heat)',
      icon: '🧵',
      label: 'Synthetics',
      selectedClass: 'bg-gradient-to-br from-orange-500 to-red-600 text-white border-orange-500 shadow-orange-500/50',
      unselectedClass: 'bg-white border-gray-200 bg-gradient-to-br from-orange-50 to-red-50 hover:border-orange-300',
    },
    {
      value: 'Latex',
      icon: '🤿',
      label: 'Latex',
      selectedClass: 'bg-gradient-to-br from-purple-500 to-pink-600 text-white border-purple-500 shadow-purple-500/50',
      unselectedClass: 'bg-white border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-300',
    },
    {
      value: 'Prefer not to say',
      icon: '🤐',
      label: 'Skip',
      selectedClass: 'bg-gradient-to-br from-gray-500 to-slate-600 text-white border-gray-500 shadow-gray-500/50',
      unselectedClass: 'bg-white border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-gray-300',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel title="Height" />
          <Select value={data.heightRange} onChange={(e) => setData({ ...data, heightRange: e.target.value })}>
            <option value="">Select</option>
            {HEIGHT_RANGES.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel title="Top Size" />
          <Select value={data.topSizeRange} onChange={(e) => setData({ ...data, topSizeRange: e.target.value })}>
            <option value="">Select</option>
            {SIZE_RANGES_TOP.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel title="Bottom Size" />
          <Input
            value={data.bottomSizeRange}
            onChange={(e) => setData({ ...data, bottomSizeRange: e.target.value })}
            placeholder="8, M, varies..."
          />
        </div>

        <div className="space-y-2">
          <FieldLabel title="Shoe Size" />
          <Input
            value={data.shoeSize}
            onChange={(e) => setData({ ...data, shoeSize: e.target.value })}
            placeholder="8, 8.5..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel title="Fit Notes & Preferences" />
        <Textarea
          value={data.fitNotes}
          onChange={(e) => setData({ ...data, fitNotes: e.target.value })}
          placeholder="Any special fit preferences?"
          rows={4}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel title="Fabric allergies / sensitivities" />
        <div className="flex flex-wrap gap-2">
          {sensitivityButtons.map((b) => {
            const selected = data.fabricSensitivities.includes(b.value)
            return (
              <Button
                key={b.value}
                type="button"
                variant={selected ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSensitivity(b.value)}
              >
                {b.icon} {b.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Step3({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  const toggleExcitement = (value: (typeof EXCITEMENT_OPTIONS)[number]) => {
    const exists = data.excitementReasons.includes(value)
    setData({
      ...data,
      excitementReasons: exists
        ? data.excitementReasons.filter((r: string) => r !== value)
        : [...data.excitementReasons, value],
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel title="What's your style vibe?" />
        <Textarea
          value={data.styleVibe}
          onChange={(e) => setData({ ...data, styleVibe: e.target.value })}
          placeholder="Describe your aesthetic..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel title="About you" />
          <Textarea
            value={data.aboutYou}
            onChange={(e) => setData({ ...data, aboutYou: e.target.value })}
            placeholder="Anything you'd like us to know..."
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel title="Wardrobe gripes" />
          <Textarea
            value={data.wardrobeGripes}
            onChange={(e) => setData({ ...data, wardrobeGripes: e.target.value })}
            placeholder="Fit issues, style ruts, etc."
            rows={4}
            className="resize-none"
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel title="Favorite stores / brands" />
        <Textarea
          value={data.favoriteStores}
          onChange={(e) => setData({ ...data, favoriteStores: e.target.value })}
          placeholder="Stores, boutiques, designers..."
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <FieldLabel title="What excites you about joining?" />
        <div className="grid gap-2 sm:grid-cols-2">
          {EXCITEMENT_OPTIONS.map((option: string) => {
            const selected = data.excitementReasons.includes(option)
            return (
              <Button
                key={option}
                type="button"
                variant={selected ? 'default' : 'outline'}
                size="sm"
                className="justify-start whitespace-normal h-auto"
                onClick={() => toggleExcitement(option as typeof EXCITEMENT_OPTIONS[number])}
              >
                {option}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Step4({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-600 bg-clip-text text-transparent">
          🎨 Personal Touch
        </h2>
        <p className="text-lg text-[hsl(var(--ink))]/80">
          A few fun details to make your profile uniquely you
        </p>
      </div>

      {/* Full Name & PermaPlaya Name row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Full Name */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <label className="block text-center text-sm font-semibold text-gray-700 mb-3">
              📝 Full Name
            </label>
            <input
              type="text"
              value={data.fullName}
              onChange={(e) => setData({ ...data, fullName: e.target.value })}
              placeholder="Your full name"
              className="w-full bg-transparent border-0 text-center text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* PermaPlaya Name */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-400 via-rose-500 to-red-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
            <label className="block text-center text-sm font-semibold text-gray-700 mb-3">
              🎭 PermaPlaya Name
            </label>
            <input
              type="text"
              value={data.permaPlayaName}
              onChange={(e) => setData({ ...data, permaPlayaName: e.target.value })}
              placeholder="Your artist/party name"
              className="w-full bg-transparent border-0 text-center text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* IG Handle & Birthday row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* IG Handle */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50">
            <label className="block text-center text-sm font-semibold text-gray-700 mb-3">
              📱 IG Handle
            </label>
            <input
              type="text"
              value={data.igHandle}
              onChange={(e) => setData({ ...data, igHandle: e.target.value })}
              placeholder="@yourhandle"
              className="w-full bg-transparent border-0 text-center text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        {/* Birthday */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
            <label className="block text-center text-sm font-semibold text-gray-700 mb-3">
              🎂 Birthday
            </label>
            <input
              type="date"
              value={data.birthday}
              onChange={(e) => setData({ ...data, birthday: e.target.value })}
              className="w-full bg-transparent border-0 text-center text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Neighborhood */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-teal-500 to-cyan-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50">
            <label className="block text-center text-sm font-semibold text-gray-700 mb-3">
              🏙️ Neighborhood
            </label>
            <input
              type="text"
              value={data.neighborhood}
              onChange={(e) => setData({ ...data, neighborhood: e.target.value })}
              placeholder="Where do you hang?"
              className="w-full bg-transparent border-0 text-center text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Closet Mascot */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50">
            <label className="block text-center text-sm font-semibold text-gray-700 mb-3">
              🐾 If your closet had an animal mascot, what would it be?
            </label>
            <input
              type="text"
              value={data.closetMascot}
              onChange={(e) => setData({ ...data, closetMascot: e.target.value })}
              placeholder="A fierce leopard? A cozy cat? A peacock?"
              className="w-full bg-transparent border-0 text-center text-lg font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0"
            />
            <div className="text-xs text-center text-amber-600 mt-2">Optional</div>
          </div>
        </div>
      </div>

      {/* Signature Color */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 via-pink-500 to-purple-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white/80 rounded-3xl p-8 shadow-lg border-2 border-transparent bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50">
            <div className="text-center">
              <div className="text-2xl mb-2">🎨</div>
              <h3 className="text-lg font-bold text-gray-900">Signature Color</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                If you had to choose one color that represents you...
              </p>
              {data.signatureColor && (
                <div className="mt-2 text-sm font-medium text-pink-700">
                  Selected: {SIGNATURE_COLORS.find((c: {value: string; label: string; emoji: string; class: string}) => c.value === data.signatureColor)?.label}
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {SIGNATURE_COLORS.map((color: {value: string; label: string; emoji: string; class: string}) => {
                const selected = data.signatureColor === color.value
                return (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setData({ ...data, signatureColor: color.value })}
                    className={`relative w-20 h-20 rounded-full shadow-xl border-4 hover:scale-110 transition-all duration-300 ${
                      selected ? 'border-gray-900 scale-110' : 'border-white'
                    } ${color.class}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl">{color.emoji}</span>
                    </div>
                    {selected && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                        ✓
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Power Letter */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white/80 rounded-3xl p-8 shadow-lg border-2 border-transparent bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50">
            <div className="text-center">
              <div className="text-2xl mb-2">🔮</div>
              <h3 className="text-lg font-bold text-gray-900">Power Letter</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose the letter that resonates most with your energy
              </p>
              {data.powerLetter && (
                <div className="mt-2 text-sm font-medium text-purple-700">
                  ✨ Your power letter: {data.powerLetter}
                </div>
              )}
            </div>

            <div className="mt-6 grid grid-cols-6 md:grid-cols-9 gap-2 max-w-2xl mx-auto">
              {POWER_LETTERS.map((letter) => {
                const selected = data.powerLetter === letter
                return (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => setData({ ...data, powerLetter: letter })}
                    className={`aspect-square rounded-lg border-2 text-lg font-bold transition-all ${
                      selected
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg scale-105'
                        : 'bg-white hover:bg-purple-50 border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {letter}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selfie Upload */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-white rounded-3xl p-8 shadow-lg border-2 border-transparent bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50">
            <div className="text-center">
              <div className="text-2xl mb-2">📸</div>
              <h3 className="text-lg font-bold text-gray-900">Upload a selfie!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Let&apos;s see that beautiful face 💕
              </p>
            </div>

            <div className="mt-6">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setData({ ...data, selfieUrl: event.target?.result as string })
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="hidden"
                id="selfie-upload"
              />
              <label
                htmlFor="selfie-upload"
                className="block w-full cursor-pointer"
              >
                <div className="border-2 border-dashed border-blue-300 rounded-2xl p-8 text-center hover:bg-blue-50/50 transition-colors">
                  {data.selfieUrl ? (
                    <div className="space-y-3">
                      <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.selfieUrl} alt="Selfie preview" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-sm text-blue-600 font-medium">Click to change photo</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-4xl">📤</div>
                      <p className="text-sm text-gray-600">Click to upload or drag a photo here</p>
                      <p className="text-xs text-gray-400">Size limit: 10 MB</p>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
