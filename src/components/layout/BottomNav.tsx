'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { isActive } from '@/config/nav'
import { IconHome, IconBook, IconRides, IconAccount } from './NavIcons'

export default function BottomNav() {
  const pathname = usePathname() ?? '/'
  return (
    <nav className="bottom-nav" aria-label="Quick navigation">
      <Link href="/" className={`bnav-item${isActive(pathname, '/') ? ' active' : ''}`}>
        <span className="bnav-icon" aria-hidden="true"><IconHome /></span>
        Home
      </Link>
      <Link href="/find-book" className={`bnav-item${isActive(pathname, '/find-book') ? ' active' : ''}`}>
        <span className="bnav-icon" aria-hidden="true"><IconBook /></span>
        Find &amp; Book
      </Link>
      <Link href="/post" className="bnav-item" aria-label="Post a requirement">
        <span className="bnav-post" aria-hidden="true">+</span>
        Post
      </Link>
      <Link href="/rides" className={`bnav-item${isActive(pathname, '/rides') ? ' active' : ''}`}>
        <span className="bnav-icon" aria-hidden="true"><IconRides /></span>
        Rides
      </Link>
      <Link href="/register" className={`bnav-item${isActive(pathname, '/register') ? ' active' : ''}`}>
        <span className="bnav-icon" aria-hidden="true"><IconAccount /></span>
        Account
      </Link>
    </nav>
  )
}
