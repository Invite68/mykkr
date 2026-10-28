/**
 * Nominatim proxy — forwards geocode/reverse geocode requests server-side.
 *
 * GET /api/maps/nominatim?q=...          → search (geocode)
 * GET /api/maps/nominatim?lat=...&lon=.. → reverse geocode
 *
 * Nominatim requires a User-Agent and asks callers to cache results.
 * We forward the request server-side so HTTP pages can use it without
 * triggering mixed-content blocks.
 *
 * Security:
 *   - Firebase Auth required — prevents anonymous hammering of the free Nominatim service
 *   - Rate limited (mapsLimiter: 60/min) — protects Nominatim's fair-use policy
 *   - Query length capped at 200 chars
 *   - Coordinate inputs validated before forwarding
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { mapsLimiter, checkLimit }   from '@/lib/rate-limit'

export const runtime = 'nodejs'

const UA = 'MyKKR-App/1.0 (https://github.com/mykkr; nominatim-proxy)'

export async function GET(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────────────────────
  const limited = checkLimit(mapsLimiter, req)
  if (limited) return limited

  // ── Auth — must be a logged-in user ─────────────────────────────────────────
  try {
    await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = req.nextUrl
  const q = searchParams.get('q')
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  let url: string

  if (lat && lon) {
    // Reverse geocode
    const la = parseFloat(lat)
    const lo = parseFloat(lon)
    if (isNaN(la) || isNaN(lo) || la < -90 || la > 90 || lo < -180 || lo > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }
    url = `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json&accept-language=en`
  } else if (q) {
    // Forward geocode
    const safe = encodeURIComponent(q.slice(0, 200))
    url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=3&q=${safe}&accept-language=en`
  } else {
    return NextResponse.json({ error: 'Missing q or lat/lon' }, { status: 400 })
  }

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
    })
    if (!upstream.ok) {
      return NextResponse.json({ error: 'Nominatim error' }, { status: upstream.status })
    }
    const data = await upstream.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    })
  } catch (err) {
    console.error('[nominatim-proxy]', err)
    return NextResponse.json({ error: 'Geocoding unavailable' }, { status: 502 })
  }
}
