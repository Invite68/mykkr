/**
 * Business Portal — Home
 * Profile hero + quick status + pending actions + recent activity
 */

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Business Dashboard — My KKR',
  robots: 'noindex,nofollow',
}

export const dynamic = 'force-dynamic'

// ── Sample data (replaced by real DB once auth is connected) ─────────────────

const PENDING = [
  { id: 'PKT-1', type: 'booking', label: '3 bookings waiting for your confirmation', href: '/dashboard/business/services?tab=pending', urgent: true  },
  { id: 'PKT-2', type: 'message', label: '1 customer message unread',                href: '/dashboard/business/services?tab=messages', urgent: false },
  { id: 'PKT-3', type: 'order',   label: '2 orders ready — assign driver or confirm pickup', href: '/dashboard/business/services?tab=orders', urgent: false },
]

const RECENT_JOBS = [
  { id: '#KKR-7Q2M', desc: 'Groceries (3 items)',            type: 'Order',   status: 'Pending',          statusColor: '#6b7280', amount: '₹380',   time: '10 min ago'  },
  { id: '#KKR-3HXP', desc: 'House painting — 26 Oct 10am',  type: 'Booking', status: 'Confirmed',         statusColor: '#7c3aed', amount: '₹4,500', time: '2 hr ago'    },
  { id: '#KKR-9LKA', desc: 'Stationery bundle',              type: 'Order',   status: 'Ready for pickup',  statusColor: '#d97706', amount: '₹210',   time: '3 hr ago'    },
  { id: '#KKR-2BNQ', desc: 'Vegetables (daily box)',         type: 'Order',   status: 'Delivered',         statusColor: '#16a34a', amount: '₹145',   time: 'Yesterday'   },
]

const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const HOURS: Record<string, { open: boolean; start: string; end: string }> = {
  Mon: { open: true,  start: '09:00', end: '18:00' },
  Tue: { open: true,  start: '09:00', end: '18:00' },
  Wed: { open: true,  start: '09:00', end: '18:00' },
  Thu: { open: true,  start: '09:00', end: '18:00' },
  Fri: { open: true,  start: '09:00', end: '17:00' },
  Sat: { open: true,  start: '10:00', end: '14:00' },
  Sun: { open: false, start: '',      end: ''       },
}

function getTodayIdx() {
  const d = new Date().getDay() // 0=Sun
  return d === 0 ? 6 : d - 1   // Mon=0 … Sun=6
}

// ── Components ────────────────────────────────────────────────────────────────

function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span style={{
      background: color + '18', color, fontWeight: 700,
      fontSize: 11, padding: '3px 9px', borderRadius: 99,
      border: `1px solid ${color}44`, whiteSpace: 'nowrap',
    }}>{status}</span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BusinessHome() {
  const todayIdx = getTodayIdx()

  return (
    <>
      {/* ── PROFILE HERO ──────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20, position: 'relative' }}>
        {/* Cover */}
        <div style={{
          height: 140,
          background: 'linear-gradient(135deg, #12343b 0%, #0f766e 50%, #0e7490 100%)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.1,
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)',
            backgroundSize: '12px 12px',
          }} />
        </div>

        {/* Logo + info */}
        <div style={{ background: '#1a2535', padding: '0 20px 20px', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, marginTop: -32 }}>
            {/* Logo */}
            <div style={{
              width: 64, height: 64, borderRadius: 14, flexShrink: 0,
              background: '#12343b', border: '3px solid #1a2535',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 900, color: '#34d399',
            }}>SK</div>

            {/* Name + meta */}
            <div style={{ flex: 1, paddingBottom: 4, minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#f1f5f9', lineHeight: 1.1 }}>Sharma Kirana Store</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Thanesar, Kurukshetra
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  4.7 · 38 reviews
                </span>
                <span>Groceries &amp; Daily Essentials</span>
              </div>
            </div>
          </div>

          {/* Quick profile actions */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Link href="/dashboard/business/profile" className="btn btn-primary" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, background: '#f97316', border: 'none' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit profile
            </Link>
            <Link href="/business/sharma-kirana-store" className="btn btn-outline" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 5, borderColor: '#334155', color: '#94a3b8' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View public page
            </Link>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#16a34a18', color: '#4ade80', border: '1px solid #16a34a30',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Live — profile is public
            </span>
          </div>
        </div>
      </div>

      {/* ── NEEDS ATTENTION ────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 20, borderRadius: 12, overflow: 'hidden',
        border: '1.5px solid #dc262630',
        background: '#1a1010',
      }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #dc262620', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fca5a5' }}>Needs your attention ({PENDING.length})</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PENDING.map((item, i) => (
            <Link key={item.id} href={item.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 16px', textDecoration: 'none',
              borderBottom: i < PENDING.length - 1 ? '1px solid #1e2030' : 'none',
              background: item.urgent ? '#dc262608' : 'transparent',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {item.urgent && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#dc2626', display: 'inline-block', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 13, color: '#cbd5e1' }}>{item.label}</span>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPI STRIP ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Orders this month', value: '42',    sub: 'sample data'            },
          { label: 'Pending actions',   value: '3',     sub: 'need your response'      },
          { label: 'Profile views',     value: '1,284', sub: 'this month'              },
          { label: 'My KKR commission', value: '₹0',    sub: 'platform takes nothing'  },
        ].map(({ label, value, sub }) => (
          <div key={label} style={{
            background: '#1a2535', borderRadius: 10, padding: '14px 12px',
            border: '1.5px solid #1e2d3a',
          }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* ── SHOP STATUS + HOURS ────────────────────────────────────────────── */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e2d3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Shop status &amp; hours</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: '#16a34a18', color: '#4ade80', border: '1px solid #16a34a30',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Open now
            </span>
            <Link href="/dashboard/business/profile?section=hours" style={{
              display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
              padding: '5px 10px', borderRadius: 8, textDecoration: 'none',
              border: '1px solid #334155', color: '#94a3b8', fontWeight: 600,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit hours
            </Link>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DAYS_SHORT.map((day, idx) => {
            const h = HOURS[day]
            const isToday = idx === todayIdx
            return (
              <div key={day} style={{
                padding: '8px 4px', borderRadius: 8, textAlign: 'center',
                background: isToday ? (h.open ? '#12343b' : '#1f2937') : 'transparent',
                border: `1.5px solid ${isToday ? (h.open ? '#0d9488' : '#374151') : '#1e2d3a'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3,
                  color: isToday ? '#fff' : (h.open ? '#94a3b8' : '#374151') }}>
                  {day}
                </div>
                {h.open ? (
                  <>
                    <div style={{ fontSize: 10, color: isToday ? '#6ee7b7' : '#4b6280' }}>{h.start}</div>
                    <div style={{ fontSize: 9,  color: isToday ? '#34d399' : '#2d4060' }}>–</div>
                    <div style={{ fontSize: 10, color: isToday ? '#6ee7b7' : '#4b6280' }}>{h.end}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 10, color: '#374151' }}>Closed</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RECENT JOBS / ORDERS ───────────────────────────────────────────── */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e2d3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Recent orders &amp; bookings</div>
          <Link href="/dashboard/business/services" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>View all</Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {RECENT_JOBS.map((job, i) => (
            <Link key={job.id} href={`/dashboard/business/services?job=${job.id}`} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
              textDecoration: 'none', background: 'transparent',
              borderBottom: i < RECENT_JOBS.length - 1 ? '1px solid #1e2d3a' : 'none',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.desc}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{job.id} · {job.type} · {job.time}</div>
              </div>
              <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{job.amount}</div>
                <StatusBadge status={job.status} color={job.statusColor} />
              </div>
            </Link>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#475569' }}>
          Sample data — connects to live orders after sign-in is wired.
          Platform takes 0% commission — customer pays you directly.
        </div>
      </div>

      {/* ── QUICK ACTIONS ──────────────────────────────────────────────────── */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, border: '1.5px solid #1e2d3a' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>Quick actions</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
          {[
            { label: 'Edit profile',        href: '/dashboard/business/profile',           icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
            { label: 'Add listing',         href: '/dashboard/business/profile?section=listings', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
            { label: 'Job board',           href: '/dashboard/business/services',          icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
            { label: 'Analytics',           href: '/dashboard/business/analytics',         icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
            { label: 'Subscription',        href: '/dashboard/business/subscription',      icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            { label: 'Public shop page',    href: '/shop/sharma-kirana-store',             icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
          ].map((a) => (
            <Link key={a.label} href={a.href} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              border: '1.5px solid #1e3a50', color: '#94a3b8', fontSize: 13, fontWeight: 600,
              background: '#111827',
            }}>
              <span style={{ flexShrink: 0, color: '#f97316' }}>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
