'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* ── Colour tokens ──────────────────────────────────────────────── */
const C = {
  teal: '#12343b', gold: '#e1b382', border: '#e2e8f0',
  bg: '#f0f4f8', surface: '#fff', muted: '#64748b',
  danger: '#dc2626', green: '#0f766e', accent: '#1a4a54',
}

/* ── SVG Icons ──────────────────────────────────────────────────── */
const Ic = {
  Overview:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  Businesses:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Customers:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Drivers:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Categories:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Revenue:       () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Subscriptions: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Fares:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Media:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  SiteSettings:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Audit:         () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Activity:      () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Maps:          () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>,
  Shield:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Bell:          () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Logout:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  ChevL:         () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>,
  ChevR:         () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
}

/* ── Nav items ──────────────────────────────────────────────────── */
const NAV = [
  { href: '/admin',               label: 'Overview',        Icon: Ic.Overview,      exact: true },
  { href: '/admin/businesses',    label: 'Businesses',      Icon: Ic.Businesses },
  { href: '/admin/customers',     label: 'Customers',       Icon: Ic.Customers },
  { href: '/admin/drivers',       label: 'Drivers',         Icon: Ic.Drivers },
  { href: '/admin/subscriptions', label: 'Subscriptions',   Icon: Ic.Subscriptions },
  { href: '/admin/revenue',       label: 'Revenue',         Icon: Ic.Revenue },
  { href: '/admin/fares',         label: 'Fares',           Icon: Ic.Fares },
  { href: '/admin/media',         label: 'Media & Ads',     Icon: Ic.Media },
  { href: '/admin/categories',    label: 'Categories',      Icon: Ic.Categories },
  { href: '/admin/site',          label: 'Site Settings',   Icon: Ic.SiteSettings },
  { href: '/admin/activity',      label: 'Activity',        Icon: Ic.Activity },
  { href: '/admin/audit',         label: 'Audit Log',       Icon: Ic.Audit },
  { href: '/admin/maps',          label: 'Maps',            Icon: Ic.Maps },
]

/* ── Page title map ─────────────────────────────────────────────── */
const PAGE_TITLE: Record<string, string> = {
  '/admin': 'Overview',
  '/admin/businesses': 'Businesses',
  '/admin/customers': 'Customers',
  '/admin/drivers': 'Drivers & Rides',
  '/admin/subscriptions': 'Subscriptions',
  '/admin/revenue': 'Revenue & Analytics',
  '/admin/fares': 'Fares & Pricing',
  '/admin/media': 'Media & Ads',
  '/admin/categories': 'Categories',
  '/admin/site': 'Site Settings',
  '/admin/activity': 'Activity Feed',
  '/admin/audit': 'Audit Log',
  '/admin/maps': 'Maps Integration',
  '/admin/settings': 'Platform Settings',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeTabRef = useRef<HTMLAnchorElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  }

  // Get current page title
  const currentTitle = Object.entries(PAGE_TITLE).find(([key]) =>
    key === '/admin' ? pathname === '/admin' : pathname === key || pathname.startsWith(key + '/')
  )?.[1] ?? 'Admin'

  // Update scroll indicators
  function updateScrollIndicators() {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  // Scroll active tab into view on mount / route change
  useEffect(() => {
    setTimeout(() => {
      activeTabRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      updateScrollIndicators()
    }, 80)
  }, [pathname])

  function scrollTabs(dir: 'left' | 'right') {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'inherit' }}>

      {/* ── TOP HEADER ─────────────────────────────────────────── */}
      <header style={{
        background: C.teal,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 20px rgba(0,0,0,.25)',
      }}>
        {/* Brand row */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', height: 58,
        }}>
          {/* Left: logo + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.teal, fontWeight: 900, fontSize: 15, flexShrink: 0,
              boxShadow: '0 2px 8px rgba(225,179,130,.4)',
            }}>
              MK
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, lineHeight: 1.15, letterSpacing: -.2 }}>
                My KKR
              </div>
              <div style={{ color: 'rgba(255,255,255,.55)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .8 }}>
                Admin Platform
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,.15)', margin: '0 4px' }} />

            {/* Current page breadcrumb */}
            <div style={{ color: C.gold, fontWeight: 700, fontSize: 14 }}>{currentTitle}</div>
          </div>

          {/* Right: actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Demo badge */}
            <span style={{
              background: 'rgba(225,179,130,.18)', color: C.gold,
              padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800,
              border: '1px solid rgba(225,179,130,.35)', letterSpacing: .6, textTransform: 'uppercase',
            }}>
              Demo
            </span>

            {/* Bell */}
            <button style={{
              position: 'relative', background: 'rgba(255,255,255,.1)', border: 'none',
              borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,.85)',
            }}>
              <Ic.Bell />
              <span style={{
                position: 'absolute', top: 7, right: 7, width: 7, height: 7,
                borderRadius: '50%', background: '#f97316', border: '1.5px solid ' + C.teal,
              }} />
            </button>

            {/* Admin avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.1)', borderRadius: 10, padding: '5px 10px 5px 6px', cursor: 'pointer' }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7,
                background: C.gold, color: C.teal,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 11,
              }}>
                A
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: 11.5, fontWeight: 700, lineHeight: 1 }}>Admin</div>
                <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 10, marginTop: 1 }}>mykkr.in</div>
              </div>
            </div>

            {/* Exit to site */}
            <Link href="/" style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(220,38,38,.2)', border: '1px solid rgba(220,38,38,.4)',
              borderRadius: 8, padding: '6px 12px', color: '#fca5a5',
              fontSize: 12, fontWeight: 700, textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}>
              <Ic.Logout />
              <span className="hide-xs">Exit</span>
            </Link>
          </div>
        </div>

        {/* ── NAV TABS ROW ──────────────────────────────────────── */}
        <div style={{
          position: 'relative',
          borderTop: '1px solid rgba(255,255,255,.08)',
        }}>
          {/* Scroll left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scrollTabs('left')}
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 2,
                background: `linear-gradient(to right, ${C.teal} 60%, transparent)`,
                border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)',
                padding: '0 12px 0 8px', display: 'flex', alignItems: 'center',
              }}
            >
              <Ic.ChevL />
            </button>
          )}

          {/* Scrollable tab strip */}
          <div
            ref={scrollRef}
            onScroll={updateScrollIndicators}
            style={{
              display: 'flex', overflowX: 'auto', scrollbarWidth: 'none',
              padding: '0 16px',
              msOverflowStyle: 'none',
            }}
          >
            {NAV.map(item => {
              const active = isActive(item.href, item.exact)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={active ? activeTabRef : null}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '10px 16px', whiteSpace: 'nowrap', flexShrink: 0,
                    color: active ? '#fff' : 'rgba(255,255,255,.55)',
                    fontWeight: active ? 700 : 500, fontSize: 13,
                    textDecoration: 'none', position: 'relative',
                    transition: 'color .15s',
                    borderBottom: active ? `2.5px solid ${C.gold}` : '2.5px solid transparent',
                    paddingBottom: active ? 9 : 10,
                    background: active ? 'rgba(255,255,255,.06)' : 'transparent',
                  }}
                >
                  <span style={{ opacity: active ? 1 : .7, transition: 'opacity .15s' }}>
                    <item.Icon />
                  </span>
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Scroll right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scrollTabs('right')}
              style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 2,
                background: `linear-gradient(to left, ${C.teal} 60%, transparent)`,
                border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.7)',
                padding: '0 8px 0 12px', display: 'flex', alignItems: 'center',
              }}
            >
              <Ic.ChevR />
            </button>
          )}
        </div>
      </header>

      {/* ── PAGE CONTENT ─────────────────────────────────────────── */}
      <main style={{ padding: '24px 20px', maxWidth: 1400, margin: '0 auto' }}>
        {children}
      </main>

      <style>{`
        ::-webkit-scrollbar { display: none; }
        .hide-xs { display: inline; }
        @media (max-width: 480px) { .hide-xs { display: none; } }
        a:hover { opacity: .85; }
      `}</style>
    </div>
  )
}
