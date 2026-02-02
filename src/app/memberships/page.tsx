'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MEMBERSHIP_LEVELS } from '@/types'

export default function MembershipsPage() {
  const router = useRouter()

  const onSelectTier = () => {
    alert('Congrats! Memberships coming soon')
    router.push('/profile')
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Membership</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Tiers</h1>
        <p className="mt-2 text-sm text-[color:var(--brand-text-secondary-hex)]">
          Pick the level that matches your ritual.
        </p>
      </div>

      <div className="grid gap-6">
        {Object.entries(MEMBERSHIP_LEVELS).map(([tier, level]) => (
          <Card
            key={tier}
            className="overflow-hidden cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={onSelectTier}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectTier()
              }
            }}
          >
            <CardHeader>
              <CardTitle className="text-xl">{level.name.split(' - ')[0]}</CardTitle>
              <CardDescription>{level.name.split(' - ')[1]}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-3xl font-bold text-[hsl(var(--ink))]">{level.glitcoinValue}Ġ</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {level.maxItems} item{level.maxItems !== 1 ? 's' : ''} at a time
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {level.freeCheckMeowtItems} free Check Meowt
                </span>
                <span className="rounded-full bg-secondary/30 px-3 py-1 text-sm font-medium text-secondary-foreground">
                  {level.freeMonthlyGlitcoins} free Ġ/month
                </span>
              </div>

              <ul className="mt-5 space-y-2">
                {level.benefits.map((benefit, i) => (
                  <li key={i} className="text-sm">
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
