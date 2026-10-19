import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { ROLES, getRole, type UserRole } from '@/config/roles'
import { PLANS, PLATFORM_COMMISSION_RATE, formatInr, withGst } from '@/config/platform'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'

type Params = Promise<{ role: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return ROLES.map((r) => ({ role: r.id }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return { title: `${getRole((await params).role)?.name ?? 'Dashboard'} dashboard` }
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
      <Kpis items={[['Orders this month', '42'], ['Bookings', '17'], ['Profile views', '1,284'], ['Commission paid', formatInr(PLATFORM_COMMISSION_RATE)]]} />
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
        <h2 className="panel-title">Available jobs near you</h2>
        <Table head={['Job', 'Pickup area', 'Type', 'Est. fare']} rows={[
          ['KKR-P4TZ', 'Sector 13', 'Bike delivery · 3 km', '₹30'],
          ['KKR-W8RN', 'Pipli', 'Tempo · 11 km', '₹242'],
          ['KKR-C2JD', 'Model Town', 'Bike delivery · 5 km', '₹40'],
        ]} />
        <p className="muted" style={{ marginTop: 10 }}>Flow: Accept job → Navigate → Mark picked up → Mark delivered → Photo proof.</p>
      </div>
    </>
  )
}

function AdminDash() {
  const verified = BUSINESSES.filter((b) => b.verified).length
  return (
    <>
      <Kpis items={[['Businesses', String(BUSINESSES.length)], ['Verified', String(verified)], ['Pending verification', String(BUSINESSES.length - verified)], ['Categories', String(CATEGORY_GROUPS.length)]]} />
      <div className="panel" style={{ marginTop: 14 }}>
        <h2 className="panel-title">Verification queue</h2>
        <Table head={['Business', 'Area', 'Status']} rows={BUSINESSES.filter((b) => !b.verified).map((b) => [b.name, b.area, 'Pending KYC'])} />
      </div>
      <div className="panel">
        <h2 className="panel-title">Plans</h2>
        <Table head={['Plan', 'Price', 'Trial']} rows={[
          [PLANS.business.name, `${formatInr(PLANS.business.priceInr)} + GST`, '—'],
          [PLANS.customer.name, `${formatInr(PLANS.customer.priceInr)} + GST`, `${PLANS.customer.trialDays} days`],
        ]} />
        <p className="muted" style={{ marginTop: 10 }}>Admins see analytics only. No access to customer ↔ business payments (there are none to see).</p>
      </div>
    </>
  )
}

const VIEWS: Record<UserRole, () => React.JSX.Element> = {
  business: BusinessDash,
  customer: CustomerDash,
  driver: DriverDash,
  admin: AdminDash,
}

export default async function RoleDashboard({ params }: { params: Params }) {
  const role = getRole((await params).role)
  if (!role) notFound()
  const View = VIEWS[role.id]

  return (
    <div className="container">
      <Breadcrumbs items={[{ href: '/dashboard', label: 'Dashboards' }, { label: role.name }]} />
      <h1 className="page-title">{role.icon} {role.name}</h1>
      <p className="page-sub">{role.summary}</p>
      <div className="banner banner-warn" style={{ margin: '14px 0' }}>
        <span aria-hidden="true">🧪</span>
        <div>Preview with sample data. Live data appears once sign-in and the backend API are connected.</div>
      </div>
      <View />
    </div>
  )
}
