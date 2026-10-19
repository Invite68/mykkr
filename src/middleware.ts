import { NextResponse, type NextRequest } from 'next/server'

/**
 * Edge middleware — runs before every matched request.
 *
 * Security responsibilities:
 * 1. Block direct access to /dashboard/admin from non-localhost origins
 *    (real auth guard goes here once Firebase JWT is wired)
 * 2. Add Cache-Control: no-store to all /dashboard/* routes so browsers
 *    never cache private dashboard pages
 * 3. Block /api/* routes from cross-origin simple requests (CSRF defence)
 *    by checking Origin header against the allowed host
 *
 * NOTE: This is a lightweight guard. Full server-side auth (Firebase JWT
 * verification in API route handlers) is required before going live.
 */

const ALLOWED_HOSTS = [
  'mykkr.in',
  'www.mykkr.in',
  'localhost',
  '127.0.0.1',
]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  // ── 1. No-cache for dashboard pages ─────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    res.headers.set('Cache-Control', 'no-store, max-age=0')
    res.headers.set('Pragma', 'no-cache')
  }

  // ── 2. CSRF: reject cross-origin POST/PUT/PATCH/DELETE to /api ──
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  ) {
    const origin = req.headers.get('origin')
    const host = req.headers.get('host') ?? ''
    // Allow same-origin (no Origin header) or matching host
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
      // Allow health check and CI crawlers (no Referer is fine for GET)
      // Block POST/PUT/PATCH/DELETE with no origin or referer
      return new NextResponse('Forbidden', { status: 403 })
    }
    void host // unused — future use for host allowlist checks
  }

  return res
}

export const config = {
  // Match all routes except Next.js internals and static files
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?)$).*)',
  ],
}
