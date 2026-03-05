 'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

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
      <section id="portal" className="relative text-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="mx-auto w-full max-w-5xl">
            <Image
              src="/images/herobannere.jpg"
              alt="Before & Afters"
              width={2400}
              height={900}
              className="h-auto w-full"
              priority
            />
          </div>

          <div className="mt-10 text-center">
          <h1 className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            CLOTHING PROBLEMS ARE REAL! Lemme get this straight…..
          </h1>
          <div className="mt-8 space-y-6 text-base leading-relaxed sm:text-lg md:text-xl">
            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-[hsl(var(--ink))] shadow-sm backdrop-blur md:p-8">
            <p>
              You’re busy AF, you want to look absolutely amazing and magnetic but not over the top, you want to try new outfits and vibes all the
              time without spending all your money or time doing it, you want to slay the business meeting AND the theme party AND the bodega run,
              you would love leveling up your looks with some sweet easily-accessible stylist support, you are flabbergasted that there are no clothing
              stores open at night and would love to shop outside normal retail hours in a non-retaily kinda way, you’re somehow both very bored and
              very overwhelmed with the state of your closet, your “giveaway tote” has been lurking in the corner for six months, your cute denim
              upcycling concept is lingering lavishly on MaybeSomeday Island along with your raging rebel rockstar dreams, you’re low key torn up
              about your contribution to the fast fashion machine that is actively destroying the planet….. and at the end of the day you honestly
              kinda miss being 5 and just really want to play dress up in a magical make believe land with friends all day!!!!
            </p>
            <p>Well it’s time to make…. BELIEVE. (And then believe bigger.)</p>
            <p>
              All this free will you have, planted with intention right here in the cauldron of the greatest most creative city in the world, here to
              make your iconic mark, leave your lasting legacy, and have the absolute most fun possible while doing it…. Ask yourself: ARE YOU
              DRESSING THE PART??!?!?
            </p>
            <p>Welcome to Before &amp; Afters.</p>
            <p>Helloooo love, I’m Michelle Joni!</p>
            <p>
              Born from my own (horrifyingly first world) clothing problem of having too many clothes to fit in my 5 closets, entire basement and two
              storage units combined, but never wanting to sell, swap, say goodbye to a damn thing, or have to stop myself from acquiring more and more
              amazing clothing for any reason whatsoever…… I desperately needed a solution to save my space, my sanity, and my sartorial soul!
            </p>
            <p>JONI’S DRESS UP BOX IS HERE. &lt;3</p>
            <p>Not just to solve my silly avoidable problem…</p>
            <p>
              To activate a glorious symphony of SOLUTIONS! Solutions wrought through my cumbersome commitment to clothing, the brave baby steps I took
              along the way to expand my comfort zone inch by inch. Solutions to problems I wouldn’t have known existed if not for my self inflicted
              regimen of self-development mixed with passionate public shenanigans where I was pushed to discover just how much clothing, adornment,
              and dressing up really does matter… if you let it!
            </p>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button type="button" onClick={onEnterCloset} size="lg" disabled={entering}>
              {entering ? 'Loading...' : buttonText}
            </Button>
          </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="mission" className="relative text-[hsl(var(--foreground))]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-[hsl(var(--ink))] shadow-sm backdrop-blur md:p-8 lg:col-span-12">
              <div className="space-y-6 text-base leading-relaxed sm:text-lg md:text-xl">
                <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-6xl first-letter:font-black first-letter:leading-none first-letter:text-[hsl(var(--ink-dark))]">
                  You’re busy AF, you want to look absolutely amazing and magnetic but not over the top, you want to try new outfits and vibes all the
                  time without spending all your money or time doing it, you want to slay the business meeting AND the theme party AND the bodega run,
                  you would love leveling up your looks with some sweet easily-accessible stylist support, you are flabbergasted that there are no clothing
                  stores open at night and would love to shop outside normal retail hours in a non-retaily kinda way, you’re somehow both very bored and
                  very overwhelmed with the state of your closet, your “giveaway tote” has been lurking in the corner for six months, your cute denim
                  upcycling concept is lingering lavishly on MaybeSomeday Island along with your raging rebel rockstar dreams, you’re low key torn up
                  about your contribution to the fast fashion machine that is actively destroying the planet….. and at the end of the day you honestly
                  kinda miss being 5 and just really want to play dress up in a magical make believe land with friends all day!!!!
                </p>
                <p>Well it’s time to make…. BELIEVE. (And then believe bigger.)</p>
              </div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-[hsl(var(--ink))] shadow-sm backdrop-blur md:p-8 lg:col-span-4">
              <div className="space-y-6 text-base leading-relaxed sm:text-lg md:text-xl">
                <p>
                  All this free will you have, planted with intention right here in the cauldron of the greatest most creative city in the world, here to
                  make your iconic mark, leave your lasting legacy, and have the absolute most fun possible while doing it…. Ask yourself: ARE YOU
                  DRESSING THE PART??!?!?
                </p>
                <p>Welcome to Before &amp; Afters.</p>
              </div>
            </div>

            <figure className="w-full lg:col-span-8">
              <Image
                src="/images/Joni%20Images/JoniSofa.jpg"
                alt="Michelle Joni"
                width={1600}
                height={2000}
                className="h-auto w-full"
                priority
              />
            </figure>
          </div>

          <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-start">
            <figure className="lg:col-span-7">
              <Image
                src="/images/Joni%20Images/JoniHero.jpeg"
                alt="Before & Afters"
                width={2000}
                height={1250}
                className="h-auto w-full"
              />
            </figure>

            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 text-[hsl(var(--ink))] shadow-sm backdrop-blur sm:text-lg md:p-8 md:text-xl lg:col-span-5">
              <div className="space-y-6 text-base leading-relaxed">
                <p>Helloooo love, I’m Michelle Joni!</p>
                <p>
                  Born from my own (horrifyingly first world) clothing problem of having too many clothes to fit in my 5 closets, entire basement and two
                  storage units combined, but never wanting to sell, swap, say goodbye to a damn thing, or have to stop myself from acquiring more and more
                  amazing clothing for any reason whatsoever…… I desperately needed a solution to save my space, my sanity, and my sartorial soul!
                </p>
                <p>JONI’S DRESS UP BOX IS HERE. &lt;3</p>
              </div>
            </div>
          </div>

          <div className="mt-14 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-start">
            <div className="order-2 rounded-3xl border border-black/10 bg-white/80 p-6 text-[hsl(var(--ink))] shadow-sm backdrop-blur sm:text-lg md:p-8 md:text-xl lg:order-1 lg:col-span-5">
              <div className="space-y-6 text-base leading-relaxed">
                <p>Not just to solve my silly avoidable problem…</p>
                <p>
                  To activate a glorious symphony of SOLUTIONS! Solutions wrought through my cumbersome commitment to clothing, the brave baby steps I took
                  along the way to expand my comfort zone inch by inch. Solutions to problems I wouldn’t have known existed if not for my self inflicted
                  regimen of self-development mixed with passionate public shenanigans where I was pushed to discover just how much clothing, adornment,
                  and dressing up really does matter… if you let it!
                </p>
              </div>
            </div>

            <figure className="order-1 lg:order-2 lg:col-span-7">
              <Image
                src="/images/Joni%20Images/JoniColorsGlam.jpg"
                alt="Editorial"
                width={2000}
                height={1250}
                className="h-auto w-full"
              />
            </figure>
          </div>
        </div>
      </section>

      {/* Offerings */}
      <section id="offerings" className="relative text-[hsl(var(--foreground))]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <div className="mx-auto w-fit rounded-3xl border border-black/10 bg-white/80 px-6 py-4 shadow-sm backdrop-blur md:px-10">
            <h2 className="text-balance text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl text-center text-[hsl(var(--ink))]">
              How we do it
            </h2>
          </div>

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
      <section id="invitation" className="relative text-white">
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
