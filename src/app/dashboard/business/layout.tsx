/**
 * Business Owner Portal Layout
 * Sidebar nav + main content area.
 * No auth required in demo mode — all management routes live here.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// ── Nav items ──────────────────────────────────────────────────────────────────

const NAV = [
  {
    id: 'home',
    label: 'Home',
    href: '/dashboard/business',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'services',
    label: 'Jobs & Services',
    href: '/dashboard/business/services',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    sub: 3, // pending badge count
  },
  {
    id: 'profile',
    label: 'Edit Profile',
    href: '/dashboard/business/profile',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'analytics',
    label: 'Analytics',
    href: '/dashboard/business/analytics',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
      </svg>
    ),
  },
  {
    id: 'subscription',
    label: 'Subscription',
    href: '/dashboard/business/subscription',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

// ── Sidebar ────────────────────────────────────────────────────────────────────

function Sidebar({ current }: { current: string }) {
  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: '#0f1923',
      borderRight: '1px solid #1e2d3a',
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh',
    }}>
      {/* Logo / brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #1e2d3a' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div style={{ fontWeight: 900, fontSize: 18, color: '#fff', letterSpacing: -0.5 }}>
            My<span style={{ color: '#f97316' }}>KKR</span>
          </div>
          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Business Portal</div>
        </Link>
      </div>

      {/* Business identity */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #1e2d3a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: '#12343b', color: '#34d399',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800,
          }}>RS</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Sharma Kirana
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>Groceries · Thanesar</div>
          </div>
        </div>
        {/* Active subscription indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5, marginTop: 10,
          padding: '5px 8px', borderRadius: 6,
          background: '#16a34a18', border: '1px solid #16a34a30',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>Active — Business Plan</span>
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const isActive = item.href === '/dashboard/business'
            ? current === '/dashboard/business'
            : current.startsWith(item.href)
          return (
            <Link key={item.id} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              textDecoration: 'none',
              background: isActive ? '#f9731618' : 'transparent',
              border: `1px solid ${isActive ? '#f9731630' : 'transparent'}`,
              color: isActive ? '#f97316' : '#94a3b8',
              fontWeight: isActive ? 700 : 500,
              fontSize: 13,
              transition: 'all 0.15s',
              position: 'relative',
            }}>
              <span style={{ flexShrink: 0, color: isActive ? '#f97316' : '#64748b' }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.sub && item.sub > 0 && !isActive && (
                <span style={{
                  background: '#dc2626', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 6px', borderRadius: 99, minWidth: 18, textAlign: 'center',
                }}>{item.sub}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid #1e2d3a', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Link href="/business/sharma-kirana-store" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 8,
          textDecoration: 'none', color: '#64748b', fontSize: 12, fontWeight: 500,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View public page
        </Link>
        <Link href="/demo-login" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '9px 12px', borderRadius: 8,
          textDecoration: 'none', color: '#64748b', fontSize: 12, fontWeight: 500,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Switch account
        </Link>
      </div>
    </aside>
  )
}

// ── Mobile nav bar ─────────────────────────────────────────────────────────────

function MobileNav({ current }: { current: string }) {
  return (
    <nav style={{
      display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: '#0f1923', borderTop: '1px solid #1e2d3a',
      padding: '6px 0 8px',
    }} className="mobile-nav-bar">
      {NAV.map((item) => {
        const isActive = item.href === '/dashboard/business'
          ? current === '/dashboard/business'
          : current.startsWith(item.href)
        return (
          <Link key={item.id} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', color: isActive ? '#f97316' : '#64748b',
            fontSize: 10, fontWeight: isActive ? 700 : 500,
            padding: '4px 0', position: 'relative',
          }}>
            <span style={{ color: isActive ? '#f97316' : '#64748b' }}>{item.icon}</span>
            {item.label.split(' ')[0]}
            {item.sub && item.sub > 0 && !isActive && (
              <span style={{
                position: 'absolute', top: 0, right: '15%',
                background: '#dc2626', color: '#fff',
                fontSize: 9, fontWeight: 800,
                padding: '1px 4px', borderRadius: 99,
              }}>{item.sub}</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

// ── Layout ─────────────────────────────────────────────────────────────────────

export default function BusinessPortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        .biz-portal-shell {
          display: flex;
          min-height: 100vh;
          background: #111827;
        }
        .biz-portal-main {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
        }
        .biz-portal-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 28px 20px 100px;
        }
        @media (max-width: 768px) {
          .biz-sidebar { display: none !important; }
          .mobile-nav-bar { display: flex !important; }
          .biz-portal-content { padding-bottom: 90px; }
        }
        @media (min-width: 769px) {
          .mobile-nav-bar { display: none !important; }
        }
      `}</style>

      <div className="biz-portal-shell">
        {/* Desktop sidebar */}
        <div className="biz-sidebar">
          <Sidebar current={pathname} />
        </div>

        {/* Main content */}
        <main className="biz-portal-main">
          <div className="biz-portal-content">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav current={pathname} />
    </>
  )
}
