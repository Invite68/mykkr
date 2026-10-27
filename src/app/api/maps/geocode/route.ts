/**
 * GET /api/maps/geocode?q=...
 *
 * Server-side proxy for HERE geocoding.
 * API key NEVER leaves this file — client only gets sanitised results.
 */
import { NextRequest, NextResponse } from 'next/server'
import { geocode, autocomplete } from '@/lib/here'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim()
  const mode = req.nextUrl.searchParams.get('mode') ?? 'geocode' // 'geocode' | 'autocomplete'
  const lat = req.nextUrl.searchParams.get('lat')
  const lng = req.nextUrl.searchParams.get('lng')

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    if (mode === 'autocomplete') {
      const results = await autocomplete(
        q,
        lat ? parseFloat(lat) : undefined,
        lng ? parseFloat(lng) : undefined,
      )
      return NextResponse.json({ results })
    }

    const results = await geocode(q)
    return NextResponse.json({ results })
  } catch (err) {
    console.error('[maps/geocode]', err)
    // Never leak API key or internal errors to client
    return NextResponse.json({ results: [], error: 'Geocoding unavailable' }, { status: 503 })
  }
}
