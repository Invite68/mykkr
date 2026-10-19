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
  "img-src 'self' data: https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
  "frame-src https://www.openstreetmap.org https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  `connect-src 'self' https://nominatim.openstreetmap.org https://router.project-osrm.org${isDev ? ' ws: wss:' : ''}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "worker-src 'none'",
  "object-src 'none'",
  "manifest-src 'self'",
  "upgrade-insecure-requests",
].join('; ')

const nextConfig = {
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },

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
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            // geolocation=(self) so "Use my location" works on Find & Book / Rides
            value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // COOP: isolates browsing context from cross-origin windows (safe, no iframe impact)
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          // NOTE: COEP and CORP are intentionally omitted — they break YouTube / Maps iframes
        ],
      },
      // Cache Next.js static assets aggressively
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // No-cache for API routes
      {
        source: '/api/(.*)',
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
