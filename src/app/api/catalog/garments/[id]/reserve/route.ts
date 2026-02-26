import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CATALOG_BASE_URL = process.env.WARDROBE_MANAGER_BASE_URL ?? 'https://wardrobe-manager2.vercel.app'

export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params
  const bodyText = await request.text()

  const upstream = new URL(`/api/public/garments/${encodeURIComponent(params.id)}/reserve`, CATALOG_BASE_URL)

  const res = await fetch(upstream.toString(), {
    method: 'POST',
    headers: {
      'content-type': request.headers.get('content-type') ?? 'application/json',
      accept: 'application/json',
    },
    body: bodyText,
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
