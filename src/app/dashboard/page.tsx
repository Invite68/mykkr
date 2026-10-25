import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Dashboards — My KKR',
  robots: { index: false, follow: false },
}

function IconBusiness() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function IconCustomer() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function IconDriver() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
function IconAdmin() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}

const DEMO_ACCOUNTS = [
  {
    role: 'Business Owner',
    href: '/dashboard/business',
    Icon: IconBusiness,
    color: '#12343b',
    name: 'Sharma Kirana Store',
    whatYouSee: 'Incoming orders, booking calendar, profile editor, subscription status, earnings summary.',
  },
  {
    role: 'Customer',
    href: '/dashboard/customer',
    Icon: IconCustomer,
    color: '#0f766e',
    name: 'Demo Customer',
    whatYouSee: 'My orders & bookings, quick actions (post a requirement, book a service, request a ride), favourites.',
  },
  {
    role: 'Delivery Driver',
    href: '/dashboard/driver',
    Icon: IconDriver,
    color: '#b45309',
    name: 'Demo Driver',
    whatYouSee: "Live job board with available deliveries, today's earnings, navigation links.",
  },
]

export default function DashboardIndex() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Dashboards' }]} />
      <h1 className="page-title">Dashboards</h1>
      <p className="page-sub" style={{ marginBottom: 20 }}>
        Each role has a different dashboard. Browse the previews below to see what a Business Owner,
        Customer, and Driver will see after logging in.
      </p>

      {/* What is the dashboard? */}
      <div className="panel" style={{ marginBottom: 20 }}>
        <h2 className="panel-title">What is the Dashboard?</h2>
        <p className="prose">
          When a user logs in to My KKR, they land on their personal dashboard. What they see depends on their role:
        </p>
        <ul className="prose" style={{ paddingLeft: 20, marginTop: 8 }}>
          <li><strong>Business Owner</strong> — manages orders, bookings, their shop profile, and subscription.</li>
          <li><strong>Customer</strong> — tracks orders and bookings, posts requirements, requests rides.</li>
          <li><strong>Driver</strong> — picks up delivery/ride jobs from a live board, sees earnings.</li>
          <li><strong>Admin</strong> — platform analytics, KYC approvals, subscription revenue (admin-only access).</li>
        </ul>
        <p className="muted" style={{ marginTop: 10 }}>
          These are currently previews with sample data. Once Firebase sign-in is connected, each user sees only their own data.
        </p>
      </div>

      {/* Demo accounts */}
      <h2 className="panel-title" style={{ marginBottom: 12 }}>Explore each role</h2>
      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', marginBottom: 24 }}>
        {DEMO_ACCOUNTS.map((a) => (
          <div key={a.role} className="panel" style={{ borderTop: `4px solid ${a.color}`, gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ color: a.color }}>
                <a.Icon />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: a.color }}>{a.role}</div>
                <div className="muted" style={{ fontSize: 12 }}>{a.name}</div>
              </div>
            </div>
            <p className="prose" style={{ fontSize: 13, marginBottom: 12 }}>
              {a.whatYouSee}
            </p>
            <Link href={a.href} className="btn btn-outline btn-sm" style={{ display: 'block', textAlign: 'center', borderColor: a.color, color: a.color }}>
              View {a.role} Dashboard
            </Link>
          </div>
        ))}
      </div>

      {/* Admin link */}
      <div className="panel" style={{ borderTop: '4px solid #7c3aed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ color: '#7c3aed' }}><IconAdmin /></div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#7c3aed' }}>Platform Admin</div>
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Platform-wide analytics, business KYC approvals, subscription revenue. Admins are invited only — not self-registered.
        </p>
        <Link href="/dashboard/admin" className="btn btn-outline btn-sm" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
          View Admin Dashboard
        </Link>
      </div>
    </div>
  )
}
