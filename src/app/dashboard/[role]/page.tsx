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
  return (
    <>
      {/* ── KPI strip with trends ─────────────────────────────────────── */}
      <Kpis items={[
        { label: 'Orders this month', value: '42',   trend: '+18%',  trendUp: true  },
        { label: 'Bookings pending',  value: '3',    sub: 'awaiting confirmation'   },
        { label: 'Profile views',     value: '1,284',trend: '+11%',  trendUp: true  },
        { label: 'Commission paid',   value: '₹0',   sub: 'My KKR takes nothing'    },
      ]} />

      {/* ── Business type + listing counts ───────────────────────────── */}
      <div className="panel" style={{ marginTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 className="panel-title" style={{ marginBottom: 6 }}>Your Business Mode</h2>
            <p className="muted" style={{ fontSize: 12 }}>
              Your listing is set up as a <strong>Hybrid</strong> business — you can sell goods, offer services, and list venues all from one profile.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Goods', 'Services', 'Venues'] as const).map((t) => (
              <span key={t} style={{
                padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700,
                background: t === 'Services' ? '#12343b' : 'var(--bg-2)',
                color:      t === 'Services' ? '#fff'    : 'var(--text-2)',
                border: '1.5px solid var(--border)',
              }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Listing counts row */}
        <div style={{ display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap' }}>
          {[
            { label: 'Products listed', value: '12', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
            { label: 'Services active', value: '4',  icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> },
            { label: 'Avg rating',      value: '4.7',icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
            { label: 'Response rate',   value: '92%',icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <span style={{ color: 'var(--night-d)' }}>{icon}</span>
              <span style={{ fontWeight: 700, color: 'var(--night-d)' }}>{value}</span>
              <span className="muted">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Subscription status ───────────────────────────────────────── */}
      <div className="panel" style={{ borderLeft: '4px solid #12343b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 className="panel-title" style={{ marginBottom: 4 }}>
              Business Plan — <span style={{ color: '#16a34a' }}>Active</span>
            </h2>
            <div className="muted">
              {formatInr(PLANS.business.priceInr)} + GST = <strong>{formatInr(withGst(PLANS.business.priceInr))}</strong> / month
            </div>
            <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
              Renews automatically via Razorpay · Cancel any time
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 24, color: '#12343b', lineHeight: 1 }}>₹0</div>
            <div className="muted" style={{ fontSize: 11 }}>commission on all sales</div>
          </div>
        </div>

        {/* What's included */}
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {[
            'Unlimited listings', 'Full shop page', 'Booking calendar',
            'Driver dispatch', 'Analytics', 'Direct UPI/COD payments',
          ].map((f) => (
            <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              {f}
            </span>
          ))}
        </div>

        <p className="muted" style={{ marginTop: 10, fontSize: 12 }}>
          All customer payments (UPI, card, wallet, COD) go directly to you. My KKR is only the connector.
        </p>
      </div>

      {/* ── Recent orders & bookings ──────────────────────────────────── */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="panel-title" style={{ marginBottom: 0 }}>Recent orders &amp; bookings</h2>
          <span className="muted" style={{ fontSize: 11 }}>Sample preview</span>
        </div>
        <Table
          head={['Order ID', 'Item / Service', 'Fulfilment', 'Amount', 'Status']}
          rows={[
            ['#KKR-7Q2M', 'Groceries (3 items)',      'Partner driver',   '₹380', <StatusBadge key="1" status="Out for delivery" />],
            ['#KKR-3HXP', 'House painting — 24 Oct',  'On-site service',  '₹4,500', <StatusBadge key="2" status="Confirmed" />],
            ['#KKR-9LKA', 'Stationery bundle',        'Customer pickup',  '₹210', <StatusBadge key="3" status="Ready for pickup" />],
            ['#KKR-2BNQ', 'Vegetables (daily box)',   'Self-delivery',    '₹145', <StatusBadge key="4" status="Delivered" />],
          ]}
        />
      </div>

      {/* ── Weekly hours preview ─────────────────────────────────────── */}
      <div className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 className="panel-title" style={{ marginBottom: 0 }}>Operating hours</h2>
          <Link href="/register?role=business" className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {DAYS_SHORT.map((day) => {
            const h = SAMPLE_HOURS[day]
            return (
              <div key={day} style={{
                padding: '8px 4px', borderRadius: 8, textAlign: 'center',
                background: h.open ? '#12343b12' : 'var(--bg-2)',
                border: `1.5px solid ${h.open ? '#12343b30' : 'var(--border)'}`,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: h.open ? 'var(--night-d)' : 'var(--text-3)', marginBottom: 4 }}>{day}</div>
                {h.open ? (
                  <>
                    <div style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.4 }}>{h.start}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)' }}>—</div>
                    <div style={{ fontSize: 10, color: 'var(--text-2)', lineHeight: 1.4 }}>{h.end}</div>
                  </>
                ) : (
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Closed</div>
                )}
              </div>
            )
          })}
        </div>
        <p className="muted" style={{ fontSize: 11, marginTop: 8 }}>Sample hours — update in your profile settings after signing in.</p>
      </div>

      {/* ── Quick actions ─────────────────────────────────────────────── */}
      <div className="panel">
        <h2 className="panel-title">Manage your business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Edit profile',    href: '/register?role=business', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
            { label: 'Add a listing',   href: '/register?role=business', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
            { label: 'Manage hours',    href: '/register?role=business', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
            { label: 'View public page',href: '/business/sharma-kirana-store', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> },
            { label: 'Post a task/gig', href: '/post',                    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/></svg> },
            { label: 'See your shop',   href: '/shop/sharma-kirana-store', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> },
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
      <Kpis items={[
        { label: 'Trial days left',      value: String(PLANS.customer.trialDays), sub: 'free trial — no card needed' },
        { label: 'Active bookings',      value: '2',  sub: 'sample data'          },
        { label: 'Open requirements',    value: '1',  sub: 'awaiting bids'        },
        { label: 'Favourites saved',     value: '5',  sub: 'sample data'          },
      ]} />

      {/* Subscription */}
      <div className="panel" style={{ marginTop: 14, borderLeft: '4px solid #0f766e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 className="panel-title" style={{ marginBottom: 4 }}>
              Customer Plan — <span style={{ color: '#d97706' }}>Free Trial</span>
            </h2>
            <div className="muted">
              After trial: {formatInr(PLANS.customer.priceInr)} + GST = <strong>{formatInr(withGst(PLANS.customer.priceInr))}</strong> / month
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>No card needed during trial · Cancel any time</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 24, color: '#d97706', lineHeight: 1 }}>{PLANS.customer.trialDays}</div>
            <div className="muted" style={{ fontSize: 11 }}>days free</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          {['Browse all businesses', 'Book services', 'Order goods', 'Post requirements', 'In-app chat', 'Order tracking'].map((f) => (
            <span key={f} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* My bookings */}
      <div className="panel">
        <h2 className="panel-title">My orders &amp; bookings</h2>
        <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
          Sample preview — your real history appears here after sign-in is connected.
        </p>
        <Table
          head={['Order ID', 'Business', 'What', 'Status']}
          rows={[
            ['#KKR-7Q2M', 'Sharma Kirana Store', 'Groceries', <StatusBadge key="1" status="Out for delivery" />],
            ['#KKR-3HXP', 'Rangoli Painters', 'House painting — 24 Oct', <StatusBadge key="2" status="Confirmed" />],
            ['#KKR-4DZK', 'Gupta Sweet House', 'Mithai 1 kg box', <StatusBadge key="3" status="Delivered" />],
          ]}
        />
      </div>

      {/* Quick actions */}
      <div className="panel">
        <h2 className="panel-title">What would you like to do?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10 }}>
          {([
            {
              label: 'Post a requirement', href: '/post', desc: 'Let businesses come to you',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
            },
            {
              label: 'Request a ride', href: '/rides', desc: 'Taxi or delivery',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="9" width="22" height="10" rx="2" ry="2"/><path d="M16 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg>,
            },
            {
              label: 'Find & book a service', href: '/find-book', desc: 'Plumber, painter, venue…',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            },
            {
              label: 'Browse businesses', href: '/categories', desc: 'Shops, food, services',
              icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
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
    </>
  )
}

// ── DRIVER DASHBOARD ──────────────────────────────────────────────────────────

function DriverDash() {
  return (
    <>
      <Kpis items={[
        { label: 'Jobs today',           value: '6',      trend: '+2',    trendUp: true  },
        { label: 'Earnings today',       value: '₹1,140', trend: '+₹140', trendUp: true  },
        { label: 'Rating',               value: '4.8 / 5',sub: '48 reviews'              },
        { label: 'Commission to My KKR', value: '₹0',     sub: 'keep everything'         },
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
