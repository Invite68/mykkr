'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import {
  IconHome, IconCategories, IconBook, IconRides, IconPost,
  IconAbout, IconPricing, IconAccount, IconDashboard,
} from './NavIcons'

// Inline SVGs for category-specific icons (reuse hero pill set)
const SvgServices  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
const SvgShop      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
const SvgFood      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
const SvgVenues    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>

interface NavEntry { href: string; icon: ReactNode; label: string }

const MAIN_CATS: NavEntry[] = [
  { href: '/c/services', icon: <SvgServices />, label: 'Services' },
  { href: '/c/shopping', icon: <SvgShop />,     label: 'Shop' },
  { href: '/c/food',     icon: <SvgFood />,     label: 'Food & Dining' },
  { href: '/c/venues',   icon: <SvgVenues />,   label: 'Venues & Events' },
  { href: '/rides',      icon: <IconRides />,   label: 'Rides & Delivery' },
  { href: '/find-book',  icon: <IconBook />,    label: 'Find & Book' },
  { href: '/post',       icon: <IconPost />,    label: 'Post Requirement' },
]

const SECONDARY: NavEntry[] = [
  { href: '/about',     icon: <IconAbout />,     label: 'About Kurukshetra' },
  { href: '/pricing',   icon: <IconPricing />,   label: 'Pricing' },
  { href: '/register',  icon: <IconAccount />,   label: 'Sign in / Register' },
  { href: '/dashboard', icon: <IconDashboard />, label: 'Dashboards' },
]

export default function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? '/'

  function active(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav aria-label="Main" className="drawer-nav">
      <div className="drawer-section-label">Explore</div>
      {MAIN_CATS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`drawer-nav-item${active(item.href) ? ' active' : ''}`}
          aria-current={active(item.href) ? 'page' : undefined}
        >
          <span className="drawer-nav-icon" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}

      <div className="drawer-divider" />

      {SECONDARY.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`drawer-nav-item secondary${active(item.href) ? ' active' : ''}`}
          aria-current={active(item.href) ? 'page' : undefined}
        >
          <span className="drawer-nav-icon" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}
