'use client'

import { Suspense, useState } from 'react'
import InteractiveMembershipList from './InteractiveMembershipList'

function MobileMembershipsOnly() {
  return (
    <div className="relative left-1/2 h-[100svh] w-screen -translate-x-1/2 bg-black">
      <div className="flex h-full w-full items-center justify-center">
        <div className="w-full">
          <InteractiveMembershipList />
        </div>
      </div>
    </div>
  )
}

export const dynamic = 'force-dynamic'

export default function MembershipsPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const faqs = [
    {
      id: 'club-details',
      question: "Joni's Dress Up Box details",
      answer: `Laundry is included! Just bring your item back and we'll take care of the rest.\n\nThe # of items included in your membership are how many things you take out at one time. You bring the last items back in order to take out new ones - the "swap-out". You can choose and change up your flow - come back daily if you like, keep your things up to two weeks, or swap-hop anytiming in between. You may also swap out some of your items and keep others for longer if you'd like.\n\nIf you want to get more pieces at a time beyond your membership you can!, it is $10 more for the first extra piece, $15 for the second, $20 for the third, and $25 for the fourth, etc.\n\nIf you find yourself always wanting more pieces such that it makes sense to increase your membership, you are welcome upgrade to a higher level at any time!\n\nItems will be marked per piece with any additional charge. Many many pieces will be included with no extra charge. More sentimental, fragile, rare, dry-clean-only, designer, or otherwise high end pieces will be marked with additional cost per borrow, such as $5, $10, $15 and ranging upwards from there.`,
    },
    {
      id: 'lust-lost',
      question: 'What is the Lust it / Lost it fee?',
      answer: `Joni is truly not looking to sell things off in this closet game! (If I were willing to part with things forever, I would’ve opened a regular store, duh.) We’re looking for client-collaborators with integrity and deep respect for wardrobe collecting—people who want to play in the clothing-sharing sandbox with us.

If you “lust it” and want to keep a piece, the Lust It / Lost It (L/L) price will likely be well above market value. You’ll know it’s a cherished piece if the L/L price is a small fortune. Either way, your card will be on file—so if you decide it must be yours, you’ll know the price.

If you run off with our clothing (or an item isn’t returned), you will be charged the L/L fee for that piece.

We’ll have Dorothy in action to make returns and swap-outs easier. If you can’t make it to the store and a piece is past due, we may reach out to coordinate a pickup before charging you.

Late fees are $5/day starting the day after the due date. If an item is not returned after two weeks late, we consider it lost and the L/L fee will be charged (in addition to any accrued late fees).

It’s important to note that this business model is based on trust and integrity. We always start with a baseline of trust, and experience helps shape privileges over time. If we’re just getting to know you, there may be limits on which pieces you can take out at first. If you’re consistently proactive and on time with swap-outs, you’ll earn more and more privileges and leeway.`,
    },
    {
      id: 'glitcoin',
      question: 'What is Glitcoin?',
      answer: `You may have noticed that all prices are in increments of $5. Yes! We are setting out to keep pricing simple - amounts will always include any tax, and we will soon be converting to the Sparkle Economy... to GLITCOIN!\n\n1 Glitcoin -> $5`,
    },
  ]

  return (
    <>
      <div className="sm:hidden">
        <Suspense fallback={<div className="text-[hsl(var(--ink))]/70">Loading tiers…</div>}>
          <MobileMembershipsOnly />
        </Suspense>
      </div>

      <div className="hidden sm:block">
        <div className="mx-auto w-full max-w-5xl px-0 py-10 sm:px-6">
          <Suspense fallback={<div className="text-[hsl(var(--ink))]/70">Loading tiers…</div>}>
            <InteractiveMembershipList />
          </Suspense>

          <div className="mt-12 rounded-2xl border border-[hsl(var(--border))] bg-white/60 p-6 shadow-sm backdrop-blur mx-6 sm:mx-0">
            <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Mission</div>
            <h2 className="mt-2 text-2xl font-semibold text-[hsl(var(--ink))]">Make wardrobe-sharing a form of care</h2>
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--ink))]/85">
              Before & Afters is a clothing-sharing clubhouse built on trust, creativity, and community.

              Your membership supports more than outfits—it helps us keep the closet stocked, cleaned, repaired, and accessible, and it funds the behind-the-scenes labor that makes the magic possible.

              We see this as a kind of mutual-aid / charity model: members help sustain the collection, and we use that support to keep prices grounded, offer leeway when life happens, and make space for more people to participate.
            </div>
          </div>

          <div className="mt-16 px-6 sm:px-0">
            <div className="mb-6">
              <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">FAQ</div>
              <h2 className="mt-2 text-2xl font-semibold text-[hsl(var(--ink))]">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
              {faqs.map((faq) => (
                <details
                  key={faq.id}
                  open={openItem === faq.id}
                  onToggle={(open) => setOpenItem(open ? faq.id : null)}
                  className="group border border-[hsl(var(--border))] rounded-2xl bg-white/60 p-6 shadow-sm backdrop-blur cursor-pointer"
                >
                  <summary className="flex justify-between items-center list-none">
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--accent))]/15 px-4 py-2 text-sm font-semibold text-[hsl(var(--ink))] ring-1 ring-[hsl(var(--accent))]/30">
                      {faq.question}
                    </span>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(var(--border))]/60 text-[hsl(var(--ink))] transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[hsl(var(--ink))]">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
