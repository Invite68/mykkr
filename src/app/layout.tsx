import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'My KKR — Kurukshetra Local Marketplace',
  description: 'Find trusted local businesses in Kurukshetra. DJs, venues, catering, home services and more.',
  keywords: ['Kurukshetra', 'local businesses', 'marketplace', 'services', 'KKR'],
  authors: [{ name: 'My KKR' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: 'My KKR — Kurukshetra Local Marketplace',
    description: 'Find trusted local businesses in Kurukshetra',
    url: 'https://mykkr.in',
    siteName: 'My KKR',
    locale: 'en_IN',
    type: 'website',
  },
  // Security: prevent phone number detection
  other: {
    'format-detection': 'telephone=no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        {/* Preconnect to font domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
