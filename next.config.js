/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Content-Security-Policy
 *
 * Notes:
 * - No 'unsafe-eval' in production — React uses real event handlers.
 * - Font is served by Next.js itself (next/font/google bakes font into
 *   .next/static at build time) → no external font connect-src needed.
 * - Cloudflare Turnstile runs in its own iframe on challenges.cloudflare.com.
 * - OpenStreetMap used for map embeds on business detail pages.
 * - YouTube-nocookie used for MediaStrip embeds.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
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
  "frame-ancestors 'none'",
  "worker-src 'none'",
  "object-src 'none'",
  "manifest-src 'self'",
  // "upgrade-insecure-requests" — intentionally omitted:
  // The Coolify preview runs on plain HTTP. This directive would cause the
  // browser to upgrade /_next/static/*.css requests to HTTPS, which the
  // container doesn't serve → CSS silently 404s → page renders unstyled.
  // Re-enable ONLY after the domain has a valid TLS cert (mykkr.in + Cloudflare).
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
          { key: 'Content-Security-Policy', value: CSP },
          // SAMEORIGIN allows our own srcDoc iframes; DENY would block them
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // geolocation=(self) so "Use my location" works on Find & Book / Rides
            value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self), interest-cohort=()',
          },
          // HSTS only sent on HTTPS — sending it on HTTP causes redirect loops
          // and extremely slow page loads. Re-enable once domain has TLS cert.
          // { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
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
