
'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type WizardData = {
  displayName: string
  pronouns: string
  email: string
  phone: string

  tones: string[]
  vibes: string[]
  eras: string[]

  heightRange: string
  topSizeRange: string
  bottomSizeRange: string
  shoeSize: string
  fitNotes: string

  fabricSensitivities: string[]
  garmentCareComfort: 'I baby clothes' | 'Normal human wear' | 'I live dangerously' | ''

  occasions: string[]
}


type WizardSave = {
  step: number
  data: WizardData
}

const STORAGE_KEY = 'cyo_profile_wizard_v1'

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

const HEIGHT_RANGES = [
  'Under 5\'0"',
  '5\'0" – 5\'3"',
  '5\'4" – 5\'7"',
  '5\'8" – 5\'11"',
  '6\'0" and up',
  'Prefer not to say',
]

const SIZE_RANGES_TOP = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Varies']

const CARE_COMFORT = ['I baby clothes', 'Normal human wear', 'I live dangerously'] as const

const FABRIC_SENSITIVITIES = [
  'Wool (itch)',
  'Synthetics (itch / heat)',
  'Latex',
  'Strong fragrance',
  'Nickel / metal hardware',
  'Sequins / scratchy embellishments',
  'Tight necklines',
  'Tight waistbands',
  'Prefer not to say',
] as const

const OCCASIONS = [
  'Everyday life',
  'Parties / nightlife',
  'Performances',
  'Photoshoots',
  'Work / meetings',
  'Rituals & ceremonies',
  'Costume / character play',
] as const

function defaultData(): WizardData {
  return {
    displayName: '',
    pronouns: '',
    email: '',
    phone: '',

    tones: [],
    vibes: [],
    eras: [],

    heightRange: '',
    topSizeRange: '',
    bottomSizeRange: '',
    shoeSize: '',
    fitNotes: '',

    fabricSensitivities: [],
    garmentCareComfort: '',

    occasions: [],
  }
}

function readSaved(): WizardSave | null {
  // Only run on client side
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as WizardSave
    if (!parsed?.data) return null
    const rawStep = typeof parsed.step === 'number' ? parsed.step : 1
    const data = (parsed.data && typeof parsed.data === 'object') ? (parsed.data as any) : {}
    const hasErasKey = Object.prototype.hasOwnProperty.call(data, 'eras')
    const merged = { ...defaultData(), ...data } as WizardData

    merged.tones = Array.isArray((data as any).tones)
      ? (data as any).tones.filter((t: unknown) => typeof t === 'string')
      : []

    const allowedVibes = ALLOWED_VIBES_SET
    const vibesFromSave = Array.isArray((data as any).vibes)
      ? (data as any).vibes.filter((v: unknown) => typeof v === 'string')
      : []

    const migratedFeelings = Array.isArray((data as any).feelings)
      ? (data as any).feelings.filter((v: unknown) => typeof v === 'string')
      : []

    const combined = [...vibesFromSave, ...migratedFeelings]
    merged.vibes = combined.filter((v: string) => allowedVibes.has(v) || Boolean(v.trim()))

    merged.eras = Array.isArray((data as any).eras)
      ? (data as any).eras.filter((e: unknown) => typeof e === 'string')
      : []

    // Migration: previous versions stored `fabricSensitivities` as a free-text string.
    if (typeof (data as any).fabricSensitivities === 'string') {
      const rawSensitivities = ((data as any).fabricSensitivities as string).trim()
      merged.fabricSensitivities = rawSensitivities
        ? rawSensitivities
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : []
    }

    // Migration: wizard now has 7 steps:
    // 1 Identity, 2 Tones, 3 Vibes, 4 Eras, 5 Fit, 6 Comfort, 7 Occasions
    // Previously it could be 5 steps (Identity/Feelings/Fit/Comfort/Occasions)
    // or 6 steps (with Social & Work)
    // or 9 steps (split style pages).
    const hasFitSignals =
      Boolean(merged.heightRange) ||
      Boolean(merged.topSizeRange) ||
      Boolean(merged.bottomSizeRange) ||
      Boolean(merged.shoeSize) ||
      Boolean(merged.fitNotes)

    const hasComfortSignals =
      Boolean(merged.garmentCareComfort) ||
      (Array.isArray(merged.fabricSensitivities) && merged.fabricSensitivities.length > 0)

    const hasOccasionSignals = Array.isArray(merged.occasions) && merged.occasions.length > 0

    let migratedStep = rawStep

    if (rawStep <= 2) {
      migratedStep = rawStep
    } else if (rawStep === 3) {
      // Old 5-step flow: step 3 was Fit.
      migratedStep = 4
    } else if (rawStep === 4) {
      // Old 5-step flow: step 4 was Comfort.
      migratedStep = 5
    } else if (rawStep === 5) {
      // Old 5-step flow: step 5 was Occasions.
      migratedStep = 6
    } else if (rawStep === 6) {
      // Old 6-step flow ended with Social & Work.
      migratedStep = 6
    } else if (rawStep >= 7) {
      // Old 9-step flow: 7 Fit, 8 Comfort, 9 Occasions
      // New 7-step flow: 5 Fit, 6 Comfort, 7 Occasions
      migratedStep = rawStep - 2
    } else {
      // Raw steps 3–6 were style-related in the 9-step flow.
      // In the older 6-step flow, 4/5/6 were Fit/Comfort/Occasions.
      if (hasOccasionSignals) migratedStep = 6
      else if (hasComfortSignals) migratedStep = 5
      else if (hasFitSignals) migratedStep = 4
      else migratedStep = 3
    }

    // Insert new Eras step before Fit if this save predates the eras field.
    // Old 6-step flow: 1 Identity, 2 Tones, 3 Vibes, 4 Fit, 5 Comfort, 6 Occasions
    // New 7-step flow: 1 Identity, 2 Tones, 3 Vibes, 4 Eras, 5 Fit, 6 Comfort, 7 Occasions
    if (!hasErasKey && rawStep < 7 && migratedStep >= 4) migratedStep = migratedStep + 1

    return { step: clampStep(migratedStep), data: merged }
  } catch {
    return null
  }
}

function clampStep(step: number) {
  return Math.min(7, Math.max(1, step))
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
          : 'border-[color:var(--brand-border-hex)] bg-transparent text-[color:var(--brand-text-secondary-hex)] hover:border-[hsl(var(--ink))/0.28]',
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
      {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
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
  const [mounted, setMounted] = useState(false)
  const [saved, setSaved] = useState<WizardSave | null>(null)
  const [step, setStep] = useState<number>(1)
  const [data, setData] = useState<WizardData>(defaultData())
  const [submitted, setSubmitted] = useState(false)

  const totalSteps = 7
  const progressPct = Math.round((step / totalSteps) * 100)

  useEffect(() => {
    setMounted(true)
    // Only read from localStorage after mounting on client
    const savedData = readSaved()
    if (savedData) {
      setSaved(savedData)
      setStep(savedData.step)
      setData(savedData.data)
    }
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return
    const payload: WizardSave = { step, data }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  }, [step, data, mounted])

  const canContinueStep1 = data.displayName.trim() !== '' && data.email.trim() !== '' && data.phone.trim() !== ''

  const canContinue = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return canContinueStep1
      case 2:
        return data.tones.length > 0
      case 3:
        return data.vibes.length > 0
      case 4:
        return data.eras.length > 0
      case 5:
        return data.heightRange && data.topSizeRange && data.bottomSizeRange && data.shoeSize
      case 6:
        return data.fabricSensitivities.length > 0 && data.garmentCareComfort
      case 7:
        return data.occasions.length > 0
      default:
        return false
    }
  }

  const stepTitle =
    step === 1 ? 'Identity Basics'
      : step === 2 ? 'Tones'
        : step === 3 ? 'Vibes'
          : step === 4 ? 'Preferred Eras'
            : step === 5 ? 'Fit & Body Reality'
              : step === 6 ? 'Closet Comfort Level'
                : 'Occasion Orbit'

  const stepDescription =
    step === 1 ? 'Let’s get the essentials so the rest can feel effortless.'
      : step === 2 ? 'Pick the tones that match your sound + style universe.'
        : step === 3 ? 'Choose your vibe signals — this is how we map music to clothes.'
          : step === 4 ? 'Select the eras you gravitate toward.'
            : step === 5 ? 'Body-neutral, practical, and here to reduce bad pulls.'
              : step === 6 ? 'Tell us how bold you want your closet to be.'
                : 'Where will this wardrobe travel with you?'

  const goNext = () => setStep((s) => clampStep(s + 1))
  const goBack = () => setStep((s) => clampStep(s - 1))

  const onSubmit = () => {
    if (mounted && typeof window !== 'undefined') {
      window.localStorage.setItem('cyo_profile_v1', JSON.stringify(data))
    }
    router.push('/taste-tuner')
    setSubmitted(true)
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#1a0b2e] p-6 text-white shadow-sm">
              <div className="text-sm font-medium opacity-90">Profile Ritual</div>
              <div className="mt-1 text-2xl font-semibold">Step 1 of 5</div>
              <div className="mt-2 text-sm opacity-90">Under 5 minutes. Zero pressure. Maximum clarity.</div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-black/10 bg-[#24103f] p-6 text-white shadow-sm">
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
          <Card className="overflow-hidden border-black/10 bg-[#f6f1e7] shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Identity Basics</CardTitle>
              <CardDescription>Let’s get the essentials so the rest can feel effortless.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-muted-foreground">Loading your profile wizard...</div>
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
            <div className="mt-1 text-2xl font-semibold">Step {step} of {totalSteps}</div>
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
            <CardTitle className="text-2xl">{stepTitle}</CardTitle>
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
                  <div className="text-lg font-semibold">Profile saved ✨</div>
                  <div className="mt-2 text-sm text-muted-foreground">
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
                      router.push('/taste-tuner')
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
                  {step === 5 ? <Step7 data={data} setData={setData} /> : null}
                  {step === 6 ? <Step8 data={data} setData={setData} /> : null}
                  {step === 7 ? <Step9 data={data} setData={setData} /> : null}
                </div>

                <div className="mt-auto">
                  <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                    <Button type="button" variant="outline" onClick={goBack} disabled={step === 1}>
                      Back
                    </Button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      {step < 7 ? (
                        <Button type="button" onClick={goNext} disabled={!canContinue(step)}>
                          Next
                        </Button>
                      ) : (
                        <Button type="button" onClick={onSubmit}>
                          Complete profile
                        </Button>
                      )}
                    </div>
                  </div>

                  {!canContinue(step) ? (
                    <div className="mt-3 text-xs text-muted-foreground">
                      {step === 1 && 'Add your display name, email, and phone — then we\'ll continue.'}
                      {step === 2 && 'Select at least one tone.'}
                      {step === 3 && 'Select at least one vibe.'}
                      {step === 4 && 'Select at least one era.'}
                      {step === 5 && 'Fill in your sizing information to help us find the perfect fit.'}
                      {step === 6 && 'Tell us about your fabric preferences and care comfort level.'}
                      {step === 7 && 'Select the occasions where you\'ll be wearing these pieces.'}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Step1({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">A quick hello.</div>
        <div className="mt-1 text-sm text-muted-foreground">
          This helps us label your closet spells and keep your account reachable.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel title="Display name" hint="Required" />
          <Input
            value={data.displayName}
            onChange={(e) => setData({ ...data, displayName: e.target.value })}
            placeholder="What should we call you?"
            required
          />
        </div>

        <div className="space-y-2">
          <FieldLabel title="Pronouns" hint="Optional — you can skip" />
          <div className="flex gap-2">
            <Input
              value={data.pronouns}
              onChange={(e) => setData({ ...data, pronouns: e.target.value })}
              placeholder="e.g. she/her, they/them"
            />
            <Button type="button" variant="outline" onClick={() => setData({ ...data, pronouns: '' })}>
              Skip
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel title="Email" hint="Required" />
          <Input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="you@domain.com"
            required
          />
        </div>

        <div className="space-y-2">
          <FieldLabel title="Phone number" hint="Required" />
          <Input
            type="tel"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="(555) 555-5555"
            required
          />
        </div>
      </div>
    </div>
  )
}

function Step2({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  const toggle = (value: string) => {
    const exists = data.tones.includes(value)
    setData({
      ...data,
      tones: exists ? data.tones.filter((v) => v !== value) : [...data.tones, value],
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">Pick your tones.</div>
        <div className="mt-1 text-sm text-muted-foreground">
          These help map your music taste to wardrobe energy.
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TONES.map((tone) => (
          <TogglePill
            key={tone}
            selected={data.tones.includes(tone)}
            onClick={() => toggle(tone)}
          >
            {tone}
          </TogglePill>
        ))}
      </div>
    </div>
  )
}

function Step3({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  const hasCustom = (data.vibes || []).some((v) => !ALLOWED_VIBES_SET.has(v))
  const [otherEnabled, setOtherEnabled] = useState<boolean>(hasCustom)
  const [otherText, setOtherText] = useState('')

  const toggle = (value: string) => {
    const exists = data.vibes.includes(value)
    setData({
      ...data,
      vibes: exists ? data.vibes.filter((v) => v !== value) : [...data.vibes, value],
    })
  }

  const addOther = () => {
    const cleaned = otherText.trim()
    if (!cleaned) return
    if (data.vibes.includes(cleaned)) {
      setOtherText('')
      return
    }
    setData({ ...data, vibes: [...data.vibes, cleaned] })
    setOtherText('')
  }

  const toggleOther = (checked: boolean) => {
    setOtherEnabled(checked)
    if (!checked) {
      setOtherText('')
      setData({ ...data, vibes: (data.vibes || []).filter((v) => ALLOWED_VIBES_SET.has(v)) })
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">Choose your vibes.</div>
        <div className="mt-1 text-sm text-muted-foreground">
          These are the main tags we use to connect your music taste to clothing recommendations.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {VIBES_GROUPS.map((group) => (
          <div key={group.title} className="rounded-2xl border border-[hsl(var(--border))] bg-white/40 p-4 shadow-sm">
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {group.title}
            </div>
            <div className="flex flex-wrap gap-2">
              {group.options.map((v) => (
                <TogglePill
                  key={v}
                  selected={data.vibes.includes(v)}
                  onClick={() => toggle(v)}
                >
                  {v}
                </TogglePill>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <ToggleSwitch checked={otherEnabled} onCheckedChange={toggleOther} label="Other" />

        {otherEnabled ? (
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/40 p-4 shadow-sm">
            <div className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">What’s the other vibe?</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addOther()
                  }
                }}
                placeholder="Type a vibe and add it"
              />
              <Button type="button" onClick={addOther} variant="outline" className="shrink-0">
                Add
              </Button>
            </div>

            {(data.vibes || []).filter((v) => !ALLOWED_VIBES_SET.has(v)).length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {(data.vibes || [])
                  .filter((v) => !ALLOWED_VIBES_SET.has(v))
                  .map((v) => (
                    <TogglePill key={v} selected={true} onClick={() => toggle(v)}>
                      {v}
                    </TogglePill>
                  ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Step4({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  const toggle = (value: (typeof ERAS)[number]) => {
    const exists = data.eras.includes(value)
    setData({
      ...data,
      eras: exists ? data.eras.filter((v) => v !== value) : [...data.eras, value],
    })
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">Pick your preferred eras.</div>
        <div className="mt-1 text-sm text-muted-foreground">Multi-select.</div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ERAS.map((era) => (
          <TogglePill key={era} selected={data.eras.includes(era)} onClick={() => toggle(era)}>
            {era}
          </TogglePill>
        ))}
      </div>
    </div>
  )
}

function Step7({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">Body reality, no drama.</div>
        <div className="mt-1 text-sm text-muted-foreground">
          This is here to make browsing easier and returns rarer. Share only what helps.
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <FieldLabel title="Height range" />
          <Select value={data.heightRange} onChange={(e) => setData({ ...data, heightRange: e.target.value })}>
            <option value="">Select…</option>
            {HEIGHT_RANGES.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel title="Shoe size" />
          <Input
            value={data.shoeSize}
            onChange={(e) => setData({ ...data, shoeSize: e.target.value })}
            placeholder="e.g. 8, 8.5, 39"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel title="Typical top size" />
          <Select value={data.topSizeRange} onChange={(e) => setData({ ...data, topSizeRange: e.target.value })}>
            <option value="">Select…</option>
            {SIZE_RANGES_TOP.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <FieldLabel title="Typical bottom size" />
          <Input
            value={data.bottomSizeRange}
            onChange={(e) => setData({ ...data, bottomSizeRange: e.target.value })}
            placeholder="e.g. 8, 12, 4–6, M, varies"
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel title="Fit notes" hint="Optional — anything we should know?" />
        <Textarea
          value={data.fitNotes}
          onChange={(e) => setData({ ...data, fitNotes: e.target.value })}
          placeholder="Examples: prefer high-rise, sensitive shoulders, love stretchy waistbands…"
        />
      </div>
    </div>
  )
}

function Step8({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">Closet comfort level</div>
        <div className="mt-1 text-sm text-muted-foreground">
          This helps us calibrate risk (and fabrics) with care.
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel title="Fabric sensitivities" hint="Optional — multi-select" />
        <div className="flex flex-wrap gap-2">
          {FABRIC_SENSITIVITIES.map((s) => (
            <TogglePill
              key={s}
              selected={data.fabricSensitivities.includes(s)}
              onClick={() => toggleSensitivity(s)}
            >
              {s}
            </TogglePill>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel title="Garment care comfort" hint="Single select" />
        <div className="grid gap-2 sm:grid-cols-3">
          {CARE_COMFORT.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setData({ ...data, garmentCareComfort: c })}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm text-left transition-colors',
                data.garmentCareComfort === c
                  ? 'border-transparent bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-muted/40'
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function Step9({ data, setData }: { data: WizardData; setData: (v: WizardData) => void }) {
  const toggle = (value: string) => {
    const exists = data.occasions.includes(value)
    setData({
      ...data,
      occasions: exists ? data.occasions.filter((v) => v !== value) : [...data.occasions, value],
    })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-black/10 bg-accent p-4 text-accent-foreground">
        <div className="text-sm font-medium">Occasion orbit</div>
        <div className="mt-1 text-sm text-muted-foreground">
          This helps us recommend pieces that match your real life.
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel title="What do you dress for?" hint="Multi-select" />
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <TogglePill key={o} selected={data.occasions.includes(o)} onClick={() => toggle(o)}>
              {o}
            </TogglePill>
          ))}
        </div>
      </div>
    </div>
  )
}
