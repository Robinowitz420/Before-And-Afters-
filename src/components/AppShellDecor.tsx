'use client'

import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

export function AppShellDecor() {
  const pathname = usePathname()
  const isLanding = pathname === '/'
  const isTasteTuner = pathname === '/taste-tuner'

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
    </>
  )
}
