'use client'

import { Suspense, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import InteractiveMembershipList from './InteractiveMembershipList'

export const dynamic = 'force-dynamic'

export default function MembershipsPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const membershipUrl = 'https://beforeandafters.vercel.app/memberships'

  const faqs = [
    {
      id: 'club-details',
      question: "Joni's Dress Up Box details",
      answer: `Laundry is included! Just bring your item back and we'll take care of the rest.\n\nThe # of items included in your membership are how many things you take out at one time. You bring the last items back in order to take out new ones - the "swap-out". You can choose and change up your flow - come back daily if you like, keep your things up to two weeks, or swap-hop anytiming in between. You may also swap out some of your items and keep others for longer if you'd like.\n\nIf you want to get more pieces at a time beyond your membership you can!, it is $10 more for the first extra piece, $15 for the second, $20 for the third, and $25 for the fourth, etc.\n\nIf you find yourself always wanting more pieces such that it makes sense to increase your membership, you are welcome upgrade to a higher level at any time!\n\nItems will be marked per piece with any additional charge. Many many pieces will be included with no extra charge. More sentimental, fragile, rare, dry-clean-only, designer, or otherwise high end pieces will be marked with additional cost per borrow, such as $5, $10, $15 and ranging upwards from there.`,
    },
    {
      id: 'lust-lost',
      question: 'What is the Lust it / Lost it fee?',
      answer: `Joni truly not looking to sell off things in this closet game! (If I was willing to part with things forever I woulda opened a regular store, duh.) Here we are looking for client-collaborators with integrity, deep respect for wardrobe collecting, and want to specifically play in the clothing-sharing sandbox with us. And so, the L/L price will likely be well above market value. You'll know it's a cherished piece if the L/L price is a small fortune. If the L/L price is reasonable it's probably something we can get again or wouldn't be totally torn up about losing from the collection. Either way, your card will be on file -- so if you convince Joni of your lust and that it must be yours, you'll know the price! If something horrible happens and you lose the piece or you yourself get lost in the abyss, you'll know what the charge back to your account will be.\n\nWe'll have Dorothy in action to make returns/swap-outs easier... if you can't make it to the store and time's up on a piece, we will likely warn you of a drive by to collect first rather than just charging you.\n\nLate fees will also apply after a month  - $5/day for the first week, $10/day for the second week... or until the L/L fee is fulfilled. Unless otherwise arranged in advance due to travel schedule, or some other loophole that makes having an item for over a month make sense.\n\nWhen we want to put things up for sale, we will do so!\n\nIt is important to note that this is a business model based on TRUST and INTEGRITY. We want to get to know and grow with everyone who feels the call to be part of this! We always start with a baseline of trust for all - but will still leave it up to experience to see. If we are just getting to know you there may be limits on the pieces you can take out at first. If you are sloppy about it and lose things or make us hunt you down for a return past due, you will be limited in the future. If you are consistently stealth and proactive about your swap-outs you will earn more and more privileges and leeway!`,
    },
    {
      id: 'glitcoin',
      question: 'What is Glitcoin?',
      answer: `You may have noticed that all prices are in increments of $5. Yes! We are setting out to keep pricing simple - amounts will always include any tax, and we will soon be converting to the Sparkle Economy... to GLITCOIN!\n\n1 Glitcoin -> $5`,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">Membership</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Tiers</h1>
        <p className="mt-2 text-sm text-[hsl(var(--ink))]/80">
          Choose the membership that matches your style and ritual.
        </p>
      </div>

      <Suspense fallback={<div className="text-[hsl(var(--ink))]/70">Loading tiers…</div>}>
        <InteractiveMembershipList />
      </Suspense>

      <div className="mt-10 rounded-2xl border border-[hsl(var(--border))] bg-white/60 p-6 shadow-sm backdrop-blur">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">QR</div>
        <h2 className="mt-2 text-xl font-semibold text-[hsl(var(--ink))]">Open this page on your phone</h2>
        <p className="mt-2 text-sm text-[hsl(var(--ink))]/80">Scan to open: {membershipUrl}</p>

        <a
          href={membershipUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center justify-center rounded-xl bg-white p-4 ring-1 ring-[hsl(var(--border))]"
          aria-label="Open memberships page"
        >
          <QRCodeCanvas value={membershipUrl} size={180} bgColor="#ffffff" fgColor="#000000" />
        </a>
      </div>

      <div className="mt-12">
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
  )
}
