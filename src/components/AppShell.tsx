'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { Home, Menu } from 'lucide-react'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

import { cn } from '@/lib/utils'

type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const NAV: NavItem[] = [
  { href: '/', label: 'Overview', icon: Home },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 flex-col gap-1">
      <div className="px-3 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Main
      </div>
      {NAV.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
              isActive && 'bg-muted text-foreground'
            )}
          >
            <span
              className={cn(
                'absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-transparent',
                isActive && 'bg-primary'
              )}
            />
            <Icon className={cn('h-4 w-4', isActive ? 'text-foreground' : 'text-muted-foreground')} />
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isProfileWizard = pathname === '/profile-wizard'
  const isTasteTuner = pathname === '/taste-tuner'
  const isImmersive = isLanding || isProfileWizard || isTasteTuner

  return (
    <div
      className={cn(
        'min-h-screen',
        isLanding ? 'app-atmosphere' : 'app-sunset'
      )}
    >
      <div className={cn('mx-auto flex min-h-screen w-full', !isImmersive && 'max-w-[1600px]')}>
        {!isImmersive && (
          <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 border-r bg-background md:flex md:flex-col">
            <div className="flex h-16 items-center gap-2 px-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span className="text-sm font-semibold">BA</span>
              </div>
              <div className="leading-tight">
                <Link href="/" className="block text-sm font-semibold tracking-tight">
                  Before And Afters
                </Link>
                <div className="text-xs text-muted-foreground">Change your outfit, change the world!</div>
              </div>
            </div>

            <div className="flex flex-1 flex-col px-3 pb-6">
              <NavLinks />

            </div>
          </aside>
        )}

        {isImmersive && (
          <div className="pointer-events-none fixed left-0 top-0 z-40 w-full">
            <div className="pointer-events-auto mx-auto flex w-full items-center justify-end px-6 py-4">
              <div>
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
            </div>
          </div>
        )}

        <main className={cn('flex-1', !isImmersive && 'px-4 py-8 md:px-8 md:py-10')}>
          {isImmersive ? children : <div className="mx-auto w-full max-w-6xl">{children}</div>}
        </main>
      </div>
    </div>
  )
}
