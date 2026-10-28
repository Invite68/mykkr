/**
 * GET /api/maps/geocode?q=...&mode=geocode|autocomplete&lat=...&lng=...
 *
 * Server-side proxy for HERE geocoding and autocomplete.
 * API key NEVER leaves this file — client only gets sanitised results.
 *
 * Security:
 *   - Firebase Auth required — only logged-in users can call this
 *   - Rate limited (mapsLimiter: 60/min) to protect HERE API credits
 *   - Query length capped at 200 chars
 *   - Coordinate inputs validated before forwarding
 */
import { NextRequest, NextResponse } from 'next/server'
import { geocode, autocomplete } from '@/lib/here'
import { requireAuth }           from '@/lib/firebase-admin'
import { mapsLimiter, checkLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────────────────────
  const limited = checkLimit(mapsLimiter, req)
  if (limited) return limited

  // ── Auth — only authenticated users can hit HERE API ────────────────────────
  try {
    await requireAuth(req)
  } catch {
    return NextResponse.json({ results: [] }, { status: 401 })
  }

  const q    = req.nextUrl.searchParams.get('q')?.trim().slice(0, 200)
  const mode = req.nextUrl.searchParams.get('mode') ?? 'geocode' // 'geocode' | 'autocomplete'
  const lat  = req.nextUrl.searchParams.get('lat')
  const lng  = req.nextUrl.searchParams.get('lng')

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] })
  }

  // Validate bias coordinates if provided
  const latN = lat ? parseFloat(lat) : undefined
  const lngN = lng ? parseFloat(lng) : undefined
  if (latN !== undefined && (isNaN(latN) || latN < -90  || latN > 90))  return NextResponse.json({ results: [] }, { status: 400 })
  if (lngN !== undefined && (isNaN(lngN) || lngN < -180 || lngN > 180)) return NextResponse.json({ results: [] }, { status: 400 })

  try {
    if (mode === 'autocomplete') {
      const results = await autocomplete(q, latN, lngN)
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
