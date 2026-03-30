import type { Metadata } from 'next'
import { Crimson_Text, Ranchers } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { AppShell } from '@/components/AppShell'
import { SitePausedOverlay } from '@/components/SitePausedOverlay'
import './globals.css'

// ============================================
// 🔴 SITE PAUSE TOGGLE - Set to true to pause the site
// ============================================
const SITE_IS_PAUSED = true
const PAUSE_MESSAGE = "Site paused till further notice, Michelle needs to reply to Robin!"
// ============================================

const crimsonText = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson-text',
})

const ranchers = Ranchers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ranchers',
})

export const metadata: Metadata = {
  title: 'Before And Afters',
  description: 'Change your outfit, change the world!',
  keywords: ['clothing rental', 'fashion', 'transformation', 'community', 'nyc'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${crimsonText.className} ${crimsonText.variable} ${ranchers.variable} min-h-screen text-foreground`}
        >
          <AppShell>
            {SITE_IS_PAUSED ? (
              <div className="relative">
                {/* Grayed out content behind overlay */}
                <div className="pointer-events-none opacity-30 select-none">
                  {children}
                </div>
                {/* Pause overlay modal */}
                <SitePausedOverlay message={PAUSE_MESSAGE} />
              </div>
            ) : (
              children
            )}
          </AppShell>
        </body>
      </html>
    </ClerkProvider>
  )
}
