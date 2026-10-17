import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join, resolve } from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), payment=(), usb=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // CSP: carefully tuned — allows YouTube, OSM, Fonts, localStorage, Nominatim, OSRM
  'Content-Security-Policy': [
    "default-src 'self'",
    // Scripts: self + inline (our own script block) + Cloudflare Turnstile
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
    // Styles: self + inline + Google Fonts
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    // Fonts: Google Fonts CDN
    "font-src 'self' https://fonts.gstatic.com",
    // Images: self, data URIs, OSM tiles, Nominatim
    "img-src 'self' data: https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
    // Frames: OSM embeds + YouTube embeds
    "frame-src https://www.openstreetmap.org https://www.youtube.com https://www.youtube-nocookie.com",
    // Fetch/XHR: Nominatim geocoding + OSRM routing + Google Fonts (CSS fetch)
    "connect-src 'self' https://nominatim.openstreetmap.org https://router.project-osrm.org https://fonts.googleapis.com",
    // No base tag hijacking
    "base-uri 'self'",
    // Forms submit to self only
    "form-action 'self'",
    // No iframe embedding of our site
    "frame-ancestors 'none'",
    // Workers: none needed
    "worker-src 'none'",
    // Objects: none (no Flash etc)
    "object-src 'none'",
  ].join('; '),
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
}

export async function GET() {
  try {
    const safePath = join(process.cwd(), 'public', 'preview.html')
    const publicDir = resolve(join(process.cwd(), 'public'))
    const resolvedPath = resolve(safePath)

    // Path traversal guard
    if (!resolvedPath.startsWith(publicDir)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const html = readFileSync(resolvedPath, 'utf-8')
    return new NextResponse(html, { headers: SECURITY_HEADERS })

  } catch (error) {
    // Never expose stack traces or internal details
    console.error('[MyKKR] Serve error:', error instanceof Error ? error.message : 'Unknown')
    return new NextResponse('Service temporarily unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  }
}
