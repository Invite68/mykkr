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

// Admin dashboard needs live DB data, so force dynamic for admin role.
// Other roles still get static generation.
export const dynamic = 'force-dynamic'

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.id }))
}

// ── Live admin stats from DB ───────────────────────────────────────────────────

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
    title: `${getRole((await params).role)?.name ?? 'Dashboard'} dashboard`,
    // Dashboards are user-specific — never index in search engines
    robots: { index: false, follow: false },
  }
}

function Kpis({ items }: { items: [string, string][] }) {
  return (
    <div className="kpi-grid">
      {items.map(([label, value]) => (
        <div className="kpi" key={label}>
          <div className="kpi-label">{label}</div>
          <div className="kpi-value">{value}</div>
        </div>
      ))}
    </div>
  )
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="list-table" style={{ minWidth: 480 }}>
        <thead>
          <tr>{head.map((h) => <td key={h} className="muted" style={{ fontWeight: 700, textAlign: 'left' }}>{h}</td>)}</tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.join('|')}>{r.map((c, i) => <td key={i} style={{ textAlign: i === r.length - 1 ? 'right' : 'left', fontWeight: i === r.length - 1 ? 700 : 400 }}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BusinessDash() {
  return (
    <>
      <Kpis items={[['Orders this month', '42'], ['Bookings', '17'], ['Profile views', '1,284'], ['Commission paid', '₹0']]} />
      <div className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel-title">Recent orders &amp; bookings</h2>
        <Table head={['Ref', 'Customer', 'Type', 'Fulfilment', 'Status']} rows={[
          ['KKR-7Q2M', 'R. Kumar', 'Goods', 'Partner driver', 'Out for delivery'],
          ['KKR-3HXP', 'S. Devi', 'Booking · 24 Oct', '—', 'Confirmed'],
          ['KKR-9LKA', 'A. Singh', 'Goods', 'Customer pickup', 'Ready'],
        ]} />
      </div>
      <div className="panel">
        <h2 className="panel-title">Subscription</h2>
        <p className="prose">{PLANS.business.name} · {formatInr(PLANS.business.priceInr)} + GST ({formatInr(withGst(PLANS.business.priceInr))}/month) · <strong>Active</strong> · renews via Razorpay.</p>
        <p className="muted">Customer payments go straight to you (UPI / card / wallet / COD). My KKR never touches them.</p>
      </div>
    </>
  )
}

function CustomerDash() {
  return (
    <>
      <Kpis items={[['Trial days left', String(PLANS.customer.trialDays)], ['Active bookings', '2'], ['Open requirements', '1'], ['Favourites', '5']]} />
      <div className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel-title">My orders &amp; bookings</h2>
        <Table head={['Ref', 'Business', 'What', 'Status']} rows={[
          ['KKR-7Q2M', 'Sharma Kirana Store', 'Groceries', 'Out for delivery'],
          ['KKR-3HXP', 'Rangoli Painters', 'Painting · 24 Oct', 'Confirmed'],
        ]} />
      </div>
      <div className="panel">
        <h2 className="panel-title">Quick actions</h2>
        <div className="chips" style={{ flexWrap: 'wrap' }}>
          <Link href="/post" className="chip">📋 Post a requirement</Link>
          <Link href="/rides" className="chip">🚗 Request a ride</Link>
          <Link href="/find-book" className="chip">📅 Find &amp; book</Link>
        </div>
      </div>
    </>
  )
}

function DriverDash() {
  return (
    <>
      <Kpis items={[['Jobs today', '6'], ['Earnings today', '₹1,140'], ['Rating', '4.8 ★'], ['Commission', '₹0']]} />
      <div className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel-title">Live Job Board</h2>
        <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
          New ride/delivery requests appear here in real time. Accept atomically — only one driver gets each job.
        </p>
        <JobBoardWrapper />
      </div>
    </>
  )
}

function AdminDash({ stats }: { stats: AdminStats | null }) {
  // Use live DB stats when available, fall back to static demo data
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
          <div>Live platform data</div>
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
        ['Revenue (subs)',  `₹${revInr}`],
      ]} />

      {!isLive && (
        <div className="panel" style={{ marginTop: 14 }}>
          <h2 className="panel-title">Pending KYC (demo)</h2>
          <Table head={['Business', 'Area', 'Status']} rows={BUSINESSES.filter((b) => !b.verified).map((b) => [b.name, b.area, 'Pending KYC'])} />
        </div>
      )}

      <div className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel-title">Plans</h2>
        <Table head={['Plan', 'Price + GST', 'Trial']} rows={[
          [PLANS.business.name, `${formatInr(withGst(PLANS.business.priceInr))}/mo`, '—'],
          [PLANS.customer.name, `${formatInr(withGst(PLANS.customer.priceInr))}/mo`, `${PLANS.customer.trialDays} days`],
        ]} />
        <p className="muted" style={{ marginTop: 10 }}>
          {String(CATEGORY_GROUPS.length)} categories · admins see analytics only · My KKR takes no commission on transactions.
        </p>
      </div>
    </>
  )
}

export default async function RoleDashboard({ params }: { params: Params }) {
  const role = getRole((await params).role)
  if (!role) notFound()

  // Fetch live DB stats for admin; skip for other roles
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
      <h1 className="page-title">{role.icon} {role.name}</h1>
      <p className="page-sub">{role.summary}</p>
      {!isLive && (
        <div className="banner banner-warn" style={{ margin: '14px 0' }}>
          <span aria-hidden="true">🧪</span>
          <div>Preview with sample data. Live data appears once sign-in and the backend API are connected.</div>
        </div>
      )}
      {View}
    </div>
  )
}
