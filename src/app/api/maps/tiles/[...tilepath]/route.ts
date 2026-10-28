/**
 * Tile proxy — forwards OpenStreetMap tile requests server-side.
 *
 * Browser requests: GET /api/maps/tiles/{z}/{x}/{y}.png
 * This route fetches from OSM over HTTPS (server → OSM is fine),
 * then streams the PNG back to the browser as a same-origin response.
 *
 * This solves the mixed-content problem: HTTP site → HTTPS tiles is
 * blocked by browsers, but server-side fetch is not subject to that policy.
 *
 * Caching: tiles are cached for 24 h (OSM tiles rarely change, and OSM's
 * own tile usage policy encourages caching to reduce load on their servers).
 */

import { NextRequest, NextResponse } from 'next/server'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'

// OSM subdomains for load-balancing
const OSM_HOSTS = ['a', 'b', 'c']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tilepath: string[] }> }
) {
  // ── Rate limit — prevents abusive tile scraping that violates OSM policy ────
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited
  const { tilepath } = await params // e.g. ["14","12345","6789.png"]

  // Validate: must be exactly z/x/y.png
  if (tilepath.length !== 3) {
    return new NextResponse('Not found', { status: 404 })
  }

  const [z, x, yPng] = tilepath
  const y = yPng?.replace(/\.png$/i, '')

  // Basic numeric validation to prevent SSRF
  if (
    !z || !x || !y ||
    !/^\d{1,6}$/.test(z) ||
    !/^\d{1,8}$/.test(x) ||
    !/^\d{1,8}$/.test(y)
  ) {
    return new NextResponse('Invalid tile coordinates', { status: 400 })
  }

  // Pick a subdomain deterministically (not random — better for CDN caching)
  const sub = OSM_HOSTS[(Number(x) + Number(y)) % OSM_HOSTS.length]
  const url = `https://${sub}.tile.openstreetmap.org/${z}/${x}/${y}.png`

  try {
    const upstream = await fetch(url, {
      headers: {
        // OSM requires a User-Agent identifying the app
        'User-Agent': 'MyKKR-App/1.0 (https://github.com/mykkr; tile-proxy)',
        'Referer': 'https://www.openstreetmap.org/',
      },
      // Reuse connections
      // cache: 'default' — let the runtime cache OSM's Cache-Control headers
    })

    if (!upstream.ok) {
      return new NextResponse('Tile fetch failed', { status: upstream.status })
    }

    const body = await upstream.arrayBuffer()

    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        // Cache aggressively — OSM tiles don't change often
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        // Forward OSM attribution
        'X-Tile-Source': 'OpenStreetMap contributors',
      },
    })
  } catch (err) {
    console.error('[tile-proxy] fetch error:', err)
    return new NextResponse('Tile unavailable', { status: 502 })
  }
}
