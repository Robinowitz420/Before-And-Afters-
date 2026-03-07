import type { Metadata } from 'next'
import { Knewave, Marck_Script } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { AppShell } from '@/components/AppShell'
import './globals.css'

const knewave = Knewave({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-knewave',
})

const marckScript = Marck_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-marck-script',
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
        <body className={`${knewave.className} ${knewave.variable} ${marckScript.variable} min-h-screen text-foreground`}>
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  )
}
