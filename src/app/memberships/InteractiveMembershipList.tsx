'use client'

import { useState } from 'react'
import Image from 'next/image'
import { MEMBERSHIP_LEVELS, type MembershipTier } from '@/types'
import { Button } from '@/components/ui/button'

const TIER_IMAGES: Record<MembershipTier, { default: string; selected: string }> = {
  Eeeehs: { default: '/images/MEMBERSHIPS/Eeeehs.png', selected: '/images/Membership Images/EeeehsSelected.png' },
  Oooohs: { default: '/images/MEMBERSHIPS/Oooohs.png', selected: '/images/Membership Images/OooohsSelected.png' },
  Aaaaahs: { default: '/images/MEMBERSHIPS/Aaaahs.png', selected: '/images/Membership Images/AaaagsSelected.png' },
  Mmmmms: { default: '/images/MEMBERSHIPS/Mmmms.png', selected: '/images/Membership Images/MmmmsSelected.png' },
}

export default function InteractiveMembershipList() {
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null)
  const [hoveredTier, setHoveredTier] = useState<MembershipTier | null>(null)

  const redirectToStripeCheckout = async (tier: MembershipTier) => {
    // Existing checkout logic from original component
    window.location.href = `/api/stripe/create-checkout-session?tier=${tier}`
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[hsl(var(--ink))] mb-4">Choose Your Membership</h1>
          <p className="text-lg text-[hsl(var(--ink))] mb-8">Select the tier that matches your style</p>
        </div>

        {/* Main image when nothing selected */}
        {!selectedTier && !hoveredTier && (
          <div className="mb-12">
            <Image 
              src="/images/MEMBERSHIPS/main.png" 
              alt="Choose your membership tier" 
              width={800}
              height={600}
              className="mx-auto w-full max-w-2xl h-auto rounded-lg shadow-lg"
            />
          </div>
        )}

        {/* Interactive tier selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {(Object.keys(MEMBERSHIP_LEVELS) as MembershipTier[]).map((tier) => {
            const isHovered = hoveredTier === tier
            const isSelected = selectedTier === tier
            const images = TIER_IMAGES[tier]
            const level = MEMBERSHIP_LEVELS[tier]
            
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                onMouseEnter={() => setHoveredTier(tier)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`relative w-full aspect-[4/3] rounded-full bg-gradient-to-br from-[hsl(var(--background))] to-[hsl(var(--border))] border-4 border-[hsl(var(--border))] hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-4 overflow-hidden group shadow-lg ${
                  isSelected ? 'ring-4 ring-primary ring-offset-4' : ''
                }`}
              >
                <Image
                  src={isHovered ? images.selected : images.default}
                  alt={level.name.split(' — ')[0]}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                
                {/* Tier info overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
                  <div className="text-2xl font-bold text-[hsl(var(--ink))] mb-2 drop-shadow-lg">
                    {level.name.split(' — ')[0]}
                  </div>
                  <div className="text-lg font-bold text-[hsl(var(--accent))] mb-4 drop-shadow-md">
                    ${level.monthlyPrice}/mo
                  </div>
                  <div className="text-xs text-[hsl(var(--ink))] space-y-1 max-w-[80%]">
                    {level.benefits.slice(0, 3).map((benefit, idx) => (
                      <div key={idx} className="bg-[hsl(var(--background))]/80 rounded-full px-2 py-1 mb-1">
                        {benefit}
                      </div>
                    ))}
                    {level.benefits.length > 3 && (
                      <div className="text-xs text-[hsl(var(--accent))] font-medium">
                        +{level.benefits.length - 3} more benefits
                      </div>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected tier details and checkout */}
        {selectedTier && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
              <h2 className="text-xl font-bold text-[hsl(var(--ink))] mb-4">
                {MEMBERSHIP_LEVELS[selectedTier].name.split(' — ')[0]}
              </h2>
              <p className="text-lg text-[hsl(var(--accent))] font-bold mb-4">
                ${MEMBERSHIP_LEVELS[selectedTier].monthlyPrice}/month
              </p>
              <div className="text-sm text-[hsl(var(--ink))] space-y-2 mb-6">
                {MEMBERSHIP_LEVELS[selectedTier].benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]"></div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => redirectToStripeCheckout(selectedTier)}
                  size="lg"
                  className="w-full"
                >
                  Start with {MEMBERSHIP_LEVELS[selectedTier].name.split(' — ')[0]}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedTier(null)}
                >
                  Choose Different
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
