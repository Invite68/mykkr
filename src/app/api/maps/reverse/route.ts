/**
 * GET /api/maps/reverse?lat=...&lng=...
 *
 * Server-side proxy for HERE reverse geocoding (coords → address).
 * API key NEVER leaves this file.
 */
import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocode } from '@/lib/here'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const latStr = req.nextUrl.searchParams.get('lat')
  const lngStr = req.nextUrl.searchParams.get('lng')

  const lat = latStr ? parseFloat(latStr) : NaN
  const lng = lngStr ? parseFloat(lngStr) : NaN

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ result: null, error: 'Invalid coordinates' }, { status: 400 })
  }

  try {
    const result = await reverseGeocode(lat, lng)
    return NextResponse.json({ result })
  } catch (err) {
    console.error('[maps/reverse]', err)
    return NextResponse.json({ result: null, error: 'Reverse geocoding unavailable' }, { status: 503 })
  }
}
