'use client'

/**
 * RootShell — wraps all pages with the site nav/footer.
 * Admin routes (/admin/*) bypass site chrome entirely so the
 * admin layout renders full-screen without the My KKR header.
 */

import { usePathname } from 'next/navigation'
import TopNav from '@/components/layout/TopNav'
import NavList from '@/components/layout/NavList'
import BottomNav from '@/components/layout/BottomNav'
import Footer from '@/components/layout/Footer'
import SubscriptionProvider from '@/components/subscription/SubscriptionProvider'
import { IconWhatsApp } from '@/components/layout/NavIcons'
import Link from 'next/link'
import { SITE } from '@/config/platform'

export default function RootShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/')

  if (isAdmin) {
    // Admin routes: no site chrome at all — admin layout handles its own UI
    return <>{children}</>
  }

  return (
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
  )
}
