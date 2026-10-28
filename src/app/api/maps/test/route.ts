/**
 * GET /api/maps/test — REMOVED for security.
 *
 * This diagnostic endpoint was removed before production launch.
 * It was unauthenticated and confirmed API key presence + functionality
 * to any caller — a fingerprinting and abuse vector.
 *
 * To test HERE API configuration, use the Coolify server console:
 *   curl -s "https://geocode.search.hereapi.com/v1/geocode?q=Kurukshetra&apiKey=$HERE_MAPS_API_KEY"
 */
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}
