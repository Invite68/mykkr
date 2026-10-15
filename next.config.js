/** @type {import('next').NextConfig} */
const nextConfig = {

  // ── Output: standalone for Docker ──
  output: 'standalone',

  // ── Compression ──
  compress: true,

  // ── Hide Next.js version from attackers ──
  poweredByHeader: false,

  // ── Telemetry off ──
  // (also set NEXT_TELEMETRY_DISABLED=1 in Coolify env vars)

  // ── Images — updated for Next.js 16 (domains deprecated) ──
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ── Turbopack (default in Next.js 16) — empty config silences error ──
  turbopack: {},

  // ── Security Headers on every response ──
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), payment=(), usb=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ]
  },

  // ── Canonical redirect: www → non-www ──
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

  // ── React strict mode ──
  reactStrictMode: true,

  // ── TypeScript: fail build on errors ──
  typescript: {
    ignoreBuildErrors: false,
  },

  // NOTE: 'eslint' config key removed — not supported in Next.js 16
  // NOTE: 'webpack' config removed — Turbopack is default in Next.js 16
  // Run: next lint separately if needed
}

module.exports = nextConfig
