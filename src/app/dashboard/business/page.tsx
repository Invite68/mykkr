/**
 * Business Portal — Home
 * White content area. Teal (#12343b) × Gold (#e1b382) accent palette.
 * Cards use white bg with teal/gold borders and text — professional, light theme.
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
  teal:      '#12343b',
  tealMid:   '#2d545e',
  tealLight: '#3d6b78',
  gold:      '#e1b382',
  goldDim:   '#c89666',
  goldBg:    'rgba(225,179,130,0.10)',
  goldB:     'rgba(225,179,130,0.25)',
  white:     '#ffffff',
  bg:        '#f8fafc',
  border:    '#e2e8f0',
  borderDk:  '#cbd5e1',
  text1:     '#0f172a',
  text2:     '#475569',
  text3:     '#94a3b8',
}

// ── Sample data ───────────────────────────────────────────────────────────────
const PENDING = [
  { id: 'a', label: '3 bookings waiting for your confirmation', href: '/dashboard/business/services?tab=pending',  urgent: true  },
  { id: 'b', label: '1 customer message unread',                href: '/dashboard/business/services?tab=messages', urgent: false },
  { id: 'c', label: '2 orders ready — assign driver or confirm pickup', href: '/dashboard/business/services?tab=orders', urgent: false },
]

// 3 KPIs only — NO commission card (platform takes ₹0, no need to show)
const KPIS = [
  { label: 'Orders this month', value: '42',    note: '+11% vs Sep', up: true  },
  { label: 'Pending actions',   value: '3',     note: 'need response', up: false },
  { label: 'Profile views',     value: '1,284', note: '+18% vs Sep', up: true  },
]

const RECENT = [
  { id: '#KKR-7Q2M', desc: 'Groceries (3 items)',           type: 'Order',   status: 'Pending',          sc: '#d97706', amount: '₹380',   time: '10 min ago' },
  { id: '#KKR-3HXP', desc: 'House painting — 26 Oct 10am', type: 'Booking', status: 'Confirmed',         sc: '#0d9488', amount: '₹4,500', time: '2 hr ago'   },
  { id: '#KKR-9LKA', desc: 'Stationery bundle',             type: 'Order',   status: 'Ready for pickup',  sc: '#7c3aed', amount: '₹210',   time: '3 hr ago'   },
  { id: '#KKR-2BNQ', desc: 'Vegetables (daily box)',        type: 'Order',   status: 'Delivered',         sc: '#16a34a', amount: '₹145',   time: 'Yesterday'  },
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
      {/* ── PROFILE HERO — mirrors public view ────────────────────────────────── */}
      <div style={{
        borderRadius: 16, overflow: 'hidden', marginBottom: 24,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 2px 12px rgba(18,52,59,0.06)',
      }}>
        {/* Cover photo */}
        <div style={{
          height: 140,
          background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealMid} 60%, ${C.tealLight} 100%)`,
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.05,
            backgroundImage: 'repeating-linear-gradient(60deg, #fff 0, #fff 1px, transparent 0, transparent 10px)',
          }} />
          {/* Live badge top-right */}
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

        {/* Info strip — white bg */}
        <div style={{ background: C.white, padding: '0 24px 20px' }}>
          {/* Logo pulled up — circular, left-aligned */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginTop: -32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: C.teal, border: `3px solid ${C.white}`,
              boxShadow: '0 0 0 2px rgba(18,52,59,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 900, color: C.gold,
            }}>SK</div>
            <div style={{ paddingBottom: 4, minWidth: 0, flex: 1 }}>
              <h1 style={{ fontWeight: 900, fontSize: 19, color: C.text1, margin: 0, lineHeight: 1.2 }}>
                Sharma Kirana Store
              </h1>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 3, display: 'flex', flexWrap: 'wrap', gap: '2px 10px' }}>
                <span>Groceries</span>
                <span>·</span>
                <span>Thanesar, Kurukshetra</span>
                <span>·</span>
                <span style={{ color: C.gold, fontWeight: 700 }}>4.7 ★ (38)</span>
              </div>
            </div>
          </div>

          {/* Action row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            <Link href="/dashboard/business/profile" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, textDecoration: 'none',
              background: C.teal, color: C.gold,
              fontSize: 13, fontWeight: 700,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit profile
            </Link>
            <Link href="/business/sharma-kirana-store" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '9px 16px', borderRadius: 8, textDecoration: 'none',
              border: `1.5px solid ${C.teal}`, color: C.teal,
              fontSize: 13, fontWeight: 600,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View public page
            </Link>
          </div>
        </div>
      </div>

      {/* ── NEEDS ATTENTION ───────────────────────────────────────────────────── */}
      <div style={{
        marginBottom: 24, borderRadius: 12, overflow: 'hidden',
        border: '1.5px solid #fca5a5',
        background: '#fff5f5',
      }}>
        <div style={{
          padding: '11px 16px', borderBottom: '1px solid #fecaca',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#dc2626' }}>Needs your attention ({PENDING.length})</span>
        </div>
        {PENDING.map((item, i) => (
          <Link key={item.id} href={item.href} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', textDecoration: 'none', background: C.white,
            borderBottom: i < PENDING.length - 1 ? '1px solid #fee2e2' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {item.urgent
                ? <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                : <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.border, flexShrink: 0 }} />
              }
              <span style={{ fontSize: 13, color: C.text1 }}>{item.label}</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
          </Link>
        ))}
      </div>

      {/* ── KPI GRID — 3-col symmetrical ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}
           className="kpi-grid-home">
        {KPIS.map(({ label, value, note, up }) => (
          <div key={label} style={{
            background: C.white, borderRadius: 12, padding: '16px 18px',
            border: `1.5px solid ${C.border}`,
            boxShadow: '0 1px 4px rgba(18,52,59,0.05)',
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: C.teal, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={up ? '#16a34a' : '#dc2626'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {up ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>}
              </svg>
              <span style={{ fontSize: 11, color: up ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{note}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media(max-width:560px){.kpi-grid-home{grid-template-columns:1fr 1fr!important}}
        @media(min-width:561px){.kpi-grid-home{grid-template-columns:repeat(3,1fr)!important}}
      `}</style>

      {/* ── SHOP HOURS ────────────────────────────────────────────────────────── */}
      <div style={{
        background: C.white, borderRadius: 12, padding: '18px 20px', marginBottom: 24,
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 1px 4px rgba(18,52,59,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.teal }}>Business hours</div>
          <Link href="/dashboard/business/profile?section=hours" style={{
            fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${C.border}`,
            padding: '5px 10px', borderRadius: 6,
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
                background: isToday ? (h.open ? C.goldBg : '#fff5f5') : C.bg,
                border: `1.5px solid ${isToday ? (h.open ? C.gold : '#fca5a5') : C.border}`,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.3,
                  color: isToday ? (h.open ? C.goldDim : '#dc2626') : C.text3,
                  marginBottom: 4,
                }}>{day}</div>
                {h.open ? (
                  <div style={{ fontSize: 9, color: isToday ? C.goldDim : C.text3, lineHeight: 1.5 }}>
                    {h.start}<br/>–<br/>{h.end}
                  </div>
                ) : (
                  <div style={{ fontSize: 9, color: isToday ? '#dc2626' : C.text3, fontStyle: 'italic' }}>Closed</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── RECENT ORDERS ─────────────────────────────────────────────────────── */}
      <div style={{
        background: C.white, borderRadius: 12, overflow: 'hidden',
        border: `1.5px solid ${C.border}`,
        boxShadow: '0 1px 4px rgba(18,52,59,0.05)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.teal }}>Recent orders &amp; bookings</div>
          <Link href="/dashboard/business/services" style={{ fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600 }}>View all</Link>
        </div>
        {RECENT.map((job, i) => (
          <Link key={job.id} href={`/dashboard/business/services?job=${job.id}`} style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
            textDecoration: 'none', background: C.white,
            borderBottom: i < RECENT.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            {/* Type pill */}
            <span style={{
              flexShrink: 0, fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
              background: job.type === 'Booking' ? C.goldBg : 'rgba(18,52,59,0.07)',
              color: job.type === 'Booking' ? C.goldDim : C.tealMid,
              border: `1px solid ${job.type === 'Booking' ? C.goldB : 'rgba(18,52,59,0.15)'}`,
              textTransform: 'uppercase' as const, letterSpacing: 0.3,
            }}>{job.type}</span>

            {/* Description */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: C.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.desc}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{job.id} · {job.time}</div>
            </div>

            {/* Amount + status */}
            <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 90 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.teal }}>{job.amount}</div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                background: job.sc + '18', color: job.sc, border: `1px solid ${job.sc}44`,
              }}>{job.status}</span>
            </div>
          </Link>
        ))}
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 11, color: C.text3 }}>Sample data — connects to live orders after sign-in. Platform takes 0% commission on all transactions.</span>
        </div>
      </div>
    </>
  )
}
