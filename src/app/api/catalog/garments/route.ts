import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CATALOG_BASE_URL = process.env.WARDROBE_MANAGER_BASE_URL ?? 'https://wardrobe-manager2.vercel.app'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const upstream = new URL('/api/public/garments', CATALOG_BASE_URL)

  url.searchParams.forEach((value, key) => {
    upstream.searchParams.set(key, value)
  })

  const res = await fetch(upstream.toString(), {
    method: 'GET',
    headers: { accept: 'application/json' },
    cache: 'no-store',
  })

  const text = await res.text()

  return new NextResponse(text, {
    status: res.status,
    headers: {
      'content-type': res.headers.get('content-type') ?? 'application/json',
      'cache-control': 'no-store',
    },
  })
}
