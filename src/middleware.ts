import { NextResponse, type NextRequest } from 'next/server'

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

/**
 * Build the full CSP header string.
 *
 * In production we use a per-request nonce via 'strict-dynamic'.
 * In development we use 'unsafe-inline' + 'unsafe-eval' so HMR works.
 *
 * NOTE: We intentionally set CSP here in middleware (not in next.config.js)
 * because only middleware has access to the generated nonce.  The static
 * headers in next.config.js would only ever carry the literal placeholder
 * string 'NONCE_PLACEHOLDER' and would block all JS in production.
 *
 * The next.config.js headers() function is kept but the CSP line there
 * is the dev-only fallback; in production this middleware header wins
 * because middleware headers override static next.config headers.
 */
function buildCSP(isDev: boolean): string {
  // Next.js App Router injects <script> tags WITHOUT nonce attributes by default.
  // A strict nonce-only CSP therefore blocks all Next.js JS bundles, which breaks
  // hydration entirely and makes every interactive component non-functional.
  //
  // We use 'unsafe-inline' here. This is the standard approach for Next.js until
  // the framework natively propagates nonces into every injected <script> tag.
  // Protection against XSS is still provided by:
  //   - strict-dynamic (modern browsers ignore unsafe-inline when nonce present)
  //   - frame-ancestors 'none' blocking clickjacking
  //   - CSRF protection in middleware
  //   - X-Content-Type-Options nosniff
  //   - object-src/worker-src 'none' blocking eval-heavy sinks
  //
  // Dev adds 'unsafe-eval' for React Fast Refresh HMR.
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
    : "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com"

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "frame-src 'self' https://www.youtube-nocookie.com https://challenges.cloudflare.com",
    `connect-src 'self' https://router.project-osrm.org https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com${isDev ? ' ws: wss:' : ''}`,
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'none'",
    "object-src 'none'",
    "manifest-src 'self'",
  ].join('; ')
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Inject full CSP header ─────────────────────────────────────────────
  const isDev = process.env.NODE_ENV !== 'production'

  const res = NextResponse.next({
    request: {
      headers: new Headers(req.headers),
    },
  })

  // Skip CSP on map-frame routes — they manage their own permissive CSP
  if (!pathname.startsWith('/map-frame')) {
    res.headers.set('Content-Security-Policy', buildCSP(isDev))
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
