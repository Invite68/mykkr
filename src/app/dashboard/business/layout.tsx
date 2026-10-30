/**
 * Business Owner Portal — Layout
 * Brand palette: --night-d (#12343b) teal | --tan (#e1b382) gold | white
 * Dark sidebar shell with teal accent, gold highlights on active nav.
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import SignOutButton from '@/components/SignOutButton'

// ── Colour tokens (consistent with globals.css brand) ─────────────────────────
const C = {
  teal:      '#12343b',
  tealMid:   '#2d545e',
  tealLight: '#3d6b78',
  gold:      '#e1b382',
  goldDim:   '#c89666',
  goldBg:    'rgba(225,179,130,0.12)',
  goldBorder:'rgba(225,179,130,0.25)',
  sidebar:   '#0c2228',  // darker teal for sidebar
  panel:     '#132b32',  // card background
  panelBorder:'#1e3d47',
  text1:     '#f0f4f5',
  text2:     '#8fb3bc',
  text3:     '#4a7a88',
}

// ── Nav items ──────────────────────────────────────────────────────────────────
const NAV = [
  {
    id: 'home', label: 'Home', href: '/dashboard/business',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'services', label: 'Orders & Jobs', href: '/dashboard/business/services', badge: 3,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </svg>
    ),
  },
  {
    id: 'profile', label: 'Edit Profile', href: '/dashboard/business/profile',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  },
  {
    id: 'analytics', label: 'Analytics', href: '/dashboard/business/analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    id: 'subscription', label: 'Plan & Help', href: '/dashboard/business/subscription',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
      width: 224, flexShrink: 0,
      background: C.sidebar,
      borderRight: `1px solid ${C.panelBorder}`,
      display: 'flex', flexDirection: 'column',
      minHeight: '100vh', position: 'sticky', top: 0,
    }}>

      {/* Logo */}
      <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${C.panelBorder}` }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={{ fontWeight: 900, fontSize: 20, color: C.text1, letterSpacing: -0.5, lineHeight: 1 }}>
            My<span style={{ color: C.gold }}>KKR</span>
          </div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 3, fontWeight: 500, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            Business Portal
          </div>
        </Link>
      </div>

      {/* Business card */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.panelBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: C.tealMid, border: `2px solid ${C.tealLight}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: C.gold,
          }}>SK</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Sharma Kirana Store
            </div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>Groceries · Thanesar</div>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
          padding: '5px 10px', borderRadius: 6,
          background: 'rgba(20,160,80,0.12)', border: '1px solid rgba(20,160,80,0.25)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80' }}>Active — Business Plan</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const isActive = item.href === '/dashboard/business'
            ? current === '/dashboard/business'
            : current.startsWith(item.href)
          return (
            <Link key={item.id} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              textDecoration: 'none',
              background: isActive ? C.goldBg : 'transparent',
              border: `1px solid ${isActive ? C.goldBorder : 'transparent'}`,
              color: isActive ? C.gold : C.text2,
              fontWeight: isActive ? 700 : 500,
              fontSize: 13, transition: 'all 0.15s',
            }}>
              <span style={{ flexShrink: 0, color: isActive ? C.gold : C.text3 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && item.badge > 0 && !isActive && (
                <span style={{
                  background: '#dc2626', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  padding: '1px 5px', borderRadius: 99, minWidth: 16, textAlign: 'center',
                }}>{item.badge}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom links */}
      <div style={{ padding: '12px 12px', borderTop: `1px solid ${C.panelBorder}`, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Link href="/business/sharma-kirana-store" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 8,
          textDecoration: 'none', color: C.text3, fontSize: 12, fontWeight: 500,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View public page
        </Link>
        <SignOutButton
          style={{
            color: C.text3, borderColor: C.panelBorder, width: '100%',
            justifyContent: 'flex-start', padding: '8px 12px', borderRadius: 8,
            fontSize: 12, fontWeight: 500,
          }}
        />
      </div>
    </aside>
  )
}

// ── Mobile nav ─────────────────────────────────────────────────────────────────
function MobileNav({ current }: { current: string }) {
  return (
    <nav style={{
      display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: C.sidebar, borderTop: `1px solid ${C.panelBorder}`,
      padding: '6px 0 env(safe-area-inset-bottom)',
    }} className="biz-mobile-nav">
      {NAV.map((item) => {
        const isActive = item.href === '/dashboard/business'
          ? current === '/dashboard/business'
          : current.startsWith(item.href)
        return (
          <Link key={item.id} href={item.href} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            textDecoration: 'none', color: isActive ? C.gold : C.text3,
            fontSize: 9, fontWeight: isActive ? 700 : 400,
            padding: '4px 2px', position: 'relative',
            letterSpacing: 0.3,
          }}>
            <span style={{ color: isActive ? C.gold : C.text3 }}>{item.icon}</span>
            {item.label.split(' ')[0]}
            {item.badge && item.badge > 0 && !isActive && (
              <span style={{
                position: 'absolute', top: 2, right: 'calc(50% - 16px)',
                background: '#dc2626', color: '#fff',
                fontSize: 8, fontWeight: 800,
                padding: '1px 4px', borderRadius: 99,
              }}>{item.badge}</span>
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
          display: flex; min-height: 100vh;
          background: #0e2028;
        }
        .biz-portal-main { flex: 1; min-width: 0; overflow-x: hidden; background: #ffffff; }
        .biz-portal-content {
          max-width: 860px; margin: 0 auto;
          padding: 28px 24px 120px;
        }
        .biz-sidebar { display: flex; }
        .biz-mobile-nav { display: none !important; }
        @media (max-width: 800px) {
          .biz-sidebar { display: none !important; }
          .biz-mobile-nav { display: flex !important; }
          .biz-portal-content { padding: 20px 16px 100px; }
        }
      `}</style>

      <div className="biz-portal-shell">
        <div className="biz-sidebar"><Sidebar current={pathname} /></div>
        <main className="biz-portal-main">
          <div className="biz-portal-content">{children}</div>
        </main>
      </div>
      <MobileNav current={pathname} />
    </>
  )
}
