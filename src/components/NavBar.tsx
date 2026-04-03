'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'

type NavLink = { href: string; label: string; auth?: boolean }

const NAV_LINKS: NavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/profile', label: 'My Closet', auth: true },
  { href: '/search', label: 'Search', auth: true },
  { href: '/calendar', label: 'Calendar' },
  { href: '/memberships', label: 'Memberships' },
  { href: '/faq', label: 'FAQ' },
  { href: '/details', label: 'Details' },
]

export function NavBar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Determine styling based on page context
  const isLanding = pathname === '/'
  const isMemberships = pathname === '/memberships'
  const isDark = isLanding || isMemberships

  function renderLink(link: NavLink, mobile: boolean) {
    const active = pathname === link.href
    const el = (
      <Link
        key={link.href}
        href={link.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'block rounded-lg font-medium transition-colors',
          mobile ? 'px-3 py-3 text-base' : 'px-3 py-1.5 text-sm',
          isDark
            ? active
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white hover:bg-white/10'
            : active
              ? 'bg-pink-100 text-[hsl(var(--ink))]'
              : 'text-[hsl(var(--ink))]/70 hover:text-[hsl(var(--ink))] hover:bg-pink-50'
        )}
      >
        {link.label}
      </Link>
    )

    if (link.auth) {
      return <SignedIn key={link.href}>{el}</SignedIn>
    }
    return el
  }

  return (
    <>
      {/* Top bar */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          isDark
            ? 'bg-black/60 backdrop-blur-md border-b border-white/10'
            : 'bg-white/70 backdrop-blur-md border-b border-[hsl(var(--border))]'
        )}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Brand */}
          <Link
            href="/"
            className={cn(
              'font-ranchers text-lg tracking-wide',
              isDark ? 'text-white' : 'text-[hsl(var(--ink))]'
            )}
          >
            Before &amp; Afters
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => renderLink(link, false))}
          </div>

          {/* Right side: auth + hamburger */}
          <div className="flex items-center gap-3">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  type="button"
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isDark
                      ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                      : 'border border-[hsl(var(--border))] bg-pink-50 text-[hsl(var(--ink))] hover:bg-pink-100'
                  )}
                >
                  Sign in
                </button>
              </SignInButton>
            </SignedOut>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMobileOpen((v) => !v)
              }}
              className={cn(
                'relative z-[60] flex h-10 w-10 items-center justify-center rounded-lg md:hidden transition-colors',
                isDark
                  ? 'text-white hover:bg-white/10 active:bg-white/20'
                  : 'text-[hsl(var(--ink))] hover:bg-pink-50 active:bg-pink-100'
              )}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                {mobileOpen ? (
                  <>
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay + dropdown */}
      {mobileOpen && (
        <>
          {/* Backdrop - closes menu on tap */}
          <div
            className="fixed inset-0 z-[55] bg-black/30 md:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Dropdown menu */}
          <div
            className={cn(
              'fixed top-14 left-0 right-0 z-[56] flex flex-col gap-1 px-4 pb-5 pt-2 shadow-xl md:hidden',
              isDark
                ? 'bg-black/90 backdrop-blur-lg border-b border-white/10'
                : 'bg-white/95 backdrop-blur-lg border-b border-[hsl(var(--border))]'
            )}
          >
            {NAV_LINKS.map((link) => renderLink(link, true))}
          </div>
        </>
      )}
    </>
  )
}
