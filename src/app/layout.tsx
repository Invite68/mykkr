import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My KKR — Kurukshetra Local Marketplace',
  description: 'Find trusted local businesses in Kurukshetra. DJs, venues, catering, home services and more.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
