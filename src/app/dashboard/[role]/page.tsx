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

function Kpis({ items }: { items: [string, string, string?][] }) {
  return (
    <div className="kpi-grid">
      {items.map(([label, value, sub]) => (
        <div className="kpi" key={label}>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
          {sub && <div className="kpi-sub">{sub}</div>}
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

function BusinessDash() {
  return (
    <>
      <Kpis items={[
        ['Orders this month', '42', 'sample data'],
        ['Bookings pending', '3', 'sample data'],
        ['Profile views', '1,284', 'sample data'],
        ['Commission paid', '₹0', 'My KKR takes nothing'],
      ]} />

      {/* Subscription status */}
      <div className="panel" style={{ marginTop: 14, borderLeft: '4px solid #12343b' }}>
        <h2 className="panel-title">Your Subscription</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              Business Plan — <span style={{ color: '#16a34a' }}>Active</span>
            </div>
            <div className="muted">
              {formatInr(PLANS.business.priceInr)} + GST = {formatInr(withGst(PLANS.business.priceInr))} / month
            </div>
            <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
              Renews automatically via Razorpay. Cancel any time.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 22, color: '#12343b' }}>₹0</div>
            <div className="muted" style={{ fontSize: 11 }}>commission on all sales</div>
          </div>
        </div>
        <p className="muted" style={{ marginTop: 10, fontSize: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
          All customer payments (UPI, card, wallet, COD) go directly to you. My KKR is only the connector.
        </p>
      </div>

      {/* Recent activity */}
      <div className="panel">
        <h2 className="panel-title">Recent orders &amp; bookings</h2>
        <p className="muted" style={{ fontSize: 12, marginBottom: 12 }}>
          Sample preview — your real orders appear here after sign-in is connected.
        </p>
        <Table
          head={['Order ID', 'What', 'Fulfilment', 'Status']}
          rows={[
            ['#KKR-7Q2M', 'Groceries (3 items)', 'Partner driver', <StatusBadge key="1" status="Out for delivery" />],
            ['#KKR-3HXP', 'House painting — 24 Oct', 'On-site service', <StatusBadge key="2" status="Confirmed" />],
            ['#KKR-9LKA', 'Stationery bundle', 'Customer pickup', <StatusBadge key="3" status="Ready for pickup" />],
            ['#KKR-2BNQ', 'Vegetables (daily box)', 'Self-delivery', <StatusBadge key="4" status="Delivered" />],
          ]}
        />
      </div>

      {/* Quick actions */}
      <div className="panel">
        <h2 className="panel-title">Manage your business</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'Edit profile', href: '/register?role=business', icon: '✏️' },
            { label: 'Add a listing', href: '/register?role=business', icon: '➕' },
            { label: 'Manage hours', href: '/register?role=business', icon: '🕐' },
            { label: 'View my public page', href: '/business/sharma-kirana-store', icon: '👁️' },
          ].map((a) => (
            <Link key={a.label} href={a.href} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{a.icon}</span> {a.label}
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
        ['Trial days left', String(PLANS.customer.trialDays), 'free trial'],
        ['Active bookings', '2', 'sample data'],
        ['Open requirements', '1', 'sample data'],
        ['Favourites saved', '5', 'sample data'],
      ]} />

      {/* Subscription */}
      <div className="panel" style={{ marginTop: 14, borderLeft: '4px solid #0f766e' }}>
        <h2 className="panel-title">Your Subscription</h2>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
          Customer Plan — <span style={{ color: '#d97706' }}>Free Trial ({PLANS.customer.trialDays} days)</span>
        </div>
        <div className="muted">
          After trial: {formatInr(PLANS.customer.priceInr)} + GST = {formatInr(withGst(PLANS.customer.priceInr))} / month.
          Unlimited browsing and booking.
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
          {[
            { label: 'Post a requirement', href: '/post', icon: '📋', desc: 'Let businesses come to you' },
            { label: 'Request a ride', href: '/rides', icon: '🚗', desc: 'Taxi or delivery' },
            { label: 'Find & book a service', href: '/find-book', icon: '📅', desc: 'Plumber, painter, venue…' },
            { label: 'Browse businesses', href: '/categories', icon: '🏪', desc: 'Shops, food, services' },
          ].map((a) => (
            <Link key={a.label} href={a.href} className="panel" style={{ textDecoration: 'none', padding: '12px 14px', border: '1.5px solid var(--border)', gap: 4 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
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
        ['Jobs today', '6', 'sample data'],
        ['Earnings today', '₹1,140', 'sample data'],
        ['Rating', '4.8 ★', 'sample data'],
        ['Commission to My KKR', '₹0', 'keep everything'],
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
          <span aria-hidden="true">🟢</span>
          <div>Live platform data from database</div>
        </div>
      )}

      <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Businesses</h3>
      <Kpis items={[
        ['Total registered', String(totalBiz)],
        ['GST verified',     String(verifiedBiz)],
        ['Pending KYC',      String(pending)],
        ['Active subs',      String(activeSubs)],
      ]} />

      <h3 style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 14 }}>Customers &amp; Drivers</h3>
      <Kpis items={[
        ['Customers',       String(totalCust)],
        ['Active subs',     String(custSubs)],
        ['On trial',        String(trials)],
        ['Drivers',         String(drivers)],
      ]} />

      <h3 style={{ fontWeight: 700, margin: '16px 0 8px', fontSize: 14 }}>Jobs (Rides &amp; Deliveries)</h3>
      <Kpis items={[
        ['Total all-time',  String(jobs)],
        ['Open now',        String(openJobs)],
        ['Completed',       String(completed)],
        ['Sub revenue',     `₹${revInr}`],
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

  const ROLE_EMOJI: Record<string, string> = {
    business: '🏪', customer: '🙋', driver: '🏍️', admin: '🛡️',
  }

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
      <h1 className="page-title">{ROLE_EMOJI[role.id] ?? ''} {role.name} Dashboard</h1>
      <p className="page-sub" style={{ marginBottom: 14 }}>{role.summary}</p>

      {!isLive && (
        <div className="banner banner-warn" style={{ marginBottom: 14 }}>
          <span aria-hidden="true">👁️</span>
          <div>
            <strong>Preview mode</strong> — showing sample data.
            Real data appears once Firebase sign-in is connected.{' '}
            <Link href="/dashboard" className="link">See all roles →</Link>
          </div>
        </div>
      )}

      {View}
    </div>
  )
}
