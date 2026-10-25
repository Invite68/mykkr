'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import NavList from './NavList'
import SearchForm from '@/components/search/SearchForm'

export default function TopNav() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer whenever the route changes
  useEffect(() => setDrawerOpen(false), [pathname])

  // Lock page scroll + close on Escape while the drawer is open
  useEffect(() => {
    if (!drawerOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false)
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [drawerOpen])

  return (
    <>
      <header className="topnav">
        <Logo />
        <div className="topnav-spacer" />
        <div className="topnav-search">
          <SearchForm variant="nav" />
        </div>
        <div className="topnav-actions">
          <Link href="/register?role=customer" className="tn-btn ghost">Sign in</Link>
          <Link href="/register?role=business" className="tn-btn primary">List your business</Link>
        </div>
        <button className="hamburger" aria-label="Open menu" aria-expanded={drawerOpen} onClick={() => setDrawerOpen(true)}>
          <span /><span /><span />
        </button>
      </header>

      {drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="drawer" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="drawer-head">
              <strong>Menu</strong>
              <button className="btn btn-outline btn-sm" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <NavList onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}
    </>
  )
}
