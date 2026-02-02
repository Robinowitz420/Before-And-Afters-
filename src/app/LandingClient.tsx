'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'

import { Button } from '@/components/ui/button'
import { ProfileWizard } from '@/app/profile-wizard/ProfileWizard'
import { cn } from '@/lib/utils'

export function LandingClient() {
  const [wizardOpen, setWizardOpen] = useState(false)

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
              Change Your Outfit
              <br />
              Change The World
            </h1>
            <p className="mt-8 max-w-2xl text-xl font-medium leading-snug text-white/90 md:text-2xl">
              Clothing isn’t just a basic need.
              <br />
              It’s a technology for transformation.
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
              What you wear shapes how you move, how you’re seen, and how you experience life.
              <br />
              Play with clothing long enough and it starts playing back.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button type="button" onClick={() => setWizardOpen(true)}>
                Enter the Closet
              </Button>
              <Button asChild variant="secondary">
                <a href="/memberships">Join / Renew Membership</a>
              </Button>
              <Button
                asChild
                variant="outline"
                className={cn('bg-[hsl(var(--background))] text-[hsl(var(--ink))] hover:bg-[hsl(var(--background))]/90')}
              >
                <a href="#philosophy">Learn More</a>
              </Button>
            </div>
            <div className="mt-14 text-xs font-medium uppercase tracking-[0.2em] text-white/70">Scroll</div>
          </div>
        </section>

        <section id="philosophy" className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">Clothing Is Conscious</h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed md:text-xl">
              <p>
                The fabrics and adornments we wear carry stories — of the hands that made them, the bodies that moved in them,
                the eras and cultures that shaped them. When we wear something, we don’t just put it on — we activate it.
              </p>
              <p>
                Being intentional with clothing is a path to embodiment.
                <br />
                Being ritualistic opens the door to insight.
              </p>
              <p className="font-semibold">This is fashion as a practice, not a product.</p>
            </div>
          </div>
        </section>

        <section id="mission" className="relative bg-[hsl(var(--secondary))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              The Magic of Clothing, For Everyone
            </h2>
            <div className="mt-10 max-w-4xl space-y-8 text-lg leading-relaxed md:text-xl">
              <p>
                From high-end clients seeking personal transformation,
                <br />
                to young artists finding their voice,
                <br />
                to kids dressing like their favorite character,
                <br />
                to people who never thought twice about their button-down and jeans —
              </p>
              <p>
                This is about access.
                <br />
                To beauty. To play. To possibility.
              </p>
              <p className="text-2xl font-black tracking-tight md:text-3xl">NYC deserves an endless closet.</p>
            </div>
          </div>
        </section>

        <section id="before-afters" className="relative bg-[hsl(var(--ink-dark))] text-white">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -left-24 top-16 h-[22rem] w-[22rem] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute right-0 top-1/2 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Before &amp; Afters
              <br />
              A 24-Hour Closet Portal
            </h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed text-white/85 md:text-xl">
              <p>A physical home for clothing operations, creative experiments, and community ritual.</p>
              <p>
                Come get dressed after the city closes.
                <br />
                Come play before it wakes back up.
              </p>
              <p>
                Here we test new ways of organizing, rotating, and displaying clothing — optimized for real Brooklyn apartments,
                real lives, and real chaos.
              </p>
              <p className="text-2xl font-bold text-white md:text-3xl">Sometimes getting dressed is the event.</p>
            </div>
          </div>
        </section>

        <section id="dorothy" className="relative bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
              Dorothy the Dressup Bus
            </h2>
            <p className="mt-6 text-xl font-semibold md:text-2xl">Your Mobile Wardrobe Miracle</p>
            <div className="mt-10 max-w-4xl space-y-8 text-lg leading-relaxed md:text-xl">
              <p>
                From shelters to schools, food drives to street corners, Dorothy delivers dream outfits to those who need them most.
              </p>
              <p className="font-semibold">She’s also on call for:</p>
              <div className="grid gap-3 text-xl font-semibold md:grid-cols-2">
                <div>Fashion emergencies</div>
                <div>Donation offloads</div>
                <div>Surprise transformations</div>
                <div>Outfit destiny</div>
              </div>
              <p>
                Helping everyone find the brains, heart, courage — and outfits — to meet their most magical self.
              </p>
            </div>
          </div>
        </section>

        <section id="joni" className="relative bg-[hsl(var(--ink-dark))] text-white">
          <div className="absolute inset-0 opacity-60">
            <div className="absolute -right-24 top-20 h-[26rem] w-[26rem] rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -left-24 bottom-10 h-[22rem] w-[22rem] rounded-full bg-white/5 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">Joni’s Closet Club</h2>
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

        <section id="invitation" className="relative bg-[hsl(var(--ink-dark))] text-white">
          <div className="mx-auto max-w-6xl px-6 py-24 md:py-28">
            <h2 className="text-balance text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">Let’s Play Dress Up</h2>
            <div className="mt-10 max-w-3xl space-y-8 text-lg leading-relaxed text-white/85 md:text-xl">
              <p>
                This is a trust-based ecosystem.
                <br />
                A shared wardrobe.
                <br />
                A collective story.
              </p>
              <p className="text-2xl font-bold text-white md:text-3xl">If you feel the call, you’re already part of it.</p>
            </div>
            <div className="mt-12">
              <Button type="button" onClick={() => setWizardOpen(true)}>
                Enter the Closet
              </Button>
              <Button asChild variant="secondary" className="ml-0 mt-4 sm:ml-4 sm:mt-0">
                <a href="/memberships">Join / Renew Membership</a>
              </Button>
            </div>
          </div>
        </section>
      </Dialog.Root>
    </div>
  )
}
