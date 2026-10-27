'use client'

/**
 * Admin Overview — live stats cards + recent activity feed.
 */

import Link from 'next/link'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309' }

/* ── Sample stats (replace with API fetch once DB is connected) ─── */
const STATS = {
  businesses: { total: 38, active: 31, pending: 4, inactive: 3 },
  customers: { total: 124, active: 89, trial: 22, expired: 13 },
  drivers: { total: 12, online: 5, verified: 9, pending: 3 },
  revenue: { thisMonth: 3190, lastMonth: 2871, total: 18440 },
  jobs: { open: 8, completed: 341, cancelled: 14 },
  categories: { total: 7, subs: 26, active: 26 },
}

const RECENT_ACTIVITY = [
  { time: '2m ago',  type: 'new_biz',    text: 'New business registered: KKR Laundry Hub (Services → Cleaning)', color: C.green },
  { time: '14m ago', type: 'sub_paid',   text: 'Business subscription paid: Sharma Kirana Store — ₹99', color: C.teal },
  { time: '31m ago', type: 'new_cust',   text: 'New customer signed up: Priya Sharma (7-day trial started)', color: C.green },
  { time: '1h ago',  type: 'kyc_req',    text: 'KYC verification requested: Sunrise Hotel KKR (GSTIN submitted)', color: C.amber },
  { time: '2h ago',  type: 'job_done',   text: 'Delivery job #D-2047 completed by driver Ramesh K.', color: C.teal },
  { time: '3h ago',  type: 'sub_exp',    text: 'Subscription expired: Vidya Stationers (last notice sent)', color: C.red },
  { time: '4h ago',  type: 'new_driver', text: 'New driver registered: Suresh Yadav (vehicle: KA-05 → car)', color: C.green },
  { time: '5h ago',  type: 'sub_paid',   text: 'Customer subscription paid: Amit Kumar — ₹9.99', color: C.teal },
]

function StatBlock({ label, value, sub, color, href }: { label: string; value: number | string; sub?: string; color?: string; href?: string }) {
  const inner = (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 800, color: color ?? C.teal, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>{inner}</Link> : inner
}

function SectionHead({ title, action, href }: { title: string; action?: string; href?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.teal }}>{title}</h2>
      {action && href && <Link href={href} style={{ fontSize: 12, color: C.teal, fontWeight: 600, textDecoration: 'none' }}>{action} →</Link>}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginBottom: 28 }}>{children}</div>
}

export default function AdminOverview() {
  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Platform Overview</h1>
        <p style={{ margin: '4px 0 0', color: C.muted, fontSize: 13 }}>Live snapshot of My KKR — Kurukshetra</p>
      </div>

      {/* Revenue highlight */}
      <div style={{ background: C.teal, borderRadius: 14, padding: '20px 24px', marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}>
        <div>
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>This Month Revenue</div>
          <div style={{ color: '#fff', fontSize: 36, fontWeight: 900 }}>₹{STATS.revenue.thisMonth.toLocaleString('en-IN')}</div>
          <div style={{ color: C.gold, fontSize: 13, marginTop: 2 }}>+11.1% vs last month (₹{STATS.revenue.lastMonth.toLocaleString('en-IN')})</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: C.gold, fontSize: 22, fontWeight: 800 }}>₹{STATS.revenue.total.toLocaleString('en-IN')}</div>
            <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 11 }}>All-time revenue</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{STATS.businesses.active + STATS.customers.active}</div>
            <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 11 }}>Active subscribers</div>
          </div>
        </div>
      </div>

      {/* Businesses */}
      <SectionHead title="Businesses" action="Manage" href="/admin/businesses" />
      <Grid>
        <StatBlock label="Total"   value={STATS.businesses.total}   color={C.teal}  href="/admin/businesses" />
        <StatBlock label="Active"  value={STATS.businesses.active}  color={C.green} href="/admin/businesses?filter=active" />
        <StatBlock label="Pending KYC" value={STATS.businesses.pending} color={C.amber} sub="Need verification" href="/admin/businesses?filter=pending" />
        <StatBlock label="Inactive" value={STATS.businesses.inactive} color={C.red} href="/admin/businesses?filter=inactive" />
      </Grid>

      {/* Customers */}
      <SectionHead title="Customers" action="Manage" href="/admin/users?role=customer" />
      <Grid>
        <StatBlock label="Total"      value={STATS.customers.total}   color={C.teal} href="/admin/users?role=customer" />
        <StatBlock label="Subscribed" value={STATS.customers.active}  color={C.green} />
        <StatBlock label="On Trial"   value={STATS.customers.trial}   color={C.amber} sub="7-day free trial" />
        <StatBlock label="Expired"    value={STATS.customers.expired} color={C.red} />
      </Grid>

      {/* Drivers & Jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20, marginBottom: 28 }}>
        <div>
          <SectionHead title="Drivers" action="Manage" href="/admin/drivers" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBlock label="Total"    value={STATS.drivers.total}    color={C.teal} />
            <StatBlock label="Online"   value={STATS.drivers.online}   color={C.green} />
            <StatBlock label="Verified" value={STATS.drivers.verified} color={C.green} />
            <StatBlock label="Pending"  value={STATS.drivers.pending}  color={C.amber} />
          </div>
        </div>
        <div>
          <SectionHead title="Delivery Jobs" action="View all" href="/admin/jobs" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <StatBlock label="Open"      value={STATS.jobs.open}      color={C.amber} />
            <StatBlock label="Completed" value={STATS.jobs.completed} color={C.green} />
            <StatBlock label="Cancelled" value={STATS.jobs.cancelled} color={C.red} />
            <StatBlock label="Categories" value={STATS.categories.total} color={C.teal} href="/admin/categories" />
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <SectionHead title="Quick Actions" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Review pending KYC',    href: '/admin/businesses?filter=pending', color: C.amber },
          { label: 'Add a new category',    href: '/admin/categories',               color: C.teal },
          { label: 'Approve new driver',    href: '/admin/drivers?filter=pending',   color: C.teal },
          { label: 'View expired subs',     href: '/admin/subscriptions?filter=expired', color: C.red },
          { label: 'Adjust fare rates',     href: '/admin/fare-rates',               color: C.teal },
          { label: 'Audit log',             href: '/admin/audit',                    color: C.muted },
        ].map(({ label, href, color }) => (
          <Link key={href} href={href} style={{ display: 'block', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', textDecoration: 'none', color, fontSize: 13, fontWeight: 600, transition: 'box-shadow .12s' }}>
            {label} →
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <SectionHead title="Recent Activity" />
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {RECENT_ACTIVITY.map((a, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', borderBottom: i < RECENT_ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.color, flexShrink: 0, marginTop: 5 }} />
            <span style={{ flex: 1, fontSize: 13, color: '#334155' }}>{a.text}</span>
            <span style={{ fontSize: 11, color: C.muted, flexShrink: 0, whiteSpace: 'nowrap' }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
