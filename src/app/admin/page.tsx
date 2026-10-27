'use client'
import Link from 'next/link'

const C = {
  teal: '#12343b', gold: '#e1b382', border: '#e2e8f0',
  muted: '#64748b', green: '#0f766e', red: '#dc2626',
  amber: '#b45309', bg: '#f0f4f8', surface: '#fff',
  blue: '#0369a1', purple: '#7c3aed',
}

/* ── KPI Tiles ──────────────────────────────────────────────────── */
const KPI = [
  {
    label: 'Active Businesses', value: '31', delta: '+4 this week',
    sub: '4 pending approval', color: C.teal, bg: 'rgba(18,52,59,.06)',
    href: '/admin/businesses',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    label: 'Active Customers', value: '124', delta: '+12 this week',
    sub: '22 on free trial', color: C.blue, bg: 'rgba(3,105,161,.06)',
    href: '/admin/customers',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    label: 'Active Drivers', value: '9', delta: '+2 this week',
    sub: '3 awaiting approval', color: C.purple, bg: 'rgba(124,58,237,.06)',
    href: '/admin/drivers',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    label: 'Jobs Today', value: '14', delta: '3 in progress',
    sub: '11 completed', color: C.amber, bg: 'rgba(180,83,9,.06)',
    href: '/admin/drivers',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  },
  {
    label: 'Monthly Revenue', value: '₹3,091', delta: '+7.9% vs last month',
    sub: 'Subscriptions only', color: C.green, bg: 'rgba(15,118,110,.06)',
    href: '/admin/revenue',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  },
  {
    label: 'Total Subscribers', value: '155', delta: '31 biz + 124 customers',
    sub: 'MRR: ₹3,091', color: '#0f766e', bg: 'rgba(15,118,110,.06)',
    href: '/admin/subscriptions',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
  {
    label: 'Flagged Content', value: '2', delta: 'Needs immediate review',
    sub: 'Auto-hidden', color: C.red, bg: 'rgba(220,38,38,.06)',
    href: '/admin/businesses?status=flagged',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    label: 'Categories', value: '26', delta: 'Across 7 groups',
    sub: 'All active', color: C.muted, bg: 'rgba(100,116,139,.06)',
    href: '/admin/categories',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
]

/* ── Quick Action Tiles ─────────────────────────────────────────── */
const ACTIONS = [
  {
    href: '/admin/businesses', label: 'Businesses',
    desc: 'KYC, approvals, suspend, promote',
    color: C.teal, lightBg: 'rgba(18,52,59,.06)',
    badge: '4 pending',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    href: '/admin/customers', label: 'Customers',
    desc: 'Subscriptions, bans, analytics',
    color: C.blue, lightBg: 'rgba(3,105,161,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/admin/drivers', label: 'Drivers',
    desc: 'Approve, track jobs, vehicle KYC',
    color: C.purple, lightBg: 'rgba(124,58,237,.06)',
    badge: '3 awaiting',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  },
  {
    href: '/admin/subscriptions', label: 'Subscriptions',
    desc: 'Plans, pricing, discounts',
    color: C.green, lightBg: 'rgba(15,118,110,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  },
  {
    href: '/admin/revenue', label: 'Revenue',
    desc: 'MRR, charts, payment log',
    color: '#0369a1', lightBg: 'rgba(3,105,161,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  },
  {
    href: '/admin/fares', label: 'Fares & Pricing',
    desc: 'Vehicle rates, fixed routes',
    color: '#0e7490', lightBg: 'rgba(14,116,144,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    href: '/admin/media', label: 'Media & Ads',
    desc: 'Banners, videos, promotions',
    color: C.purple, lightBg: 'rgba(124,58,237,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  },
  {
    href: '/admin/categories', label: 'Categories',
    desc: 'Add, rename, toggle visibility',
    color: C.amber, lightBg: 'rgba(180,83,9,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/admin/site', label: 'Site Settings',
    desc: 'Branding, legal, maintenance',
    color: '#475569', lightBg: 'rgba(71,85,105,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  },
  {
    href: '/admin/activity', label: 'Activity Feed',
    desc: 'Real-time platform events',
    color: C.teal, lightBg: 'rgba(18,52,59,.06)',
    badge: 'Live',
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
  {
    href: '/admin/audit', label: 'Audit Log',
    desc: 'Change history & rollback',
    color: '#475569', lightBg: 'rgba(71,85,105,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  },
  {
    href: '/admin/settings', label: 'Platform Settings',
    desc: 'Maintenance, security, 2FA',
    color: C.red, lightBg: 'rgba(220,38,38,.06)',
    badge: null,
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  },
]

/* ── Recent Activity ────────────────────────────────────────────── */
const ACTIVITY = [
  { time: '2m',  text: 'New business registered: KKR Laundry Hub', type: 'Business', color: C.teal },
  { time: '8m',  text: 'Subscription paid ₹99: Sharma Kirana Store', type: 'Payment', color: C.green },
  { time: '14m', text: 'KYC submitted: Sunrise Hotel KKR', type: 'KYC', color: C.amber },
  { time: '22m', text: 'New driver registered: Suresh Yadav (car)', type: 'Driver', color: C.purple },
  { time: '1h',  text: 'Customer banned: Mohan Lal — fraud', type: 'Action', color: C.red },
  { time: '2h',  text: 'Ad #3 updated on home banner', type: 'Media', color: C.muted },
  { time: '3h',  text: 'Delivery #D-2047 completed by Ramesh K.', type: 'Delivery', color: C.blue },
]

export default function AdminOverview() {
  return (
    <div>
      {/* ── Section header ───────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.teal, letterSpacing: -.4 }}>Platform Overview</h1>
            <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 13 }}>My KKR — Kurukshetra&#39;s local marketplace platform</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 14px', fontSize: 12, color: C.muted, fontWeight: 600 }}>
              Oct 27, 2026
            </div>
            <div style={{ background: 'rgba(15,118,110,.1)', border: '1px solid rgba(15,118,110,.2)', borderRadius: 8, padding: '6px 14px', fontSize: 12, color: C.green, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
              Platform Live
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: 12, marginBottom: 28,
      }}>
        {KPI.map(k => (
          <Link key={k.label} href={k.href} style={{
            textDecoration: 'none', background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 14, padding: '16px 18px',
            display: 'block', position: 'relative', overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,.05)',
            transition: 'box-shadow .15s, transform .15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,.05)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
          >
            {/* Accent bar top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.color, borderRadius: '14px 14px 0 0', opacity: .7 }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .7 }}>{k.label}</div>
              <div style={{ color: k.color, opacity: .7 }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: k.color, lineHeight: 1, letterSpacing: -1 }}>{k.value}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>{k.sub}</div>
            <div style={{ fontSize: 10.5, color: k.color, marginTop: 3, fontWeight: 600 }}>{k.delta}</div>
          </Link>
        ))}
      </div>

      {/* ── Bottom two-column layout ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 280px', gap: 20, alignItems: 'start' }}>

        {/* Quick Access Grid */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: .8, marginBottom: 14 }}>Quick Access</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
            {ACTIONS.map(a => (
              <Link key={a.href} href={a.href} style={{
                textDecoration: 'none', background: C.surface,
                border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,.04)',
                transition: 'box-shadow .15s, transform .15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(0,0,0,.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 3px rgba(0,0,0,.04)'; (e.currentTarget as HTMLElement).style.transform = 'none' }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: a.lightBg, border: `1px solid ${a.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: a.color, flexShrink: 0,
                }}>
                  {a.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#1e293b', marginBottom: 3 }}>{a.label}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.4 }}>{a.desc}</div>
                </div>

                {/* Badge */}
                {a.badge && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: a.color, color: '#fff',
                    fontSize: 9.5, fontWeight: 800, padding: '2px 7px', borderRadius: 99,
                    textTransform: 'uppercase', letterSpacing: .4,
                  }}>
                    {a.badge}
                  </span>
                )}

                {/* Arrow */}
                <div style={{ position: 'absolute', bottom: 14, right: 14, color: a.color, opacity: .4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed sidebar */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.05)' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: C.teal }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>Recent Activity</span>
            <Link href="/admin/activity" style={{ fontSize: 11, color: C.gold, textDecoration: 'none', fontWeight: 700 }}>View all</Link>
          </div>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{
              padding: '11px 14px',
              borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none',
              display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>
                <span style={{
                  fontSize: 9.5, fontWeight: 800, color: a.color,
                  background: `${a.color}15`, border: `1px solid ${a.color}30`,
                  borderRadius: 5, padding: '2px 6px', display: 'block',
                  whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: .4,
                }}>
                  {a.type}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.text}</div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{a.time} ago</div>
              </div>
            </div>
          ))}
          <Link href="/admin/activity" style={{
            display: 'block', textAlign: 'center', padding: '11px', fontSize: 12,
            fontWeight: 700, color: C.teal, textDecoration: 'none',
            borderTop: `1px solid ${C.border}`, background: C.bg,
          }}>
            See all events
          </Link>
        </div>
      </div>

      {/* ── Bottom stats bar ─────────────────────────────────────── */}
      <div style={{
        marginTop: 24, background: C.teal, borderRadius: 14,
        padding: '16px 24px', display: 'flex', flexWrap: 'wrap',
        gap: 0, alignItems: 'center', justifyContent: 'space-between',
      }}>
        {[
          { label: 'Platform', value: 'Online', color: '#4ade80' },
          { label: 'Uptime', value: '99.9%', color: C.gold },
          { label: 'Avg Response', value: '142ms', color: C.gold },
          { label: 'DB Status', value: 'Healthy', color: '#4ade80' },
          { label: 'Last Deploy', value: 'Today 6:31AM', color: 'rgba(255,255,255,.5)' },
          { label: 'Version', value: '0.8.4', color: 'rgba(255,255,255,.5)' },
        ].map((s, i) => (
          <div key={i} style={{ padding: '4px 20px', borderRight: i < 5 ? '1px solid rgba(255,255,255,.12)' : 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{s.label}</div>
            <div style={{ fontSize: 13, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 900px) {
          .overview-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
