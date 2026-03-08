'use client'

import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

import { cn } from '@/lib/utils'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isProfileWizard = pathname === '/profile-wizard'
  const isTasteTuner = pathname === '/taste-tuner'
  const isMemberships = pathname === '/memberships'
  const isCalendar = pathname === '/calendar'
  const isSearch = pathname === '/search'
  const isImmersive = isLanding || isProfileWizard || isTasteTuner || isMemberships || isCalendar || isSearch

  return (
    <div
      className={cn(
        'min-h-screen',
        isTasteTuner
          ? 'bg-transparent'
          : isLanding
            ? 'bg-black bg-[url("/images/Backgrounds/background.jpg")] bg-[length:auto_100vh] bg-top bg-repeat-y'
            : 'app-sunset'
      )}
    >
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
      <div className={cn('mx-auto flex min-h-screen w-full', !isImmersive && 'max-w-[1600px]')}>
        {/* Clerk auth buttons at bottom right */}
        <div className={cn('fixed right-4 z-50', isTasteTuner ? 'bottom-20' : 'bottom-4')}>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className={cn(
                  'rounded-md border px-3 py-2 text-sm font-medium backdrop-blur',
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

        <main className={cn('flex-1', !isImmersive && 'px-4 py-8 md:px-8 md:py-10')}>
          {isImmersive ? children : <div className="mx-auto w-full max-w-6xl">{children}</div>}
        </main>
      </div>
    </div>
  )
}
