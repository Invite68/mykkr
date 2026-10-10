/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker/Coolify deployment
  images: {
    domains: ['storage.googleapis.com', 'firebasestorage.googleapis.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // Compression for faster loads on Jio/Airtel
  compress: true,
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
