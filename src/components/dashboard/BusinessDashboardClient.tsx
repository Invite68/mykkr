'use client'

/**
 * BusinessDashboardClient — live KPIs, recent jobs, and subscription status
 * for the business portal home page.
 *
 * On mount: gets Firebase ID token → calls /api/business/dashboard → renders
 * live data. Falls back to a helpful "no jobs yet" empty state.
 *
 * Security: contact_phone NEVER in API response; see /api/business/dashboard.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getFirebaseAuth } from '@/lib/firebase-client'

// ── Colour tokens (match page.tsx) ────────────────────────────────────────────
const C = {
  teal:    '#12343b',
  tealMid: '#2d545e',
  gold:    '#e1b382',
  goldDim: '#c89666',
  goldBg:  'rgba(225,179,130,0.10)',
  goldB:   'rgba(225,179,130,0.25)',
  white:   '#ffffff',
  bg:      '#f8fafc',
  border:  '#e2e8f0',
  text1:   '#0f172a',
  text2:   '#475569',
  text3:   '#94a3b8',
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Kpis {
  pending:   number
  accepted:  number
  completed: number
  cancelled: number
  total:     number
}

interface RecentJob {
  id:            string
  job_type:      string
  status:        string
  service_type:  string | null
  fare_estimate: number | null
  created_at:    string
}

interface Subscription {
  status:             string
  plan:               string
  trial_ends_at:      string | null
  current_period_end: string | null
}

interface DashData {
  kpis:       Kpis
  recentJobs: RecentJob[]
  subscription: Subscription | null
}

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 2)   return 'just now'
  if (mins < 60)  return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

function statusColor(status: string): string {
  switch (status) {
    case 'pending':         return '#d97706'
    case 'accepted':        return '#0d9488'
    case 'driver_en_route':
    case 'picked_up':       return '#7c3aed'
    case 'completed':       return '#16a34a'
    case 'cancelled':       return '#dc2626'
    default:                return '#64748b'
  }
}

function statusLabel(status: string): string {
  switch (status) {
    case 'pending':         return 'Pending'
    case 'accepted':        return 'Accepted'
    case 'driver_en_route': return 'En Route'
    case 'picked_up':       return 'Picked Up'
    case 'completed':       return 'Completed'
    case 'cancelled':       return 'Cancelled'
    default:                return status
  }
}

function jobTypeLabel(t: string): string {
  if (t === 'ride') return 'Ride'
  if (t === 'delivery') return 'Delivery'
  return 'Booking'
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function BusinessDashboardClient({ today }: { today: string }) {
  const [state, setState] = useState<'loading' | 'unauthenticated' | 'ready' | 'error'>('loading')
  const [data, setData]   = useState<DashData | null>(null)
  const [subWarn, setSubWarn] = useState('')

  useEffect(() => {
    const unsub = getFirebaseAuth().onAuthStateChanged(async (user) => {
      if (!user) { setState('unauthenticated'); return }

      try {
        const idToken = await user.getIdToken()
        const res = await fetch('/api/business/dashboard', {
          headers: { Authorization: `Bearer ${idToken}` },
          cache: 'no-store',
        })
        if (!res.ok) {
          if (res.status === 403 || res.status === 401) { setState('unauthenticated'); return }
          setState('error'); return
        }
        const json = await res.json() as DashData & { subscription?: Subscription | null }
        setData(json)

        // Warn if subscription is not active
        const sub = json.subscription
        if (!sub || (sub.status !== 'active' && sub.status !== 'trialing')) {
          setSubWarn('Your subscription is inactive. Renew to keep your listing live.')
        } else if (sub.status === 'trialing' && sub.trial_ends_at) {
          const daysLeft = Math.ceil((new Date(sub.trial_ends_at).getTime() - Date.now()) / 86400000)
          if (daysLeft <= 3) setSubWarn(`Trial ends in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`)
        }

        setState('ready')
      } catch {
        setState('error')
      }
    })
    return () => unsub()
  }, [])

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 24, color: C.text3, fontSize: 14 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        Loading your dashboard…
      </div>
    )
  }

  // ── Unauthenticated ───────────────────────────────────────────────────────────
  if (state === 'unauthenticated') {
    return (
      <div style={{ background: C.white, borderRadius: 12, padding: '28px 24px', border: `1.5px solid ${C.border}`, textAlign: 'center' }}>
        <p style={{ color: C.text2, marginBottom: 16, fontSize: 14 }}>Sign in to see your orders, bookings, and earnings.</p>
        <Link href="/register?role=business" className="btn btn-primary">Sign in / Register</Link>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div style={{ background: '#fff5f5', borderRadius: 12, padding: '20px 24px', border: '1.5px solid #fca5a5', fontSize: 13, color: '#dc2626' }}>
        Could not load dashboard data. <button onClick={() => window.location.reload()} style={{ color: C.teal, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, padding: 0 }}>Retry</button>
      </div>
    )
  }

  const kpis = data?.kpis ?? { pending: 0, accepted: 0, completed: 0, cancelled: 0, total: 0 }
  const recentJobs = data?.recentJobs ?? []

  return (
    <>
      {/* ── Subscription warning ──────────────────────────────────────────────── */}
      {subWarn && (
        <div style={{ marginBottom: 20, background: '#fffbeb', border: '1.5px solid #fbbf24', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontSize: 13, color: '#92400e', flex: 1 }}>{subWarn}</span>
          <Link href="/dashboard/business/subscription" style={{ fontSize: 12, fontWeight: 700, color: C.teal, textDecoration: 'none' }}>Manage &rarr;</Link>
        </div>
      )}

      {/* ── KPI Grid ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }} className="biz-kpi-grid">
        {[
          { label: 'Pending',   value: kpis.pending,   color: '#d97706' },
          { label: 'Completed', value: kpis.completed, color: '#16a34a' },
          { label: 'This month', value: kpis.total,    color: C.teal    },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: C.white, borderRadius: 12, padding: '16px 18px',
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 1px 4px rgba(18,52,59,0.05)',
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 5 }}>jobs</div>
          </div>
        ))}
      </div>
      <style>{`@media(max-width:540px){.biz-kpi-grid{grid-template-columns:1fr 1fr!important}}`}</style>

      {/* ── Recent jobs ──────────────────────────────────────────────────────── */}
      <div style={{
        background: C.white, borderRadius: 12, overflow: 'hidden',
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 1px 4px rgba(18,52,59,0.05)',
        marginBottom: 24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.teal }}>Recent orders &amp; bookings</div>
          <Link href="/dashboard/business/services" style={{ fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600 }}>View all</Link>
        </div>

        {recentJobs.length === 0 ? (
          <div style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ color: C.text3, marginBottom: 12 }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <p style={{ fontSize: 13, color: C.text2, margin: 0 }}>No orders yet. Share your public profile link to start getting customers.</p>
            <Link href="/dashboard/business/profile" style={{ display: 'inline-block', marginTop: 12, fontSize: 13, fontWeight: 600, color: C.teal }}>Complete profile &rarr;</Link>
          </div>
        ) : recentJobs.map((job, i) => {
          const sc = statusColor(job.status)
          const fare = job.fare_estimate ? `₹${job.fare_estimate}` : '—'
          return (
            <div key={job.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              background: C.white,
              borderBottom: i < recentJobs.length - 1 ? `1px solid ${C.border}` : 'none',
            }}>
              {/* Type pill */}
              <span style={{
                flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                background: C.goldBg, color: C.goldDim, border: `1px solid ${C.goldB}`,
                textTransform: 'uppercase', letterSpacing: 0.3,
              }}>{jobTypeLabel(job.job_type)}</span>

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {job.service_type ?? 'Service request'}
                </div>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>
                  #{job.id.slice(0, 8).toUpperCase()} · {relativeTime(job.created_at)}
                </div>
              </div>

              {/* Fare + status */}
              <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 90 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.teal }}>{fare}</div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                  background: sc + '18', color: sc, border: `1px solid ${sc}44`,
                }}>{statusLabel(job.status)}</span>
              </div>
            </div>
          )
        })}

        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 11, color: C.text3 }}>
            Platform takes 0% commission. All payments go directly from customer to you.
          </span>
        </div>
      </div>

      {/* ── Quick action grid ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        {[
          { href: '/dashboard/business/profile',      label: 'Edit profile',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
          { href: '/dashboard/business/services',     label: 'Manage orders',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> },
          { href: '/dashboard/business/subscription', label: 'Subscription',    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
          { href: '/dashboard/business/analytics',    label: 'Analytics',       icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: C.white, borderRadius: 12, padding: '16px 18px',
            border: `1.5px solid ${C.border}`, textDecoration: 'none',
            color: C.teal, fontWeight: 600, fontSize: 14,
            boxShadow: '0 1px 4px rgba(18,52,59,0.04)',
          }}>
            <span style={{ color: C.teal, flexShrink: 0 }}>{icon}</span>
            {label}
          </Link>
        ))}
      </div>
    </>
  )
}
