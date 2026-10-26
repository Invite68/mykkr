/**
 * Business Portal — Home
 * Brand: teal (#12343b) × gold (#e1b382) × white
 */

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard — My KKR Business Portal',
  robots: 'noindex,nofollow',
}
export const dynamic = 'force-dynamic'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  panel:    '#132b32',
  panelB:   '#1e3d47',
  card:     '#0e2028',
  gold:     '#e1b382',
  goldBg:   'rgba(225,179,130,0.10)',
  goldB:    'rgba(225,179,130,0.20)',
  text1:    '#f0f4f5',
  text2:    '#8fb3bc',
  text3:    '#4a7a88',
  teal:     '#12343b',
  tealMid:  '#2d545e',
}

// ── Sample data ───────────────────────────────────────────────────────────────
const PENDING = [
  { id: 'a', label: '3 bookings waiting for your confirmation', href: '/dashboard/business/services?tab=pending',  urgent: true  },
  { id: 'b', label: '1 customer message unread',                href: '/dashboard/business/services?tab=messages', urgent: false },
  { id: 'c', label: '2 orders ready — assign driver or confirm pickup', href: '/dashboard/business/services?tab=orders', urgent: false },
]

const KPIS = [
  { label: 'Orders this month', value: '42',    note: '+11% vs Sep',         up: true  },
  { label: 'Pending actions',   value: '3',     note: 'need response',        up: false },
  { label: 'Profile views',     value: '1,284', note: '+18% vs Sep',         up: true  },
  { label: 'My KKR commission', value: '₹0',    note: 'platform takes nothing', up: true },
]

const RECENT = [
  { id: '#KKR-7Q2M', desc: 'Groceries (3 items)',           type: 'Order',   status: 'Pending',         sc: '#d97706', amount: '₹380',   time: '10 min ago' },
  { id: '#KKR-3HXP', desc: 'House painting — 26 Oct 10am', type: 'Booking', status: 'Confirmed',        sc: '#0d9488', amount: '₹4,500', time: '2 hr ago'   },
  { id: '#KKR-9LKA', desc: 'Stationery bundle',             type: 'Order',   status: 'Ready for pickup', sc: '#7c3aed', amount: '₹210',   time: '3 hr ago'   },
  { id: '#KKR-2BNQ', desc: 'Vegetables (daily box)',        type: 'Order',   status: 'Delivered',        sc: '#16a34a', amount: '₹145',   time: 'Yesterday'  },
]

const HOURS: Record<string, { open: boolean; start: string; end: string }> = {
  Mon: { open: true,  start: '9 am',  end: '6 pm'  },
  Tue: { open: true,  start: '9 am',  end: '6 pm'  },
  Wed: { open: true,  start: '9 am',  end: '6 pm'  },
  Thu: { open: true,  start: '9 am',  end: '6 pm'  },
  Fri: { open: true,  start: '9 am',  end: '5 pm'  },
  Sat: { open: true,  start: '10 am', end: '2 pm'  },
  Sun: { open: false, start: '',      end: ''       },
}

function todayAbbr() {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BusinessHome() {
  const today = todayAbbr()

  return (
    <>
      {/* ── PROFILE HERO ──────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, border: `1px solid ${C.panelB}` }}>
        {/* Cover photo */}
        <div style={{
          height: 120,
          background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealMid} 60%, #3d6b78 100%)`,
          position: 'relative',
        }}>
          {/* Subtle diagonal texture */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.06,
            backgroundImage: 'repeating-linear-gradient(60deg, #fff 0, #fff 1px, transparent 0, transparent 10px)',
          }} />
        </div>

        {/* Info strip */}
        <div style={{ background: C.panel, padding: '0 20px 20px' }}>
          {/* Logo pulled up */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 12, flexShrink: 0,
              background: C.teal, border: `3px solid ${C.panel}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900, color: C.gold,
            }}>SK</div>
            <div style={{ paddingBottom: 2, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: C.text1, lineHeight: 1.2 }}>Sharma Kirana Store</div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
                <span>Thanesar, Kurukshetra</span>
                <span style={{ color: C.gold }}>4.7 · 38 reviews</span>
                <span>Groceries &amp; Daily Essentials</span>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <Link href="/dashboard/business/profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
              background: C.gold, color: C.teal,
              fontSize: 13, fontWeight: 700,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit profile
            </Link>
            <Link href="/business/sharma-kirana-store" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
              border: `1.5px solid ${C.panelB}`, color: C.text2,
              fontSize: 13, fontWeight: 600,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View public page
            </Link>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 8,
              background: 'rgba(20,160,80,0.10)', border: '1px solid rgba(20,160,80,0.22)',
              fontSize: 12, fontWeight: 600, color: '#4ade80',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Live — profile is public
            </span>
          </div>
        </div>
      </div>

      {/* ── NEEDS ATTENTION ───────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 24, borderRadius: 12, overflow: 'hidden',
        border: '1.5px solid rgba(220,38,38,0.25)',
        background: 'rgba(220,38,38,0.05)',
      }}>
        <div style={{
          padding: '11px 16px', borderBottom: '1px solid rgba(220,38,38,0.15)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#fca5a5' }}>Needs your attention ({PENDING.length})</span>
        </div>
        {PENDING.map((item, i) => (
          <Link key={item.id} href={item.href} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', textDecoration: 'none',
            borderBottom: i < PENDING.length - 1 ? '1px solid rgba(220,38,38,0.10)' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.urgent
                ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0, display: 'inline-block' }} />
                : <span style={{ width: 6, height: 6, flexShrink: 0, display: 'inline-block' }} />
              }
              <span style={{ fontSize: 13, color: '#e2e8f0' }}>{item.label}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        ))}
      </div>

      {/* ── KPI GRID — 2×2 on mobile, 4-col on desktop ────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}
           className="kpi-grid-4">
        {KPIS.map(({ label, value, note, up }) => (
          <div key={label} style={{
            background: C.panel, borderRadius: 12, padding: '16px 18px',
            border: `1px solid ${C.panelB}`,
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text1, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={up ? '#22c55e' : '#f87171'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {up ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>}
              </svg>
              <span style={{ fontSize: 11, color: up ? '#4ade80' : '#f87171', fontWeight: 600 }}>{note}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`@media(min-width:600px){.kpi-grid-4{grid-template-columns:repeat(4,1fr)!important}}`}</style>

      {/* ── SHOP HOURS ────────────────────────────────────────────────────────── */}
      <div style={{ background: C.panel, borderRadius: 12, padding: '18px 20px', marginBottom: 24, border: `1px solid ${C.panelB}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Business hours</div>
          <Link href="/dashboard/business/profile?section=hours" style={{
            fontSize: 12, color: C.gold, textDecoration: 'none', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit hours
          </Link>
        </div>

        {/* 7 day pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
          {Object.entries(HOURS).map(([day, h]) => {
            const isToday = day === today
            return (
              <div key={day} style={{
                borderRadius: 8, padding: '8px 4px', textAlign: 'center',
                background: isToday ? (h.open ? 'rgba(225,179,130,0.12)' : 'rgba(220,38,38,0.08)') : C.card,
                border: `1.5px solid ${isToday ? (h.open ? C.goldB : 'rgba(220,38,38,0.3)') : C.panelB}`,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
                  color: isToday ? (h.open ? C.gold : '#f87171') : C.text3,
                  marginBottom: 4,
                }}>{day}</div>
                {h.open ? (
                  <div style={{ fontSize: 9, color: isToday ? '#c89666' : C.text3, lineHeight: 1.5, letterSpacing: 0 }}>
                    {h.start}<br/>–<br/>{h.end}
                  </div>
                ) : (
                  <div style={{ fontSize: 9, color: isToday ? '#f87171' : C.text3, fontStyle: 'italic' }}>Closed</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RECENT ORDERS ─────────────────────────────────────────────────────── */}
      <div style={{ background: C.panel, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.panelB}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.panelB}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Recent orders &amp; bookings</div>
          <Link href="/dashboard/business/services" style={{ fontSize: 12, color: C.gold, textDecoration: 'none', fontWeight: 600 }}>View all</Link>
        </div>
        {RECENT.map((job, i) => (
          <Link key={job.id} href={`/dashboard/business/services?job=${job.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            textDecoration: 'none',
            borderBottom: i < RECENT.length - 1 ? `1px solid ${C.panelB}` : 'none',
            background: 'transparent',
          }}>
            {/* Type pill */}
            <span style={{
              flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
              background: job.type === 'Booking' ? C.goldBg : 'rgba(13,148,136,0.12)',
              color: job.type === 'Booking' ? C.gold : '#2dd4bf',
              border: `1px solid ${job.type === 'Booking' ? C.goldB : 'rgba(13,148,136,0.25)'}`,
              textTransform: 'uppercase', letterSpacing: 0.3,
            }}>{job.type}</span>

            {/* Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.desc}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{job.id} · {job.time}</div>
            </div>

            {/* Amount + status */}
            <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 80 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.text1 }}>{job.amount}</div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: job.sc + '18', color: job.sc, border: `1px solid ${job.sc}44`,
              }}>{job.status}</span>
            </div>
          </Link>
        ))}
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.panelB}` }}>
          <span style={{ fontSize: 11, color: C.text3 }}>Sample data — connects to live orders after sign-in is wired. Platform takes 0% commission.</span>
        </div>
      </div>
    </>
  )
}
