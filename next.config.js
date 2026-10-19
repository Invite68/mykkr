/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== 'production'

/**
 * Content-Security-Policy — identical to the policy that used to live in
 * src/app/route.ts, now applied to EVERY route.
 *
 * Production never allows 'unsafe-eval': the React app uses real event
 * handlers (onClick={...}), so nothing is ever evaluated from a string.
 * `next dev` needs eval for hot reload, so it is added in development only.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://*.tile.openstreetmap.org https://nominatim.openstreetmap.org",
  'frame-src https://www.openstreetmap.org https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com',
  `connect-src 'self' https://nominatim.openstreetmap.org https://router.project-osrm.org https://fonts.googleapis.com${isDev ? ' ws:' : ''}`,
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "worker-src 'none'",
  "object-src 'none'",
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
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: CSP },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // geolocation=(self) so "Use my location" works on Find & Book / Rides
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=(), geolocation=(self)' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      // Canonical host
      { source: '/:path*', has: [{ type: 'host', value: 'www.mykkr.in' }], destination: 'https://mykkr.in/:path*', permanent: true },
      // Old single-page section names → new routes (keeps shared links working)
      { source: '/services', destination: '/c/home-services', permanent: false },
      { source: '/shop', destination: '/c/groceries-essentials', permanent: false },
      { source: '/food', destination: '/c/food-beverages', permanent: false },
      { source: '/preview.html', destination: '/', permanent: true },
    ]
  },
}

module.exports = nextConfig
