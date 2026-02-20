'use client'

import { useState } from 'react'

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const faqs = [
    {
      id: 'club-details',
      question: "Joni's Closet Club details",
      answer: `Laundry is included! Just bring your item back and we'll take care of the rest.

The # of items included in your membership are how many things you take out at one time. You bring your last items back in order to take out new ones - that's a "swap-out". You can choose and change up your flow - come back daily if you like, keep your things for up to two weeks, or swap-hop any timing in between. You may also swap out some of your items and keep others for longer if you'd like.

If you want to get more pieces at a time beyond your membership, you can! It is $10 more for the first extra piece, $15 for the second, $20 for the third, and $25 for the fourth, etc.

If you find yourself always wanting more pieces such that it makes sense to increase your membership, you are welcome to upgrade to a higher level at any time!

Items will be marked per piece with any additional charge. Many pieces will be included with no extra charge. More sentimental, fragile, rare, dry-clean-only, designer, or otherwise high end pieces will be marked with additional cost per borrow, such as $5, $10, $15 and ranging upwards from there.`
    },
    {
      id: 'lust-lost',
      question: "Lust it/Lost it fee",
      answer: `Joni&apos;s truly not looking to sell off things in this closet game! (If I was willing to part with things forever I would have opened a regular store, duh.) Here we are looking for client-collaborators with integrity, deep respect for wardrobe collecting, and want to specifically play in the clothing-sharing sandbox with us. And so, L/L price will likely be well above market value. You&apos;ll know it&apos;s a cherished piece if the L/L price is a small fortune. If L/L price is reasonable it&apos;s probably something we can get again or wouldn&apos;t be totally torn up about losing from the collection. Either way, your card will be on file -- so if you convince Joni of your lust and that it must be yours, you&apos;ll know the price! If something horrible happens and you lose a piece or You yourself get lost in the abyss, you&apos;ll know what charge back to your account will be.

We&apos;ll have Dorothy in action to make returns/swap-outs easier... if you can&apos;t make it to the store and time&apos;s up on a piece, we will likely warn you of a drive by to collect first rather than just charging you. Laundry is included - just bring your item back and We&apos;ll take care of the rest.

Late fees will also apply after a month - $5/day for the first week, $10/day for the second week... or until the L/L fee is fulfilled. Unless otherwise arranged in advance due to travel schedule, or some other loophole that makes having an item for over a month make sense.

When we want to put things up for sale, we will do so!

It is important to note that this is a business model based on TRUST and INTEGRITY. We want to get to know and grow with everyone who feels the call to be part of this! We always start with a baseline of trust for all - but will still leave it up to experience to see. If we are just getting to know you there may be limits on pieces you can take out at first. If you are sloppy about it and lose things or make us hunt you down for a return past due, you will be limited in future. If you are consistently stealth and proactive about your swap-outs you will earn more and more privileges and leeway!`
    },
    {
      id: 'glitcoin',
      question: "What is Glitcoin?",
      answer: `You may have noticed that all prices are in increments of $5. Yes! We are setting out to keep pricing simple - amounts will always include any tax, and we will soon be converting to the Sparkle Economy... to GLITCOIN!

1 Glitcoin -> $5`
    },
    {
      id: 'returns',
      question: "How do returns and swap-outs work?",
      answer: `We'll have Dorothy in action to make returns/swap-outs easier. If you can't make it to the store and time's up on a piece, we will likely warn you of a drive by to collect first rather than just charging you. Laundry is included - just bring your item back and We'll take care of the rest.`
    },
    {
      id: 'upgrades',
      question: "Can I upgrade my membership?",
      answer: `Yes! If you find yourself always wanting more pieces such that it makes sense to increase your membership, you are welcome to upgrade to a higher level at any time.`
    },
    {
      id: 'extra-items',
      question: "What if I want more items than my tier allows?",
      answer: `If you want to get more pieces at a time beyond your membership, you can! It is $10 more for the first extra piece, $15 for the second, $20 for the third, and $25 for the fourth, etc. Items will be marked per piece with any additional charge.`
    },
    {
      id: 'pricing',
      question: "Why are All prices in $5 increments?",
      answer: `We are setting out to keep pricing simple - amounts will always include any tax, and we will soon be converting to the Sparkle Economy... to GLITCOIN!`
    }
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">FAQ</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Frequently Asked Questions</h1>
        <p className="mt-2 text-sm text-[color:var(--brand-text-secondary-hex)]">
          Everything you need to know about Joni&apos;s Closet Club.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <details
            key={faq.id}
            open={openItem === faq.id}
            onToggle={(open) => setOpenItem(open ? faq.id : null)}
            className="group border border-[hsl(var(--border))] rounded-lg p-6 cursor-pointer"
          >
            <summary className="flex justify-between items-center font-medium text-[hsl(var(--ink))] list-none">
              {faq.question}
              <span className="text-muted-foreground transition-transform group-open:rotate-180">
                ▼
              </span>
            </summary>
            <div className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">
              {faq.answer}
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}
