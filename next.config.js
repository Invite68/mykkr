/** @type {import('next').NextConfig} */
const nextConfig = {

  // ── Output mode: standalone for Docker ──
  output: 'standalone',

  // ── Compression ──
  compress: true,

  // ── Disable X-Powered-By header (hides Next.js version) ──
  poweredByHeader: false,

  // ── Image domains whitelist ──
  images: {
    domains: ['storage.googleapis.com'],
    // Disable image optimization for external images (security)
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Security Headers on every response ──
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), payment=(), usb=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
    ]
  },

  // ── Redirects: enforce www → non-www (or vice versa) ──
  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'www.mykkr.in' }],
        destination: 'https://mykkr.in',
        permanent: true,
      },
    ]
  },

  // ── Webpack: don't expose source maps in production ──
  webpack: (config, { isServer, dev }) => {
    if (!dev) {
      config.devtool = false  // No source maps in production
    }
    return config
  },

  // ── Experimental: strict mode for React ──
  reactStrictMode: true,

  // ── TypeScript: fail build on type errors ──
  typescript: {
    ignoreBuildErrors: false,
  },

  // ── ESLint: fail build on lint errors ──
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
