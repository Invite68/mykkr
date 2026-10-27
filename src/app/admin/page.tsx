'use client'
import Link from 'next/link'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9' }

const KPI = [
  { label: 'Active Businesses', value: '31', sub: '4 pending approval', color: C.teal, href: '/admin/businesses?status=active' },
  { label: 'Active Customers', value: '124', sub: '22 on free trial', color: '#0369a1', href: '/admin/customers?status=active' },
  { label: 'Active Drivers', value: '9', sub: '3 awaiting approval', color: '#7c3aed', href: '/admin/drivers?status=active' },
  { label: 'Delivery Jobs Today', value: '14', sub: '3 in progress', color: '#b45309', href: '/admin/drivers?tab=jobs' },
  { label: 'Monthly Revenue', value: '₹3,091', sub: '+7.9% vs last month', color: C.green, href: '/admin/revenue' },
  { label: 'Total Subscribers', value: '155', sub: '31 biz + 124 customers', color: '#0f766e', href: '/admin/subscriptions' },
  { label: 'Flagged Content', value: '2', sub: 'Needs review', color: C.red, href: '/admin/businesses?status=flagged' },
  { label: 'Categories Active', value: '26', sub: 'across 7 groups', color: C.muted, href: '/admin/categories' },
]

const QUICK = [
  { label: 'Manage Businesses', sub: 'Active, inactive, KYC, approvals', href: '/admin/businesses', color: C.teal },
  { label: 'Manage Customers', sub: 'Accounts, subscriptions, bans', href: '/admin/customers', color: '#0369a1' },
  { label: 'Manage Drivers', sub: 'Approve, suspend, delivery jobs', href: '/admin/drivers', color: '#7c3aed' },
  { label: 'Subscriptions', sub: 'Plans, pricing, history', href: '/admin/subscriptions', color: C.green },
  { label: 'Revenue & Analytics', sub: 'Charts, MRR, payment log', href: '/admin/revenue', color: '#b45309' },
  { label: 'Fare & Pricing', sub: 'Delivery rates, vehicle types', href: '/admin/fares', color: '#0e7490' },
  { label: 'Media & Ads', sub: 'Home banners, videos, promotions', href: '/admin/media', color: '#7c3aed' },
  { label: 'Categories', sub: 'Add, rename, toggle subcategories', href: '/admin/categories', color: C.amber },
  { label: 'Site Settings', sub: 'Logo, about, legal, maintenance', href: '/admin/site', color: '#475569' },
  { label: 'Activity Feed', sub: 'Real-time events by type', href: '/admin/activity', color: C.teal },
  { label: 'Audit Log', sub: 'Full change history with rollback', href: '/admin/audit', color: '#475569' },
]

const ACTIVITY = [
  { time: '2m',  text: 'New business registered: KKR Laundry Hub', type: 'biz',    color: C.green },
  { time: '8m',  text: 'Subscription paid ₹99: Sharma Kirana Store', type: 'pay',  color: C.teal },
  { time: '14m', text: 'KYC submitted: Sunrise Hotel KKR — awaiting review', type: 'kyc', color: C.amber },
  { time: '22m', text: 'New driver registered: Suresh Yadav (car)', type: 'drv',   color: '#7c3aed' },
  { time: '1h',  text: 'Customer banned: Mohan Lal — fraudulent activity', type: 'ban',  color: C.red },
  { time: '2h',  text: 'Ad #3 updated on home banner by admin', type: 'media',     color: C.muted },
  { time: '3h',  text: 'Delivery job #D-2047 completed by Ramesh K.', type: 'job', color: C.green },
  { time: '4h',  text: 'New subscription trial started: Priya Sharma', type: 'pay', color: C.teal },
]

const typeLabel: Record<string, string> = { biz: 'Business', pay: 'Payment', kyc: 'KYC', drv: 'Driver', ban: 'Action', media: 'Media', job: 'Delivery' }

export default function AdminOverview() {
  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Overview</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>My KKR platform at a glance — click any tile to manage</p>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 12, marginBottom: 28 }}>
        {KPI.map(k => (
          <Link key={k.label} href={k.href} style={{ textDecoration: 'none', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', display: 'block', transition: 'box-shadow .12s', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .6, marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: k.color, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>{k.sub}</div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Quick access */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.teal, marginBottom: 12, textTransform: 'uppercase', letterSpacing: .5 }}>Quick Access</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 10 }}>
            {QUICK.map(q => (
              <Link key={q.href} href={q.href} style={{
                textDecoration: 'none', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10,
                padding: '14px 16px', display: 'block',
                borderLeft: `4px solid ${q.color}`,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b', marginBottom: 2 }}>{q.label}</div>
                <div style={{ fontSize: 12, color: C.muted }}>{q.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 13, color: C.teal }}>Recent Activity</span>
            <Link href="/admin/activity" style={{ fontSize: 12, color: C.teal, textDecoration: 'none', fontWeight: 600 }}>View all</Link>
          </div>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ padding: '10px 16px', borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: a.color, background: `${a.color}15`, border: `1px solid ${a.color}33`, borderRadius: 99, padding: '2px 7px', whiteSpace: 'nowrap', marginTop: 1, flexShrink: 0 }}>{typeLabel[a.type]}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.4 }}>{a.text}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{a.time} ago</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
