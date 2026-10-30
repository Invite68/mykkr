/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Content-Security-Policy
 *
 * Security changes vs original:
 *   - 'unsafe-inline' REMOVED from script-src in production.
 *     Next.js App Router inlines a small __NEXT_DATA__ script; we allow that
 *     via 'strict-dynamic' + the nonce injected in middleware.ts.
 *   - frame-ancestors set to 'none' (was SAMEORIGIN via X-Frame-Options only;
 *     modern browsers use frame-ancestors which takes precedence).
 *   - HSTS added for production (re-enable once domain has TLS cert).
 *
 * Nonce pattern:
 *   middleware.ts generates a random nonce per request and sets it in:
 *     - response header: x-nonce (read by layout.tsx to inject into <head>)
 *     - this CSP: 'nonce-{NONCE_PLACEHOLDER}' is replaced by middleware
 *
 * Notes:
 * - No 'unsafe-eval' in production — React uses real event handlers.
 * - Font is served by Next.js itself (next/font/google bakes font into
 *   .next/static at build time) → no external font connect-src needed.
 * - Cloudflare Turnstile runs in its own iframe on challenges.cloudflare.com.
 * - OpenStreetMap used for map embeds on business detail pages.
 * - YouTube-nocookie used for MediaStrip embeds.
 * - 'strict-dynamic' means allowlisted hashes/nonces propagate to dynamically
 *   loaded scripts, so we don't need to list every CDN explicitly.
 */
const CSP = [
  "default-src 'self'",
  // Production: nonce + strict-dynamic (no unsafe-inline)
  // Dev: unsafe-eval needed for React Fast Refresh HMR
  isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
    : "script-src 'self' 'nonce-NONCE_PLACEHOLDER' 'strict-dynamic' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // blob: needed for Leaflet canvas, data: for inline SVG markers
  "img-src 'self' data: blob:",
  // 'self' allows our srcDoc iframes; youtube/cloudflare for embeds
  "frame-src 'self' https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  // Firebase Auth (Phone OTP): identitytoolkit for token exchange, securetoken for refresh
  `connect-src 'self' https://router.project-osrm.org https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com${isDev ? ' ws: wss:' : ''}`,
  "base-uri 'self'",
  "form-action 'self'",
  // frame-ancestors 'none': no page may embed this site in an iframe, from any origin.
  // X-Frame-Options: DENY below is the fallback for old browsers.
  "frame-ancestors 'none'",
  "worker-src 'none'",
  "object-src 'none'",
  "manifest-src 'self'",
  // "upgrade-insecure-requests" — intentionally omitted until domain has TLS cert.
  // Re-enable when mykkr.in is live on HTTPS with Cloudflare.
].join('; ')

const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  // Disable source maps in production — prevents attackers reading your source via DevTools
  productionBrowserSourceMaps: false,

  // pg (node-postgres) is server-only — keep it out of the browser bundle
  serverExternalPackages: ['pg'],

  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'storage.googleapis.com' }],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    formats: ['image/avif', 'image/webp'],
  },

  // ── Security headers applied to every route ─────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // NOTE: CSP is NOT set here. It is set entirely in middleware.ts where
          // the per-request nonce is available. A static CSP here with the
          // NONCE_PLACEHOLDER literal would block all JS in production because
          // Next.js static headers are sent AFTER middleware, so middleware
          // cannot replace the placeholder.
          //
          // The CSP variable above is kept for reference / dev-only fallback
          // but is not used as a response header.
          //
          // X-Frame-Options: DENY is the legacy fallback for browsers that
          // don't support frame-ancestors in CSP. frame-ancestors 'none' in
          // the middleware CSP takes precedence in modern browsers.
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // geolocation=(self) so "Use my location" works on Find & Book / Rides
            value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self), interest-cohort=()',
          },
          // HSTS — enforces HTTPS for 2 years once the domain has a TLS cert.
          // Currently commented out because the Coolify preview runs on HTTP.
          // UNCOMMENT when mykkr.in is live on HTTPS:
          // { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // TODO (post-TLS): enable upgrade-insecure-requests in CSP too.
          // COOP: isolates browsing context from cross-origin windows (safe, no iframe impact)
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // NOTE: COEP and CORP are intentionally omitted — they break YouTube / Maps iframes
          // Blocks Flash / PDF cross-domain policy files (defence-in-depth, no Flash used)
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
        ],
      },
      // NOTE: /_next/static cache headers intentionally omitted.
      // Next.js sets "public, max-age=31536000, immutable" automatically on
      // content-hashed static chunks. A custom override here triggers a Next.js
      // warning ("can break development behavior") and caused stale CSS caching
      // on the Coolify preview. Let Next.js manage its own static asset cache.

      // No-cache for API routes (except tile + nominatim proxies which set their own cache headers)
      {
        source: '/api/((?!maps/tiles|maps/nominatim).*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, max-age=0' },
        ],
      },

      // Map frame routes — override DENY with SAMEORIGIN so they can be embedded
      // by our own pages. These routes serve their own permissive CSP for Leaflet.
      {
        source: '/map-frame/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Override the global frame-ancestors 'none' — allow embedding by same origin only
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "connect-src 'self' https://router.project-osrm.org",
              "frame-ancestors 'self'",
            ].join('; '),
          },
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ]
  },

  // ── Redirects ────────────────────────────────────────────────────
  async redirects() {
    return [
      // Canonical host — www → non-www
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.mykkr.in' }],
        destination: 'https://mykkr.in/:path*',
        permanent: true,
      },
      // Legacy single-page section anchors → proper routes
      { source: '/services',     destination: '/c/home-services',           permanent: false },
      { source: '/shop',         destination: '/c/groceries-essentials',    permanent: false },
      { source: '/food',         destination: '/c/food-beverages',          permanent: false },
      { source: '/preview.html', destination: '/',                          permanent: true  },
    ]
  },
}

module.exports = nextConfig
