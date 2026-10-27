'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/* ── Colour tokens ──────────────────────────────────────────────── */
const C = {
  teal: '#12343b', gold: '#e1b382', border: '#e2e8f0',
  bg: '#f1f5f9', surface: '#fff', muted: '#64748b',
  danger: '#dc2626', green: '#0f766e',
}

/* ── SVG Icons ──────────────────────────────────────────────────── */
const Ic = {
  Overview:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Businesses:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Customers:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Drivers:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  Categories:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  Revenue:       () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Subscriptions: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Fares:         () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  Media:         () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  SiteSettings:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Audit:         () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Activity:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Shield:        () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Menu:          () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  Close:         () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Logout:        () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  Chevron:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
}

/* ── Nav structure ──────────────────────────────────────────────── */
const NAV = [
  { href: '/admin',               label: 'Overview',       Icon: Ic.Overview,      exact: true },
  { href: '/admin/businesses',    label: 'Businesses',     Icon: Ic.Businesses },
  { href: '/admin/customers',     label: 'Customers',      Icon: Ic.Customers },
  { href: '/admin/drivers',       label: 'Drivers & Rides',Icon: Ic.Drivers },
  { href: '/admin/categories',    label: 'Categories',     Icon: Ic.Categories },
  {
    label: 'Money', Icon: Ic.Revenue,
    children: [
      { href: '/admin/subscriptions', label: 'Subscriptions' },
      { href: '/admin/revenue',       label: 'Revenue & Analytics' },
      { href: '/admin/fares',         label: 'Fares & Pricing' },
    ],
  },
  { href: '/admin/media',         label: 'Media & Ads',   Icon: Ic.Media },
  { href: '/admin/site',          label: 'Site Settings',  Icon: Ic.SiteSettings },
  { href: '/admin/activity',      label: 'Activity Feed',  Icon: Ic.Activity },
  { href: '/admin/audit',         label: 'Audit Log',      Icon: Ic.Audit },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sideOpen, setSideOpen] = useState(false)
  const [moneyOpen, setMoneyOpen] = useState(
    pathname.startsWith('/admin/subscriptions') ||
    pathname.startsWith('/admin/revenue') ||
    pathname.startsWith('/admin/fares')
  )

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
  }

  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: C.teal, color: '#fff', flexShrink: 0 }}>
            <Ic.Shield />
          </span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.teal, lineHeight: 1.1 }}>My KKR</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {NAV.map((item) => {
          // Group item with children
          if ('children' in item && item.children) {
            const groupActive = item.children.some(c => pathname.startsWith(c.href))
            return (
              <div key={item.label}>
                <button
                  onClick={() => setMoneyOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '9px 10px', borderRadius: 7, marginBottom: 2,
                    background: groupActive ? 'rgba(18,52,59,.08)' : 'transparent',
                    color: groupActive ? C.teal : C.muted,
                    fontWeight: groupActive ? 700 : 500, fontSize: 13.5,
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <span style={{ opacity: groupActive ? 1 : .65 }}><item.Icon /></span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <span style={{ transform: moneyOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}><Ic.Chevron /></span>
                </button>
                {moneyOpen && (
                  <div style={{ marginLeft: 22, marginBottom: 4 }}>
                    {item.children.map(child => {
                      const ca = pathname === child.href || pathname.startsWith(child.href + '/')
                      return (
                        <Link key={child.href} href={child.href} onClick={() => setSideOpen(false)} style={{
                          display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 6, marginBottom: 1,
                          color: ca ? C.teal : C.muted, background: ca ? 'rgba(18,52,59,.07)' : 'transparent',
                          fontWeight: ca ? 700 : 500, fontSize: 13, textDecoration: 'none',
                        }}>
                          <span style={{ width: 4, height: 4, borderRadius: '50%', background: ca ? C.teal : '#cbd5e1', flexShrink: 0 }} />
                          {child.label}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          }

          // Regular nav item
          const navItem = item as { href: string; label: string; Icon: () => React.ReactElement; exact?: boolean }
          const active = isActive(navItem.href, navItem.exact)
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              onClick={() => setSideOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 7, marginBottom: 2,
                color: active ? C.teal : C.muted,
                background: active ? 'rgba(18,52,59,.09)' : 'transparent',
                fontWeight: active ? 700 : 500, fontSize: 13.5,
                textDecoration: 'none', transition: 'background .1s, color .1s',
              }}
            >
              <span style={{ opacity: active ? 1 : .65 }}><navItem.Icon /></span>
              <span style={{ flex: 1 }}>{navItem.label}</span>
              {active && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.teal, flexShrink: 0 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '10px 8px 14px', borderTop: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.muted, paddingLeft: 10, marginBottom: 6 }}>admin@mykkr.in</div>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 7, color: C.danger, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: 'rgba(220,38,38,.06)' }}>
          <Ic.Logout /> Exit to site
        </Link>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: C.bg, fontFamily: 'inherit' }}>
      {/* Desktop sidebar */}
      <aside
        className="admin-sidebar"
        style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, position: 'sticky', top: 0, height: '100vh', flexShrink: 0, display: 'none', flexDirection: 'column' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div onClick={() => setSideOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 99 }} />
      )}
      <aside style={{
        position: 'fixed', top: 0, left: sideOpen ? 0 : -240, width: 240,
        height: '100vh', background: C.surface, zIndex: 100,
        boxShadow: sideOpen ? '4px 0 28px rgba(0,0,0,.18)' : 'none',
        transition: 'left .2s ease', display: 'flex', flexDirection: 'column',
      }}>
        <SidebarContent />
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header style={{ background: C.teal, color: '#fff', padding: '0 20px', height: 50, display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50, flexShrink: 0 }}>
          <button onClick={() => setSideOpen(s => !s)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }} aria-label="Toggle menu">
            {sideOpen ? <Ic.Close /> : <Ic.Menu />}
          </button>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Admin Control Panel</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: 'rgba(225,179,130,.3)', color: C.gold, padding: '2px 10px', borderRadius: 99, fontSize: 11, fontWeight: 800, border: '1px solid rgba(225,179,130,.5)' }}>DEMO MODE</span>
          </div>
        </header>

        <main style={{ flex: 1, padding: '20px', maxWidth: 1400, width: '100%' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
