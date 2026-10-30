/**
 * Business Portal — Home
 * Server component shell — renders the profile hero (static) and mounts
 * BusinessDashboardClient which fetches live data from /api/business/dashboard.
 *
 * Brand: teal (#12343b) × gold (#e1b382) × white.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import BusinessDashboardClient from '@/components/dashboard/BusinessDashboardClient'

export const metadata: Metadata = {
  title: 'Dashboard — My KKR Business Portal',
  robots: 'noindex,nofollow',
}
export const dynamic = 'force-dynamic'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  teal:      '#12343b',
  tealMid:   '#2d545e',
  tealLight: '#3d6b78',
  gold:      '#e1b382',
  white:     '#ffffff',
  border:    '#e2e8f0',
  text2:     '#475569',
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BusinessHome() {
  const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]

  return (
    <>
      {/* ── PROFILE HERO ─────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', marginBottom: 24,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(18,52,59,0.06)',
      }}>
        {/* Cover */}
        <div style={{
          height: 140,
          background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealMid} 60%, ${C.tealLight} 100%)`,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: 'repeating-linear-gradient(60deg, #fff 0, #fff 1px, transparent 0, transparent 10px)',
          }} />
          <div style={{
            position: 'absolute', top: 12, right: 12,
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 99,
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.25)',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Live — profile is public
          </div>
        </div>

        {/* Info strip */}
        <div style={{ background: C.white, padding: '0 24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -32 }}>
            {/* Avatar placeholder — client component will update with real initials */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: C.teal, border: `3px solid ${C.white}`,
              boxShadow: '0 0 0 2px rgba(18,52,59,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div style={{ paddingBottom: 4, minWidth: 0, flex: 1 }}>
              <h1 style={{ fontWeight: 900, fontSize: 19, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>
                My Business
              </h1>
              <p style={{ fontSize: 12, color: C.text2, margin: '4px 0 0' }}>
                Complete your profile to show your business name and category.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <Link href="/dashboard/business/profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, textDecoration: 'none',
              background: C.teal, color: C.gold,
              fontSize: 13, fontWeight: 700,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit profile
            </Link>
            <Link href="/dashboard/business/subscription" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, textDecoration: 'none',
              border: `1.5px solid ${C.teal}`, color: C.teal,
              fontSize: 13, fontWeight: 600,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              Subscription
            </Link>
          </div>
        </div>
      </div>

      {/* ── Live client component — KPIs, recent jobs, quick actions ────────── */}
      <BusinessDashboardClient today={today} />
    </>
  )
}
