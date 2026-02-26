 'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

function LandingClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const [entering, setEntering] = useState(false)

  const onEnterCloset = async () => {
    if (!isLoaded || entering) return

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    setEntering(true)
    try {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const profile = await res.json().catch(() => null)
        if (profile && typeof profile === 'object' && 'clerkUserId' in profile) {
          router.push('/profile')
          return
        }
      }
    } catch {
      // ignore
    } finally {
      setEntering(false)
    }

    router.push('/profile-wizard')
  }

  return (
    <main className="text-[hsl(var(--foreground))]">
      {/* Hero Section */}
      <section id="portal" className="relative bg-[hsl(var(--ink-dark))] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <h1 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Joni&apos;s Closet Club
          </h1>
          <div className="mt-10 max-w-4xl space-y-8 text-lg leading-relaxed text-white/85 md:text-xl">
            <p>Born from loving clothes too much to ever let them go.</p>
            <p className="font-semibold">A solution for:</p>
            <div className="grid gap-3 text-xl font-semibold md:grid-cols-2">
              <div>Collectors</div>
              <div>Thrillers</div>
              <div>Glamour hoarders</div>
              <div>And those who live light but still want access to everything</div>
            </div>
            <p>This is a clothing-sharing ecosystem built on trust, care, and endless swap-outs.</p>
            <p className="text-2xl font-bold text-white md:text-3xl">
              Your closet just got a lot bigger — without taking over your house.
            </p>
          </div>
        </div>
      </section>

      {/* App Section */}
      <section id="app" className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            Change Your Outfit
            <br />
            Change The World
            <span className="block text-2xl font-extrabold tracking-tight sm:text-3xl md:text-4xl">(The App)</span>
          </h2>
          <div className="mt-10 max-w-4xl space-y-8 text-lg leading-relaxed md:text-xl">
            <p>Browse the closet.</p>
            <p>Reserve pieces.</p>
            <p>Track your looks.</p>
            <p>Tell the stories your outfits unlock.</p>
            <p className="text-2xl font-black tracking-tight md:text-3xl">Clothing lives longer when its stories are shared.</p>
          </div>
        </div>
      </section>

      {/* Culture Section */}
      <section id="culture" className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">A 24-Hour Culture Experiment</h2>
          <div className="mt-10 max-w-4xl space-y-8 text-lg leading-relaxed md:text-xl">
            <p>Before &amp; Afters runs on shared presence.</p>
            <p>
              Members plug into weekly time slots — leading, supporting, co-creating — to simulate a living, breathing 24-hour culture.
            </p>
            <p>
              From meditation naptime to character balls, from sparkle sessions to closet karaoke,
              this is where clothing meets community.
            </p>
          </div>
        </div>
      </section>

      {/* Invitation Section */}
      <section id="invitation" className="relative bg-[hsl(var(--ink-dark))] text-white">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
          <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">Let&apos;s Play Dress Up</h2>
          <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed text-white/85 md:text-xl">
            <p>
              This is a trust-based ecosystem.
              <br />
              A shared wardrobe.
              <br />
              A collective story.
            </p>
            <p className="text-2xl font-bold text-white md:text-3xl">If you feel the call, you&apos;re already part of it.</p>
          </div>
          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Button type="button" onClick={onEnterCloset} size="lg">
              Enter the Closet
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="/memberships">Join the Club</a>
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
