import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { ROLES, getRole, type UserRole } from '@/config/roles'
import { PLANS, formatInr, withGst } from '@/config/platform'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { query } from '@/lib/db'

import JobBoardWrapper from '@/components/driver/JobBoardWrapper'

type Params = Promise<{ role: string }>

export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.id }))
}

// ── Live admin stats from DB ──────────────────────────────────────────────────

interface AdminStats {
  totalBusinesses:     number
  verifiedBusinesses:  number
  pendingVerification: number
  activeBusinessSubs:  number
  totalCustomers:      number
  activeCustomerSubs:  number
  trialCustomers:      number
  totalDrivers:        number
  totalJobsAllTime:    number
  openJobs:            number
  completedJobs:       number
  cancelledJobs:       number
  totalRevenuePaise:   number
}

async function fetchAdminStats(): Promise<AdminStats | null> {
  try {
    const [bizCounts, customerCounts, driverCount, jobCounts, revenueCounts] = await Promise.all([
      query<{ total: string; verified: string; active_subs: string }>(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE gstin IS NOT NULL AND gstin != '') AS verified,
           (SELECT COUNT(*) FROM subscriptions s
            JOIN users u ON u.id = s.user_id
            JOIN business_profiles bp ON bp.user_id = u.id
            WHERE s.plan = 'business' AND s.status IN ('active','trialing'))
                                                                     AS active_subs
         FROM business_profiles`
      ),
      query<{ total: string; active_subs: string; trial_subs: string }>(
        `SELECT
           COUNT(*) AS total,
           (SELECT COUNT(*) FROM subscriptions WHERE plan = 'customer' AND status = 'active')   AS active_subs,
           (SELECT COUNT(*) FROM subscriptions WHERE plan = 'customer' AND status = 'trialing') AS trial_subs
         FROM customer_profiles`
      ),
      query<{ total: string }>('SELECT COUNT(*) AS total FROM driver_profiles'),
      query<{ total: string; open: string; completed: string; cancelled: string }>(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'open')      AS open,
           COUNT(*) FILTER (WHERE status = 'completed') AS completed,
           COUNT(*) FILTER (WHERE status IN ('cancelled_by_rider','cancelled_by_driver')) AS cancelled
         FROM jobs`
      ),
      query<{ total_revenue: string }>(
        `SELECT COALESCE(SUM(amount_paise), 0) AS total_revenue
         FROM subscription_payments WHERE status = 'captured'`
      ).catch(() => [{ total_revenue: '0' }]),
    ])

    const biz  = bizCounts[0]      ?? { total: '0', verified: '0', active_subs: '0' }
    const cust = customerCounts[0] ?? { total: '0', active_subs: '0', trial_subs: '0' }
    const drv  = driverCount[0]    ?? { total: '0' }
    const jobs = jobCounts[0]      ?? { total: '0', open: '0', completed: '0', cancelled: '0' }
    const rev  = revenueCounts[0]  ?? { total_revenue: '0' }

    return {
      totalBusinesses:     parseInt(biz.total,       10) || 0,
      verifiedBusinesses:  parseInt(biz.verified,    10) || 0,
      pendingVerification: (parseInt(biz.total, 10) || 0) - (parseInt(biz.verified, 10) || 0),
      activeBusinessSubs:  parseInt(biz.active_subs, 10) || 0,
      totalCustomers:      parseInt(cust.total,       10) || 0,
      activeCustomerSubs:  parseInt(cust.active_subs, 10) || 0,
      trialCustomers:      parseInt(cust.trial_subs,  10) || 0,
      totalDrivers:        parseInt(drv.total, 10) || 0,
      totalJobsAllTime:    parseInt(jobs.total,     10) || 0,
      openJobs:            parseInt(jobs.open,      10) || 0,
      completedJobs:       parseInt(jobs.completed, 10) || 0,
      cancelledJobs:       parseInt(jobs.cancelled, 10) || 0,
      totalRevenuePaise:   parseInt(rev.total_revenue, 10) || 0,
    }
  } catch (err) {
    console.warn('[AdminDash] DB unavailable, using static data:', (err as Error).message)
    return null
  }
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return {
    title: `${getRole((await params).role)?.name ?? 'Dashboard'} — My KKR`,
    robots: { index: false, follow: false },
  }
}

interface KpiItem {
  label: string
  value: string
  sub?: string
  trend?: string      // e.g. '+12%' (positive) or '-3%' (negative)
  trendUp?: boolean   // true = green arrow, false = red arrow
}

function Kpis({ items }: { items: KpiItem[] }) {
  return (
    <div className="kpi-grid">
      {items.map(({ label, value, sub, trend, trendUp }) => (
        <div className="kpi" key={label}>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          {trend && (
            <div className="kpi-trend" style={{ color: trendUp ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {trendUp
                  ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>
                  : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>
                }
              </svg>
              {trend} this month
            </div>
          )}
          {sub && !trend && <div className="kpi-sub">{sub}</div>}
        </div>
      ))}
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="list-table" style={{ minWidth: 400 }}>
        <thead>
          <tr>{head.map((h) => <td key={h} className="muted" style={{ fontWeight: 700, textAlign: 'left' }}>{h}</td>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>{r.map((c, i) => <td key={i} style={{ textAlign: i === r.length - 1 ? 'right' : 'left', fontWeight: i === r.length - 1 ? 700 : 400 }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    'Delivered': '#16a34a',
    'Out for delivery': '#0ea5e9',
    'Confirmed': '#7c3aed',
    'Ready for pickup': '#d97706',
    'Pending': '#6b7280',
  }
  const color = map[status] ?? '#6b7280'
  return (
    <span style={{
      background: color + '18', color, fontWeight: 700,
      fontSize: 11, padding: '3px 8px', borderRadius: 99,
      border: `1px solid ${color}44`,
    }}>
      {status}
    </span>
  )
}

// ── BUSINESS DASHBOARD ────────────────────────────────────────────────────────

// Days shown in the weekly hours mini-table
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Sample working hours — replaced by real DB data once connected
const SAMPLE_HOURS: Record<string, { open: boolean; start: string; end: string }> = {
  Mon: { open: true,  start: '09:00', end: '18:00' },
  Tue: { open: true,  start: '09:00', end: '18:00' },
  Wed: { open: true,  start: '09:00', end: '18:00' },
  Thu: { open: true,  start: '09:00', end: '18:00' },
  Fri: { open: true,  start: '09:00', end: '17:00' },
  Sat: { open: true,  start: '10:00', end: '14:00' },
  Sun: { open: false, start: '10:00', end: '14:00' },
}

function BusinessDash() {
  // ── "Needs attention" items — these drive urgency at the top ─────────────
  // Once DB is connected, these come from real queries.
  // We show them only when count > 0 so the panel disappears when all clear.
  const pendingActions = [
    { count: 3, label: 'bookings waiting for your confirmation', href: '/register?role=business', urgent: true },
    { count: 1, label: 'customer message unread',                href: '/register?role=business', urgent: false },
    { count: 2, label: 'orders ready — assign a driver or confirm pickup', href: '/register?role=business', urgent: false },
  ]

  return (
    <>
      {/* ── NEEDS ATTENTION — most important panel, always first ─────── */}
      <div className="panel" style={{ marginTop: 0, borderLeft: '4px solid #dc2626' }}>
        <h2 className="panel-title" style={{ marginBottom: 10 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Needs your attention
          </span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {pendingActions.map(({ count, label, href, urgent }) => (
            <Link key={label} href={href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              background: urgent ? '#fef2f2' : 'var(--bg-2)',
              border: `1px solid ${urgent ? '#fecaca' : 'var(--border)'}`,
            }}>
              <span style={{ fontSize: 13, color: 'var(--text-1)' }}>
                <strong style={{ color: urgent ? '#dc2626' : 'var(--night-d)' }}>{count}</strong> {label}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Sample data — connects to live orders after sign-in is wired.</p>
      </div>

      {/* ── TODAY AT A GLANCE ─────────────────────────────────────────── */}
      <Kpis items={[
        { label: 'Orders this month', value: '42',    sub: 'sample data'           },
        { label: 'Awaiting action',   value: '3',     sub: 'bookings to confirm'   },
        { label: 'Profile views',     value: '1,284', sub: 'this month'            },
        { label: 'Revenue to you',    value: '₹0',    sub: 'platform takes nothing'},
      ]} />

      {/* ── SHOP STATUS + HOURS ───────────────────────────────────────── */}
      {/* Business owner's first question: is my shop showing as open right now? */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="panel-title" style={{ marginBottom: 0 }}>
            Shop status &amp; hours
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Open/closed indicator — reads from today's hours */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700,
              background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
              Open now
            </span>
            <Link href="/register?role=business" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </Link>
          </div>
        </div>
        {/* Weekly hours grid — at a glance, which days are you closed? */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DAYS_SHORT.map((day) => {
            const h = SAMPLE_HOURS[day]
            // Highlight today
            const todayIdx = new Date().getDay() // 0=Sun,1=Mon...
            const dayIdx   = DAYS_SHORT.indexOf(day)
            const isToday  = (todayIdx === 0 ? 6 : todayIdx - 1) === dayIdx
            return (
              <div key={day} style={{
                padding: '8px 4px', borderRadius: 8, textAlign: 'center',
                background: isToday ? (h.open ? '#12343b' : '#374151') : (h.open ? '#12343b12' : 'var(--bg-2)'),
                border: `1.5px solid ${isToday ? 'transparent' : (h.open ? '#12343b30' : 'var(--border)')}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3,
                  color: isToday ? '#fff' : (h.open ? 'var(--night-d)' : 'var(--text-3)') }}>
                  {day}
                </div>
                {h.open ? (
                  <>
                    <div style={{ fontSize: 10, lineHeight: 1.3, color: isToday ? '#d1fae5' : 'var(--text-2)' }}>{h.start}</div>
                    <div style={{ fontSize: 9,  color: isToday ? '#6ee7b7' : 'var(--text-3)' }}>—</div>
                    <div style={{ fontSize: 10, lineHeight: 1.3, color: isToday ? '#d1fae5' : 'var(--text-2)' }}>{h.end}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 10, color: isToday ? '#9ca3af' : 'var(--text-3)' }}>Closed</div>
                )}
              </div>
            )
          })}
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Today is highlighted · Sample hours — set yours after sign-in.</p>
      </div>

      {/* ── RECENT ACTIVITY ───────────────────────────────────────────── */}
      {/* Business needs to see: what came in, what needs dispatching */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="panel-title" style={{ marginBottom: 0 }}>Recent orders &amp; bookings</h2>
          <span className="muted" style={{ fontSize: 11 }}>Sample data</span>
        </div>
        <Table
          head={['Order', 'Customer ordered', 'Fulfilment', 'Amount', 'Status']}
          rows={[
            ['#KKR-7Q2M', 'Groceries (3 items)',           'Assign driver',    '₹380',   <StatusBadge key="1" status="Pending" />],
            ['#KKR-3HXP', 'House painting — 26 Oct 10am',  'You go on-site',   '₹4,500', <StatusBadge key="2" status="Confirmed" />],
            ['#KKR-9LKA', 'Stationery bundle',             'Customer pickup',  '₹210',   <StatusBadge key="3" status="Ready for pickup" />],
            ['#KKR-2BNQ', 'Vegetables (daily box)',        'Self-delivery',    '₹145',   <StatusBadge key="4" status="Delivered" />],
          ]}
        />
        <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          Payment for every order goes directly from customer to you — UPI, card, wallet, or cash. My KKR takes nothing.
        </p>
      </div>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
      <div className="panel">
        <h2 className="panel-title">Manage your business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Edit profile',     href: '/register?role=business',        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
            { label: 'Add a listing',    href: '/register?role=business',        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
            { label: 'View public page', href: '/business/sharma-kirana-store',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
            { label: 'Your shop',        href: '/shop/sharma-kirana-store',      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { label: 'Post a task/gig',  href: '/post',                          icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
            { label: 'Subscription',     href: '/pricing',                       icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
          ].map((a) => (
            <Link key={a.label} href={a.href} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {a.icon}{a.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

// ── CUSTOMER DASHBOARD ────────────────────────────────────────────────────────

function CustomerDash() {
  return (
    <>
      {/* ── LIVE ORDERS — customer's primary need ─────────────────────── */}
      {/* "Where is my stuff?" is the most common customer support question.
          Showing active orders first eliminates that anxiety immediately.   */}
      <div className="panel" style={{ marginTop: 0 }}>
        <h2 className="panel-title" style={{ marginBottom: 12 }}>Your active orders</h2>

        {/* Active order card — becomes real once auth is wired */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            {
              id: '#KKR-7Q2M', what: 'Groceries (3 items)', biz: 'Sharma Kirana Store',
              status: 'Out for delivery', statusColor: '#0ea5e9',
              detail: 'Driver Raju is 2 km away · Est. 15 min',
              showTrack: true,
            },
            {
              id: '#KKR-3HXP', what: 'House painting — tomorrow 10am', biz: 'Rangoli Painters',
              status: 'Confirmed', statusColor: '#7c3aed',
              detail: 'Painter will arrive at your address at 10:00 AM',
              showTrack: false,
            },
          ].map((o) => (
            <div key={o.id} style={{
              padding: 14, borderRadius: 10, border: '1.5px solid var(--border)',
              background: 'var(--bg-1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{o.what}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{o.biz} · {o.id}</div>
                </div>
                <span style={{
                  background: o.statusColor + '18', color: o.statusColor,
                  fontWeight: 700, fontSize: 11, padding: '3px 8px', borderRadius: 99,
                  border: `1px solid ${o.statusColor}44`, whiteSpace: 'nowrap',
                }}>{o.status}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, marginBottom: o.showTrack ? 10 : 0 }}>{o.detail}</div>
              {o.showTrack && (
                <Link href="/track/KKR-7Q2M" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
                  Live track
                </Link>
              )}
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Sample data — your real orders show here once signed in.</p>
      </div>

      {/* ── QUICK ACTIONS — what do you want to do next? ──────────────── */}
      <div className="panel">
        <h2 className="panel-title">What would you like to do?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
          {([
            {
              label: 'Browse businesses', href: '/categories', desc: 'Shops, food, services near you',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
            },
            {
              label: 'Book a service', href: '/find-book', desc: 'Plumber, painter, venue, cab…',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            },
            {
              label: 'Post a requirement', href: '/post', desc: 'Tell businesses what you need',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
            },
            {
              label: 'Request a ride', href: '/rides', desc: 'Taxi, auto, or parcel delivery',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="9" width="22" height="10" rx="2" ry="2"/><path d="M16 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>,
            },
          ] as { label: string; href: string; desc: string; icon: React.JSX.Element }[]).map((a) => (
            <Link key={a.label} href={a.href} className="panel" style={{ textDecoration: 'none', padding: '12px 14px', border: '1.5px solid var(--border)', gap: 4 }}>
              <div style={{ color: 'var(--night-d)', marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--night-d)' }}>{a.label}</div>
              <div className="muted" style={{ fontSize: 11 }}>{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── ORDER HISTORY + REORDER ───────────────────────────────────── */}
      {/* Reorder is a big retention driver — show past orders with a quick repeat action */}
      <div className="panel">
        <h2 className="panel-title">Past orders</h2>
        <Table
          head={['Business', 'What', 'Amount', 'Status', '']}
          rows={[
            ['Gupta Sweet House',    'Mithai 1 kg box',     '₹350', <StatusBadge key="d1" status="Delivered" />, <Link key="r1" href="/categories" className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>Reorder</Link>],
            ['Sharma Kirana Store',  'Monthly groceries',   '₹1,240', <StatusBadge key="d2" status="Delivered" />, <Link key="r2" href="/categories" className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>Reorder</Link>],
            ['City Plumbers',        'Tap repair — 14 Oct', '₹600', <StatusBadge key="d3" status="Delivered" />, <Link key="r3" href="/categories" className="btn btn-outline btn-sm" style={{ fontSize: 11 }}>Book again</Link>],
          ]}
        />
        <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Sample data — real history loads once signed in.</p>
      </div>

      {/* ── TRIAL STATUS — show only if on trial ─────────────────────── */}
      {/* Put this last: it's account info, not something they came here to see */}
      <div className="panel" style={{ borderLeft: '4px solid #d97706' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
              Free trial — <span style={{ color: '#d97706' }}>{PLANS.customer.trialDays} days remaining</span>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              After trial: {formatInr(withGst(PLANS.customer.priceInr))}/month · No card needed until then
            </div>
          </div>
          <Link href="/pricing" className="btn btn-outline btn-sm" style={{ whiteSpace: 'nowrap' }}>See plan</Link>
        </div>
      </div>
    </>
  )
}

// ── DRIVER DASHBOARD ──────────────────────────────────────────────────────────

function DriverDash() {
  return (
    <>
      <Kpis items={[
        { label: 'Jobs today',           value: '6',       sub: 'sample data'     },
        { label: 'Earnings today',       value: '₹1,140',  sub: 'sample data'     },
        { label: 'Rating',               value: '4.8 / 5', sub: 'sample data'     },
        { label: 'Commission to My KKR', value: '₹0',      sub: 'keep everything' },
      ]} />

      <div className="panel" style={{ marginTop: 14, borderLeft: '4px solid #b45309' }}>
        <h2 className="panel-title">How driver earnings work</h2>
        <p className="prose">
          When a customer places an order or books a service, they can choose
          <strong> &ldquo;Partner Driver&rdquo;</strong> for delivery. The request appears on your job board.
          You accept, pick up, deliver, and upload a photo. The customer pays you directly — My KKR takes <strong>no commission</strong>.
        </p>
      </div>

      <div className="panel">
        <h2 className="panel-title">Live Job Board</h2>
        <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
          New delivery and ride requests appear here in real time. Only one driver can accept each job.
        </p>
        <JobBoardWrapper />
      </div>
    </>
  )
}

// ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────

function AdminDash({ stats }: { stats: AdminStats | null }) {
  const totalBiz    = stats?.totalBusinesses    ?? BUSINESSES.length
  const verifiedBiz = stats?.verifiedBusinesses ?? BUSINESSES.filter((b) => b.verified).length
  const pending     = stats?.pendingVerification ?? (BUSINESSES.length - BUSINESSES.filter((b) => b.verified).length)
  const activeSubs  = stats?.activeBusinessSubs  ?? 0
  const totalCust   = stats?.totalCustomers      ?? 0
  const custSubs    = stats?.activeCustomerSubs  ?? 0
  const trials      = stats?.trialCustomers      ?? 0
  const drivers     = stats?.totalDrivers        ?? 0
  const jobs        = stats?.totalJobsAllTime    ?? 0
  const openJobs    = stats?.openJobs            ?? 0
  const completed   = stats?.completedJobs       ?? 0
  const revInr      = stats != null ? (stats.totalRevenuePaise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '—'
  const isLive      = stats !== null

  return (
    <>
      {isLive && (
        <div className="banner banner-ok" style={{ marginBottom: 14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
          <div>Live platform data from database</div>
        </div>
      )}

      <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Businesses</h3>
      <Kpis items={[
        { label: 'Total registered', value: String(totalBiz)    },
        { label: 'GST verified',     value: String(verifiedBiz) },
        { label: 'Pending KYC',      value: String(pending),      sub: pending > 0 ? 'needs review' : 'all clear' },
        { label: 'Active subs',      value: String(activeSubs)  },
      ]} />

      <h3 style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 14 }}>Customers &amp; Drivers</h3>
      <Kpis items={[
        { label: 'Customers',    value: String(totalCust) },
        { label: 'Active subs',  value: String(custSubs)  },
        { label: 'On trial',     value: String(trials),     sub: 'free 7-day trial' },
        { label: 'Drivers',      value: String(drivers)   },
      ]} />

      <h3 style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 14 }}>Jobs (Rides &amp; Deliveries)</h3>
      <Kpis items={[
        { label: 'Total all-time', value: String(jobs)      },
        { label: 'Open now',       value: String(openJobs)  },
        { label: 'Completed',      value: String(completed) },
        { label: 'Sub revenue',    value: `₹${revInr}`,      sub: '0% commission kept' },
      ]} />

      {!isLive && (
        <div className="panel" style={{ marginTop: 14 }}>
          <h2 className="panel-title">Pending KYC</h2>
          <p className="muted" style={{ fontSize: 12, marginBottom: 10 }}>
            Businesses with no GSTIN entered. Live data replaces this once DB is connected.
          </p>
          <Table head={['Business', 'Category', 'Area', 'Action']} rows={
            BUSINESSES.filter((b) => !b.verified).map((b) => [b.name, b.sub, b.area, 'Mark verified'])
          } />
        </div>
      )}

      <div className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel-title">Subscription plans</h2>
        <Table head={['Plan', 'Price + GST', 'Trial']} rows={[
          [PLANS.business.name, `${formatInr(withGst(PLANS.business.priceInr))}/mo`, '—'],
          [PLANS.customer.name, `${formatInr(withGst(PLANS.customer.priceInr))}/mo`, `${PLANS.customer.trialDays} days`],
        ]} />
        <p className="muted" style={{ marginTop: 10 }}>
          {String(CATEGORY_GROUPS.length)} categories active &nbsp;&middot;&nbsp;
          My KKR takes 0% commission on all transactions.
        </p>
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function RoleDashboard({ params }: { params: Params }) {
  const role = getRole((await params).role)
  if (!role) notFound()

  const adminStats = role.id === 'admin' ? await fetchAdminStats() : null
  const isLive = role.id === 'admin' && adminStats !== null

  let View: React.JSX.Element
  switch (role.id as UserRole) {
    case 'business': View = <BusinessDash />; break
    case 'customer': View = <CustomerDash />; break
    case 'driver':   View = <DriverDash />;   break
    case 'admin':    View = <AdminDash stats={adminStats} />; break
  }

  return (
    <div className="container">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboards' }, { label: role.name }]} />
      <h1 className="page-title">{role.name} Dashboard</h1>
      <p className="page-sub" style={{ marginBottom: 14 }}>{role.summary}</p>

      {!isLive && (
        <div className="banner banner-warn" style={{ marginBottom: 14 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <strong>Preview mode</strong> — showing sample data.
            Real data appears once Firebase sign-in is connected.{' '}
            <Link href="/dashboard" className="link">See all roles</Link>
          </div>
        </div>
      )}

      {View}
    </div>
  )
}
