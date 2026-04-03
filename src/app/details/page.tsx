'use client'

import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default function DetailsPage() {
  return (
    <main className="text-[hsl(var(--foreground))]">
      <section className="relative bg-[hsl(var(--background))]">
        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 md:py-24">
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Details</div>
            <h1 className="mt-2 text-balance text-3xl font-black tracking-tight text-[hsl(var(--ink))] sm:text-5xl">
              Before &amp; Afters (Flagship)
            </h1>
            <p className="mt-4 text-base leading-relaxed text-[hsl(var(--ink))]/80 sm:text-lg">
              Tucked away at <span className="font-semibold text-[hsl(var(--ink))]">222 Bogart St</span> in Brooklyn, our 24-hour flagship
              houses clothing operations and the primary Dress Up collection.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
              <h2 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">Address</h2>
              <div className="mt-4 space-y-2 text-[hsl(var(--ink))]/85">
                <div className="font-semibold text-[hsl(var(--ink))]">222 Bogart St</div>
                <div>Brooklyn, NY</div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="secondary" className="w-full sm:w-auto">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=222%20Bogart%20St%2C%20Brooklyn%2C%20NY"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open in Maps
                  </a>
                </Button>
                <Button asChild className="w-full sm:w-auto">
                  <a href="/memberships">View Memberships</a>
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
              <h2 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">What it is</h2>
              <ul className="mt-5 space-y-3 text-[hsl(var(--ink))]/85">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <span>Access to clothing after other stores close — and before they open.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <span>A space to get ready, reset, and play with intentional programming.</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[hsl(var(--primary))]" />
                  <span>Systems for rotating, organizing, and sharing pieces (built for NYC life).</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-[hsl(var(--border))] bg-white/60 p-8 shadow-sm backdrop-blur">
            <h2 className="text-2xl font-extrabold tracking-tight text-[hsl(var(--ink))]">Mission, in one line</h2>
            <p className="mt-3 text-base leading-relaxed text-[hsl(var(--ink))]/85 sm:text-lg">
              Make the magic of clothing available to everyone in NYC — and build the structures for sharing clothing and the stories it holds.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
