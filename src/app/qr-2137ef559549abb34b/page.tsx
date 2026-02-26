'use client'

import { QRCodeCanvas } from 'qrcode.react'

export const dynamic = 'force-dynamic'

export default function MembershipQrPage() {
  const membershipUrl = 'https://beforeandafters.vercel.app/memberships'

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center gap-8 px-6 py-12">
      <div className="text-center">
        <div className="text-xs font-medium uppercase tracking-[0.2em] text-[hsl(var(--ink))]/70">QR</div>
        <h1 className="mt-2 text-3xl font-semibold text-[hsl(var(--ink))]">Memberships</h1>
        <p className="mt-2 text-sm text-[hsl(var(--ink))]/80">{membershipUrl}</p>
      </div>

      <div className="rounded-3xl bg-white p-6 ring-1 ring-[hsl(var(--border))] shadow-sm">
        <QRCodeCanvas value={membershipUrl} size={900} bgColor="#ffffff" fgColor="#000000" />
      </div>
    </div>
  )
}
