import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = {
  title: 'Dashboards — My KKR',
  robots: { index: false, follow: false },
}

// Demo account credentials for exploration
const DEMO_ACCOUNTS = [
  {
    role: 'Business Owner',
    href: '/dashboard/business',
    emoji: '🏪',
    color: '#12343b',
    name: 'Sharma Kirana Store',
    phone: '+91 98765 00001',
    pin: '1234',
    whatYouSee: 'Incoming orders, booking calendar, profile editor, subscription status, earnings summary.',
  },
  {
    role: 'Customer',
    href: '/dashboard/customer',
    emoji: '🙋',
    color: '#0f766e',
    name: 'Demo Customer',
    phone: '+91 98765 00002',
    pin: '1234',
    whatYouSee: 'My orders & bookings, quick actions (post a requirement, book a service, request a ride), favourites.',
  },
  {
    role: 'Delivery Driver',
    href: '/dashboard/driver',
    emoji: '🏍️',
    color: '#b45309',
    name: 'Demo Driver',
    phone: '+91 98765 00003',
    pin: '1234',
    whatYouSee: 'Live job board with available deliveries, today\'s earnings, navigation links.',
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 28 }}>{a.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: a.color }}>{a.role}</div>
                <div className="muted" style={{ fontSize: 12 }}>{a.name}</div>
              </div>
            </div>
            <p className="prose" style={{ fontSize: 13, marginBottom: 12 }}>
              {a.whatYouSee}
            </p>
            <Link href={a.href} className="btn btn-outline btn-sm" style={{ display: 'block', textAlign: 'center', borderColor: a.color, color: a.color }}>
              View {a.role} Dashboard →
            </Link>
          </div>
        ))}
      </div>

      {/* Admin link */}
      <div className="panel" style={{ borderTop: '4px solid #7c3aed' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>🛡️</span>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#7c3aed' }}>Platform Admin</div>
        </div>
        <p className="muted" style={{ fontSize: 13, marginBottom: 12 }}>
          Platform-wide analytics, business KYC approvals, subscription revenue. Admins are invited only — not self-registered.
        </p>
        <Link href="/dashboard/admin" className="btn btn-outline btn-sm" style={{ borderColor: '#7c3aed', color: '#7c3aed' }}>
          View Admin Dashboard →
        </Link>
      </div>
    </div>
  )
}
