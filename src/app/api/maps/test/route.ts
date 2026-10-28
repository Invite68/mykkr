/**
 * GET /api/maps/test
 *
 * Admin diagnostic endpoint — confirms HERE Maps API key is configured and
 * returning results. Safe to open in browser. Never returns the API key.
 */
import { NextResponse } from 'next/server'
import { geocode, reverseGeocode, autocomplete } from '@/lib/here'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    keyConfigured: !!process.env.HERE_MAPS_API_KEY,
  }

  if (!process.env.HERE_MAPS_API_KEY) {
    return NextResponse.json({
      ...results,
      status: 'ERROR',
      error: 'HERE_MAPS_API_KEY environment variable is not set',
    }, { status: 500 })
  }

  // Test 1: Geocode a known Kurukshetra address
  try {
    const geoResults = await geocode('Brahma Sarovar Kurukshetra Haryana India')
    results.geocode = {
      ok: geoResults.length > 0,
      count: geoResults.length,
      first: geoResults[0] ?? null,
    }
  } catch (err) {
    results.geocode = { ok: false, error: String(err) }
  }

  // Test 2: Reverse geocode Kurukshetra city center
  try {
    const rev = await reverseGeocode(29.9695, 76.8783)
    results.reverseGeocode = {
      ok: !!rev,
      result: rev,
    }
  } catch (err) {
    results.reverseGeocode = { ok: false, error: String(err) }
  }

  // Test 3: Autocomplete partial text
  try {
    const ac = await autocomplete('Sector 3 Kurukshetra', 29.9695, 76.8783)
    results.autocomplete = {
      ok: ac.length > 0,
      count: ac.length,
      first: ac[0] ?? null,
    }
  } catch (err) {
    results.autocomplete = { ok: false, error: String(err) }
  }

  const allOk =
    (results.geocode as { ok: boolean }).ok &&
    (results.reverseGeocode as { ok: boolean }).ok

  return NextResponse.json({
    ...results,
    status: allOk ? 'OK' : 'PARTIAL',
  }, { status: allOk ? 200 : 207 })
}
