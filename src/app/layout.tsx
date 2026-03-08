import type { Metadata } from 'next'
import { Knewave, Marck_Script, Montez } from 'next/font/google'
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

const montez = Montez({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-montez',
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
        <body className={`${montez.className} ${montez.variable} ${knewave.variable} ${marckScript.variable} min-h-screen text-foreground`}>
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  )
}
