import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join, resolve, normalize } from 'path'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Security headers applied to every response
const SECURITY_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // XSS protection (legacy browsers)
  'X-XSS-Protection': '1; mode=block',
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Permissions policy — block unused browser APIs
  'Permissions-Policy': 'camera=(), microphone=(), payment=(), geolocation=(self), usb=()',
  // HSTS — force HTTPS for 1 year
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
    "frame-src https://www.openstreetmap.org https://www.youtube.com",
    "connect-src 'self' https://nominatim.openstreetmap.org https://router.project-osrm.org",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '),
  // Cache: no-store for dynamic content
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
}

export async function GET() {
  try {
    // Hardcoded path — no user input ever touches this, safe from path traversal
    const safePath = join(process.cwd(), 'public', 'preview.html')

    // Verify the resolved path stays within public directory
    const publicDir = resolve(join(process.cwd(), 'public'))
    const resolvedPath = resolve(safePath)
    if (!resolvedPath.startsWith(publicDir)) {
      return new NextResponse('Not found', { status: 404 })
    }

    const html = readFileSync(resolvedPath, 'utf-8')

    return new NextResponse(html, { headers: SECURITY_HEADERS })

  } catch (error) {
    // Never expose internal error details to the client
    console.error('[MyKKR] Failed to serve preview:', error instanceof Error ? error.message : 'Unknown error')
    return new NextResponse('Service temporarily unavailable', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    })
  }
}
