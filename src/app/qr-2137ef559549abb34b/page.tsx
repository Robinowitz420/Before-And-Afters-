'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function MembershipQrPage() {
  const membershipUrl = 'https://www.changeyouroutfitchangetheworld.com/memberships'
  const [qrSize, setQrSize] = useState(320)

  useEffect(() => {
    function updateSize() {
      // Fill available width minus padding, capped at 900
      setQrSize(Math.min(900, window.innerWidth - 80))
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12">
      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">QR</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Memberships</h1>
        <p className="mt-2 break-all text-sm text-[hsl(var(--ink))]/80">{membershipUrl}</p>
      </div>

      <div className="rounded-3xl bg-white p-4 ring-1 ring-[hsl(var(--border))] shadow-sm sm:p-6">
        <QRCodeSVG value={membershipUrl} size={qrSize} bgColor="#ffffff" fgColor="#000000" level="H" />
      </div>
    </div>
  )
}
