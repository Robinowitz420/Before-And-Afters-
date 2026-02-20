 'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function LandingClient() {
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()

  const onEnterCloset = () => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.push('/sign-in')
      return
    }

    router.push('/profile-wizard')
  }

  return (
    <main className="bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <section id="portal" className="relative">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
          <div className="overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-white shadow-sm">
            <Image src="/images/LANDING/1.jpg" alt="Landing page section 1" width={2025} height={1141} className="h-auto w-full" priority />
          </div>
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
              <a href="#learn-more">Learn More</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="learn-more" className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/2.jpg" alt="Landing page section 2" width={2025} height={1141} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/3.jpg" alt="Landing page section 3" width={2025} height={1141} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/4.jpg" alt="Landing page section 4" width={2025} height={1359} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/5.jpg" alt="Landing page section 5" width={2025} height={1141} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/6.jpg" alt="Landing page section 6" width={2025} height={1141} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/7.jpg" alt="Landing page section 7" width={2025} height={1514} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/8.jpg" alt="Landing page section 8" width={2025} height={1350} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/9.jpg" alt="Landing page section 9" width={2025} height={1141} className="h-auto w-full" />
        </div>
      </section>

      <section className="relative">
        <div className="mx-auto max-w-6xl px-6 pb-10">
          <Image src="/images/LANDING/10.jpg" alt="Landing page section 10" width={2025} height={1141} className="h-auto w-full" />
        </div>
        <div className="mx-auto max-w-6xl px-6 pb-20">
          <Button type="button" onClick={onEnterCloset} size="lg">
            Create Your Free Profile
          </Button>
        </div>
      </section>
    </main>
  )
}

export default function Home() {
  return <LandingClient />
}
