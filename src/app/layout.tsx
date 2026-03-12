import type { Metadata } from 'next'
import { Knewave, Macondo, Marck_Script, Montez, Ranchers, IM_Fell_DW_Pica_SC, Inter } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { AppShell } from '@/components/AppShell'
import './globals.css'

const knewave = Knewave({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-knewave',
})

const macondo = Macondo({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-macondo',
})

const imFellDWPicaSC = IM_Fell_DW_Pica_SC({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-im-fell',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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

const ranchers = Ranchers({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-ranchers',
})

const knewaveClass = Knewave({
  weight: '400',
  subsets: ['latin'],
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
          className={`${knewaveClass.className} ${montez.variable} ${ranchers.variable} ${knewave.variable} ${marckScript.variable} ${macondo.variable} ${imFellDWPicaSC.variable} ${inter.variable} min-h-screen text-foreground`}
        >
          <AppShell>{children}</AppShell>
        </body>
      </html>
    </ClerkProvider>
  )
}
