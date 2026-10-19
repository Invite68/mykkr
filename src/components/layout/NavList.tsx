'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { NAV_ACCOUNT, NAV_DISCOVER, NAV_EXPLORE, isActive, type NavItem } from '@/config/nav'

function Section({ label, items, onNavigate }: { label: string; items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname() ?? '/'
  return (
    <div>
      <div className="nav-label">{label}</div>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={`nav-item${isActive(pathname, item.href) ? ' active' : ''}`}
          aria-current={isActive(pathname, item.href) ? 'page' : undefined}
        >
          <span className="nav-icon" aria-hidden="true">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </div>
  )
}

/** Shared by the desktop sidebar and the mobile drawer */
export default function NavList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Main">
      <Section label="Discover" items={NAV_DISCOVER} onNavigate={onNavigate} />
      <div className="nav-divider" />
      <Section label="Explore KKR" items={NAV_EXPLORE} onNavigate={onNavigate} />
      <div className="nav-divider" />
      <Section label="Account" items={NAV_ACCOUNT} onNavigate={onNavigate} />
    </nav>
  )
}
