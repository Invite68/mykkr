'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BOTTOM_NAV, isActive } from '@/config/nav'

export default function BottomNav() {
  const pathname = usePathname() ?? '/'
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      {BOTTOM_NAV.map((item) =>
        item.href === '/post' ? (
          <Link key={item.href} href={item.href} className="bnav-item" aria-label="Post a requirement">
            <span className="bnav-post" aria-hidden="true">+</span>
            {item.label}
          </Link>
        ) : (
          <Link key={item.href} href={item.href} className={`bnav-item${isActive(pathname, item.href) ? ' active' : ''}`}>
            <span className="bnav-icon" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ),
      )}
    </nav>
  )
}
