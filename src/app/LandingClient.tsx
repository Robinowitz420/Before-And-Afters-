'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

import { Button } from '@/components/ui/button'
import { ProfileWizard } from '@/app/profile-wizard/ProfileWizard'
import { cn } from '@/lib/utils'

export function LandingClient() {
  const [wizardOpen, setWizardOpen] = useState(false)
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const onEnterCloset = async () => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=${encodeURIComponent('/profile')}`)
      return
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'GET',
        headers: { 'content-type': 'application/json' },
      })

      if (res.status === 401) {
        router.push(`/sign-in?redirect_url=${encodeURIComponent('/profile')}`)
        return
      }

      if (!res.ok) {
        router.push('/profile-wizard')
        return
      }

      const profile = (await res.json()) as { data?: unknown } | null
      const hasProfile = Boolean(profile && profile.data && typeof profile.data === 'object')
      router.push(hasProfile ? '/profile' : '/profile-wizard')
    } catch {
      router.push('/profile-wizard')
    }
  }

  return (
    <div className="w-full">
      <Dialog.Root open={wizardOpen} onOpenChange={setWizardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 h-[min(980px,calc(100vh-2rem))] w-[min(1120px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] shadow-2xl">
            <div className="wizard-theme-alt wizard-soft-orange h-full p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Profile Ritual</div>
                  <div className="mt-1 text-lg font-semibold">Enter the Closet</div>
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

              <div className="mt-5 h-[calc(100%-3rem)] overflow-y-auto pr-2">
                <ProfileWizard />
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>

        <section id="portal" className="relative min-h-screen text-white">
          <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-24 md:pt-28">
            <h1 className="text-balance text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              Change Your Outfit, Change The World
            </h1>
            <p className="mt-8 max-w-2xl text-xl font-medium leading-snug text-white/90 md:text-2xl">
              Clothing isn&apos;t just fabric—it&apos;s transformation technology.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              What you wear shapes how you move, how you&apos;re seen, how you experience life. Play with clothing long enough, and it starts playing back.
            </p>
            <p className="mt-6 max-w-2xl text-lg font-medium text-white/90">
              Create Your Profile · Join the Club · Explore the Closet
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button type="button" onClick={onEnterCloset}>
                Enter the Closet
              </Button>
              <Button asChild variant="secondary">
                <a href="/memberships">Join the Club</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn('bg-[hsl(var(--background))] text-[hsl(var(--ink))] hover:bg-[hsl(var(--background))]/90')}
              >
                <a href="#what-you-get">Learn More</a>
              </Button>
            </div>
            <div className="mt-14 text-xs font-medium uppercase tracking-[0.2em] text-white/70">Scroll</div>
          </div>
        </section>

        <section id="philosophy" className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">You Deserve an Endless Closet</h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed md:text-xl">
              <p>
                Whether you&apos;re a high-end client seeking transformation, a young artist finding your voice, or someone who never thought twice about their jeans and button-down—this is for you.
              </p>
              <p>
                NYC deserves access to beauty, play, and possibility. We&apos;re making it happen.
              </p>
            </div>
            <div className="mt-10">
              <Button asChild>
                <a href="/profile-wizard">Start Your Free Trial</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="what-you-get" className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">What You Get</h2>
            <div className="mt-12 space-y-16">
              <div>
                <h3 className="text-2xl font-bold md:text-3xl">🏠 The 24-Hour Closet Portal</h3>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed">
                  A physical space in Brooklyn for getting dressed, experimenting, and community ritual. Come after midnight. Come before dawn. Sometimes getting dressed is the event.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold md:text-3xl">🚌 Dorothy the Dressup Bus</h3>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed">
                  Your mobile wardrobe miracle. From fashion emergencies to surprise transformations, Dorothy delivers dream outfits citywide—to shelters, schools, street corners, and you.
                </p>
              </div>
              <div>
                <h3 className="text-2xl font-bold md:text-3xl">👗 Joni&apos;s Closet Club</h3>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed">
                  Born from loving clothes too much to let them go. A trust-based clothing ecosystem for collectors, thrillers, glamour hoarders, and anyone who wants access to everything without the clutter.
                </p>
                <p className="mt-4 text-xl font-semibold">Your closet just got infinite—without taking over your apartment.</p>
              </div>
              <div>
                <h3 className="text-2xl font-bold md:text-3xl">📱 The App</h3>
                <p className="mt-4 max-w-3xl text-lg leading-relaxed">
                  Browse the collection. Reserve pieces. Track your looks. Tell the stories your outfits unlock. Clothing lives longer when its stories are shared.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">How It Works</h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed md:text-xl">
              <div>
                <p className="font-semibold">1. Create Your Profile</p>
                <p>Tell us your vibe, your size, your dreams. We&apos;ll curate your personal portal into the collection.</p>
              </div>
              <div>
                <p className="font-semibold">2. Browse &amp; Reserve</p>
                <p>Thousands of pieces, endless combinations. Book what speaks to you.</p>
              </div>
              <div>
                <p className="font-semibold">3. Get Dressed, Get Transformed</p>
                <p>Pick up 24/7 at the Portal, meet Dorothy on the street, or swap with club members. Then go be that person.</p>
              </div>
            </div>
            <div className="mt-10">
              <Button asChild>
                <a href="/profile-wizard">Get Started—It&apos;s Free to Browse</a>
              </Button>
            </div>
          </div>
        </section>

        <section id="culture" className="relative bg-[hsl(var(--ink-dark))] text-white">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -left-24 top-16 h-[22rem] w-[22rem] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-0 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Join the Culture Experiment</h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed text-white/85 md:text-xl">
              <p>
                Members plug into weekly time slots—leading closet karaoke, hosting sparkle sessions, co-creating character balls. This is clothing meets community meets ritual.
              </p>
              <p>Before &amp; Afters runs on shared presence. If you feel the call, you&apos;re already part of it.</p>
            </div>
          </div>
        </section>

        <section id="membership" className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Membership Options</h2>
            <div className="mt-12 grid gap-10 md:grid-cols-3">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-8">
                <h3 className="text-xl font-bold">Explorer · Free</h3>
                <ul className="mt-4 space-y-2 text-lg">
                  <li>Browse the full collection</li>
                  <li>Attend community events</li>
                  <li>Reserve up to 2 pieces/month</li>
                </ul>
                <Button asChild className="mt-6 w-full">
                  <a href="/profile-wizard">Start Exploring</a>
                </Button>
              </div>
              <div className="rounded-2xl border-2 border-primary bg-[hsl(var(--background))] p-8">
                <h3 className="text-xl font-bold">Member · $49/month</h3>
                <ul className="mt-4 space-y-2 text-lg">
                  <li>Unlimited reservations</li>
                  <li>24/7 Portal access</li>
                  <li>Dorothy priority pickup</li>
                  <li>Club swap privileges</li>
                </ul>
                <Button asChild className="mt-6 w-full">
                  <a href="/memberships">Become a Member</a>
                </Button>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] p-8">
                <h3 className="text-xl font-bold">Patron · $199/month</h3>
                <ul className="mt-4 space-y-2 text-lg">
                  <li>Everything in Member</li>
                  <li>Personal styling sessions</li>
                  <li>Private Portal hours</li>
                  <li>VIP Dorothy house calls</li>
                  <li>Support our shelter + school programs</li>
                </ul>
                <Button asChild variant="secondary" className="mt-6 w-full">
                  <a href="/memberships">Join as a Patron</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="invitation" className="relative bg-[hsl(var(--ink-dark))] text-white">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">Let&apos;s Play Dress Up</h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed text-white/85 md:text-xl">
              <p>
                This is a trust-based ecosystem. A shared wardrobe. A collective story.
              </p>
              <p className="text-2xl font-bold text-white md:text-3xl">Ready to transform?</p>
            </div>
            <div className="mt-12">
              <Button type="button" onClick={onEnterCloset} size="lg">
                Create Your Free Profile
              </Button>
            </div>
          </div>
        </section>
      </Dialog.Root>
    </div>
  )
}
