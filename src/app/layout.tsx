import type { Metadata, Viewport } from 'next'
import './globals.css'
import TopNav from '@/components/layout/TopNav'
import NavList from '@/components/layout/NavList'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'
import SubscriptionProvider from '@/components/subscription/SubscriptionProvider'
import { IconWhatsApp } from '@/components/layout/NavIcons'
import Link from 'next/link'
import { DISCLAIMER, SITE } from '@/config/platform'

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'My KKR — Kurukshetra Local Marketplace', template: '%s · My KKR' },
  description:
    'Find trusted local shops, services, venues, rides and properties in Kurukshetra. Zero commission — pay businesses directly.',
  keywords: ['Kurukshetra', 'local businesses', 'marketplace', 'services', 'KKR', 'Haryana', 'shop near me'],
  authors: [{ name: 'My KKR' }],
  creator: 'My KKR',
  publisher: 'My KKR',
  openGraph: {
    title: 'My KKR — Kurukshetra Local Marketplace',
    description: 'Find trusted local businesses in Kurukshetra',
    url: SITE.url,
    siteName: 'My KKR',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My KKR — Kurukshetra Local Marketplace',
    description: 'Find trusted local businesses in Kurukshetra',
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#12343b',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        {/* Inter font — loaded from Google Fonts via preconnect for speed */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SubscriptionProvider>
          <TopNav />
          <div className="app-body">
            <aside className="sidebar" aria-label="Site navigation">
              <NavList />
              <div className="sidebar-cta">
                <Link href="/post" className="btn btn-accent btn-block">+ Post a Requirement</Link>
              </div>
            </aside>
            <div className="main">
              <main id="main" tabIndex={-1}>{children}</main>
              <Footer />
            </div>
          </div>
          <BottomNav />
          <a
            href={SITE.supportWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="floating-help"
            aria-label="WhatsApp support"
          >
            <IconWhatsApp /> Help
          </a>
        </SubscriptionProvider>
      </body>
    </html>
  )
}
