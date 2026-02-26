'use client'

import Image from 'next/image'
import { MembershipLevel, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const TIER_IMAGE: Record<MembershipTier, string> = {
  Eeeehs: '/images/Membership Images/EeeehsSelected.png',
  Oooohs: '/images/Membership Images/OooohsSelected.png',
  Aaaaahs: '/images/Membership Images/AaaagsSelected.png',
  Mmmmms: '/images/Membership Images/MmmmsSelected.png',
}

interface MembershipCardProps {
  membership: MembershipLevel
}

export function MembershipCard({ membership }: MembershipCardProps) {
  const handleSelectMembership = () => {
    // TODO: Implement membership selection logic
    console.log(`Selected membership: ${membership.name}`)
  }

  const tierImage = TIER_IMAGE[membership.id]

  return (
    <Card className="transition-shadow hover:shadow-md overflow-hidden">
      {tierImage && (
        <div className="relative w-full aspect-[3/2] bg-muted">
          <Image
            src={tierImage}
            alt={membership.name.split(' - ')[0]}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
        </div>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl mb-2">{membership.name.split(' - ')[0]}</CardTitle>
        <CardDescription className="text-sm">
          {membership.name.split(' - ')[1]}
        </CardDescription>
        <div className="mt-4">
          <div className="text-3xl font-bold glitcoin-text">
            {membership.glitcoinValue}Ġ
          </div>
          <div className="text-muted-foreground text-sm">
            ${membership.monthlyPrice}/month or ${membership.yearlyPrice}/year
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-sm">
            <span>👗</span>
            <span>{membership.maxItems} item{membership.maxItems > 1 ? 's' : ''} at a time</span>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-sm">
            <span>🎁</span>
            <span>{membership.freeCheckMeowtItems} free Check Meowt item{membership.freeCheckMeowtItems > 1 ? 's' : ''}/month</span>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-primary/10 px-3 py-1 text-sm">
            <span>💎</span>
            <span>{membership.freeMonthlyGlitcoins} free Glitcoins/month</span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-center">Benefits</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {membership.benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-foreground mt-1">•</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={handleSelectMembership}
          className="w-full"
        >
          Choose {membership.id} Path
        </Button>
      </CardContent>
    </Card>
  )
}
