import type { Metadata, Viewport } from 'next'
import { Poppins, Noto_Sans_Devanagari } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

const noto = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'My KKR — Kurukshetra ka Apna Bazaar',
    template: '%s | My KKR',
  },
  description: 'Find trusted local businesses in Kurukshetra — DJs, caterers, venues, home services, groceries and more. See live availability, compare prices, contact directly on WhatsApp.',
  keywords: [
    'Kurukshetra', 'local business', 'DJ Kurukshetra', 'catering Kurukshetra',
    'marriage hall KKR', 'electrician Thanesar', 'Kurukshetra marketplace',
    'My KKR', 'mykkr', 'KKR bazaar', 'कुरुक्षेत्र',
  ],
  authors: [{ name: 'My KKR' }],
  creator: 'My KKR',
  publisher: 'My KKR',
  metadataBase: new URL('https://mykkr.in'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    alternateLocale: 'hi_IN',
    url: 'https://mykkr.in',
    siteName: 'My KKR',
    title: 'My KKR — Kurukshetra ka Apna Bazaar',
    description: 'Find trusted local businesses in Kurukshetra. DJs, venues, catering, home services and more — with live availability calendar.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'My KKR' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My KKR — Kurukshetra Local Marketplace',
    description: 'Find and connect with trusted local businesses in Kurukshetra.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#FF6B1A',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${noto.variable}`}>
      <body className="font-sans bg-ink-50 text-ink-900 antialiased overflow-x-hidden">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-poppins)',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
