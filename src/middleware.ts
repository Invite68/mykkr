import { NextResponse, type NextRequest } from 'next/server'

/** Web Crypto API — available in Edge runtime (no Node.js 'crypto' import needed) */
function randomBase64(bytes = 16): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return btoa(String.fromCharCode(...buf))
}

/**
 * Edge middleware — runs before every matched request.
 *
 * Security responsibilities:
 * 1. Block /admin/* UI pages from unauthenticated requests.
 *    (Redirect to /admin-login. Full token verification is done in
 *    the server component AdminAuthGuard — edge can't run Firebase Admin SDK.)
 * 2. Generate a per-request CSP nonce and inject it into the CSP header.
 *    The nonce replaces NONCE_PLACEHOLDER in the header set by next.config.js.
 *    Server components read it via x-nonce response header.
 * 3. Add Cache-Control: no-store to all /dashboard/* and /admin/* routes.
 * 4. Block /api/* routes from cross-origin requests (CSRF defence).
 *
 * NOTE: Full server-side admin auth is in src/app/admin/auth-guard.tsx.
 * The middleware only handles the quick redirect; the guard does DB role check.
 */

const ALLOWED_HOSTS = [
  'mykkr.in',
  'www.mykkr.in',
  'localhost',
  '127.0.0.1',
]

// Paths that are part of the admin area but are public (login page)
const ADMIN_PUBLIC_PATHS = ['/admin-login']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Generate per-request CSP nonce ─────────────────────────────────────
  // Only generate in production (dev uses unsafe-inline for HMR).
  const isProd = process.env.NODE_ENV === 'production'
  const nonce  = isProd ? randomBase64(16) : ''

  const res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  })

  // Pass nonce to server components via a response header
  if (isProd && nonce) {
    res.headers.set('x-nonce', nonce)

    // Replace NONCE_PLACEHOLDER in the static CSP header from next.config.js
    const existingCsp = res.headers.get('Content-Security-Policy') ?? ''
    if (existingCsp.includes('NONCE_PLACEHOLDER')) {
      res.headers.set(
        'Content-Security-Policy',
        existingCsp.replace(/NONCE_PLACEHOLDER/g, nonce)
      )
    }
  }

  // ── 2. Admin UI protection — redirect to login ─────────────────────────────
  // This is a fast redirect guard. The actual Firebase token + role check
  // happens inside the admin layout's AdminAuthGuard server component.
  // The edge runtime cannot run Firebase Admin SDK (no Node.js crypto).
  if (
    pathname.startsWith('/admin') &&
    !ADMIN_PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
  ) {
    // Check for session cookie. If absent, redirect immediately.
    const sessionCookie = req.cookies.get('__session')?.value
    if (!sessionCookie) {
      const loginUrl = new URL('/admin-login', req.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Cookie present — let AdminAuthGuard do the full verification
  }

  // ── 3. No-cache for private pages ─────────────────────────────────────────
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    res.headers.set('Cache-Control', 'no-store, max-age=0')
    res.headers.set('Pragma', 'no-cache')
  }

  // ── 4. CSRF: reject cross-origin POST/PUT/PATCH/DELETE to /api ────────────
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  ) {
    const origin = req.headers.get('origin')
    const host   = req.headers.get('host') ?? ''
    void host // checked indirectly via ALLOWED_HOSTS

    if (origin) {
      try {
        const originHost = new URL(origin).hostname
        if (!ALLOWED_HOSTS.some((h) => originHost === h || originHost.endsWith(`.${h}`))) {
          return new NextResponse('Forbidden', { status: 403 })
        }
      } catch {
        // Malformed Origin — block it
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    // Require Origin or Referer on state-mutating API calls
    // (defends against CSRF from browsers that don't send Origin)
    const referer = req.headers.get('referer')
    if (!origin && !referer) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  return res
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    // Exclude static assets AND map-frame routes (they manage their own CSP)
    '/((?!_next/static|_next/image|favicon.ico|map-frame|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
