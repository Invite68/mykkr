'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavEntry {
  href: string
  icon: string
  label: string
}

const MAIN_CATS: NavEntry[] = [
  { href: '/c/services',  icon: '🔧', label: 'Services' },
  { href: '/c/shopping',  icon: '🛍️', label: 'Shop' },
  { href: '/c/food',      icon: '🍛', label: 'Food & Dining' },
  { href: '/c/venues',    icon: '🏛️', label: 'Venues & Events' },
  { href: '/rides',       icon: '🚗', label: 'Rides & Delivery' },
  { href: '/find-book',   icon: '📅', label: 'Find & Book' },
  { href: '/post',        icon: '📋', label: 'Post Requirement' },
]

const SECONDARY: NavEntry[] = [
  { href: '/about',    icon: '🏛️', label: 'About Kurukshetra' },
  { href: '/pricing',  icon: '💳', label: 'Pricing' },
  { href: '/register', icon: '👤', label: 'Sign in / Register' },
]

export default function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? '/'

  function active(href: string) {
    if (href === '/') return pathname === '/'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav aria-label="Main" className="drawer-nav">
      {/* Primary — categories */}
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

      {/* Secondary */}
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
