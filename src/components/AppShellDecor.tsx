'use client'

import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

import { cn } from '@/lib/utils'

export function AppShellDecor() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isProfileWizard = pathname === '/profile-wizard'
  const isTasteTuner = pathname === '/taste-tuner'
  const isMemberships = pathname === '/memberships'
  const isCalendar = pathname === '/calendar'
  const isSearch = pathname === '/search'
  const isImmersive = isLanding || isProfileWizard || isTasteTuner || isMemberships || isCalendar || isSearch

  return (
    <>
      {isLanding ? (
        <div
          className={cn(
            'fixed inset-0 -z-10 bg-black',
            'bg-[url("/images/Backgrounds/background.jpg")] bg-top bg-repeat-y',
            'bg-[length:auto_100vh]'
          )}
        />
      ) : null}

      {isTasteTuner ? (
        <div
          className="fixed inset-0 -z-10"
          style={{
            backgroundImage: "url('/images/Boxes/checkerboard.svg')",
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />
      ) : null}

      <div className={cn('fixed right-4 z-50', isTasteTuner ? 'bottom-20' : 'bottom-4')}>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button
              type="button"
              className={cn(
                'rounded-md border px-3 py-2 text-sm font-medium',
                isImmersive
                  ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
                  : 'bg-background/70 hover:bg-background'
              )}
            >
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </>
  )
}
