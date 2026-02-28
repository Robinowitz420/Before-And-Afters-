 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function LandingClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [entering, setEntering] = useState(false)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkProfile() {
      if (!isLoaded || !isSignedIn) {
        setHasProfile(false)
        return
      }
      try {
        const res = await fetch('/api/profile')
        if (res.ok) {
          const profile = await res.json().catch(() => null)
          setHasProfile(profile && typeof profile === 'object' && 'clerkUserId' in profile)
        } else {
          setHasProfile(false)
        }
      } catch {
        setHasProfile(false)
      }
    }
    checkProfile()
  }, [isLoaded, isSignedIn])

  const onEnterCloset = async () => {
    if (!isLoaded || entering) return

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    setEntering(true)
    try {
      const res = await fetch('/api/profile')
      if (res.status === 401) {
        // Session expired or invalid, go to sign in
        router.push('/sign-in')
        return
      }
      if (res.ok) {
        const profile = await res.json().catch(() => null)
        if (profile && typeof profile === 'object' && 'clerkUserId' in profile) {
          router.push('/profile')
          return
        }
      }
    } catch (e) {
      console.error('Profile check error:', e)
    } finally {
      setEntering(false)
    }

    // No profile found, go to wizard
    router.push('/profile-wizard')
  }

  const buttonText = !isLoaded
    ? 'Enter'
    : !isSignedIn
      ? 'Enter'
      : hasProfile
        ? 'Enter'
        : 'Create Profile'

  return (
    <main className="text-[hsl(var(--foreground))]">
      {/* Hero Section */}
      <section id="portal" className="relative bg-[hsl(var(--ink-dark))] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Joni&apos;s Dress Up Box
          </h1>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
            <p>Born from loving clothes too much to ever let them go.</p>
            <p className="font-semibold">A solution for:</p>
            <div className="mx-auto grid max-w-xl gap-2 text-lg font-semibold sm:text-xl md:grid-cols-2">
              <div>Collectors</div>
              <div>Thrillers</div>
              <div>Glamour hoarders</div>
              <div>Those who live light but want access to everything</div>
            </div>
            <p>This is a clothing-sharing ecosystem built on trust, care, and endless swap-outs.</p>
            <p className="text-xl font-bold text-white sm:text-2xl md:text-3xl">
              Your closet just got a lot bigger — without taking over your house.
            </p>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button type="button" onClick={onEnterCloset} size="lg" disabled={entering}>
              {entering ? 'Loading...' : buttonText}
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl text-center">Mission</h2>
          <div className="mt-8 space-y-6 text-base leading-relaxed sm:text-lg md:text-xl">
            <p>
              Our mission is to make the magic of clothing available to everyone in NYC — from high-end transformation seekers,
              to young artists finding their true expression, to kids dressing like their favorite character, to anyone who simply
              wants better options (or a new way to show up).
            </p>
            <p>
              We&apos;re building the structures, protocols, and technology for the fruitful sharing of clothing — and the stories it holds.
              Clothing carries history, culture, and fresh meaning every time it&apos;s worn.
            </p>
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-white/60 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold tracking-wide text-[hsl(var(--ink))]/80">In practice</div>
              <ul className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <span>Playful experimentation as a tool for personal development.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <span>Intentional style as a path to embodiment.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <span>Ritual + community as a way to stay luminous.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section id="offerings" className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <h2 className="text-balance text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl text-center">How we do it</h2>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
              <h3 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">Before &amp; Afters (Flagship)</h3>
              <p className="mt-3 text-[hsl(var(--ink))]/80">
                Tucked away at 222 Bogart St in Brooklyn, our 24-hour flagship houses clothing operations and the primary Dress Up collection.
              </p>
              <ul className="mt-5 space-y-3 text-[hsl(var(--ink))]/85">
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>Access to clothes after other stores close — and before they open.</span></li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>A portal for getting-ready, afters programming, and intentional play.</span></li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>Creative organization + rotation systems designed for NYC life.</span></li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
              <h3 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">Dorothy the Dress Up Bus</h3>
              <p className="mt-3 text-[hsl(var(--ink))]/80">
                Dorothy is our mobile extension — distributing dream dress-up options across NYC.
              </p>
              <ul className="mt-5 space-y-3 text-[hsl(var(--ink))]/85">
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>From shelters and schools to street-corner surprises.</span></li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>On-call help for members: deliveries, last-minute essentials, donation pickup.</span></li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>Built to support brains, heart, courage — and outfits.</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
              <h3 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">The Isle of Check Meowt</h3>
              <p className="mt-3 text-[hsl(var(--ink))]/80">
                Our for-sale essentials &amp; delights — the little things that complete the look.
              </p>
              <ul className="mt-5 space-y-3 text-[hsl(var(--ink))]/85">
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>Stockings, socks, undies, accessories, gifts, last-minute add-ons.</span></li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>Low prices, high dopamine — many items are 1 Glitcoin for members.</span></li>
              </ul>
            </div>

            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
              <h3 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">The Spritz n Glitz Bar</h3>
              <p className="mt-3 text-[hsl(var(--ink))]/80">
                Beauty and hygiene essentials for quick fixes or full party prep.
              </p>
              <ul className="mt-5 space-y-3 text-[hsl(var(--ink))]/85">
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>Makeup, hair supplies, sparkles, fragrance, deodorant, wipes, dental care.</span></li>
                <li className="flex gap-3"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" /><span>DIY anytime, or get help from in-house / featured artists.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section id="invitation" className="relative bg-[hsl(var(--ink-dark))] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
          <h2 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">Ready to play?</h2>
          <div className="mt-8 space-y-6 text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
            <p className="text-xl font-bold text-white sm:text-2xl md:text-3xl">If you feel the call, you&apos;re already part of it.</p>
            <p>Enter to build your profile and start exploring.</p>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button type="button" onClick={onEnterCloset} size="lg" disabled={entering}>
              {entering ? 'Loading...' : buttonText}
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default function Home() {
  return <LandingClient />
}
