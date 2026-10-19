import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { ROLES } from '@/config/roles'

export const metadata: Metadata = {
  title: 'Dashboards',
  // Dashboards are user-specific — never index them in search engines
  robots: { index: false, follow: false },
}

export default function DashboardIndex() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Dashboards' }]} />
      <h1 className="page-title">Dashboards</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>One dashboard per role. Previews use sample data until sign-in goes live.</p>
      <div className="cat-grid">
        {ROLES.map((r) => (
          <Link key={r.id} href={`/dashboard/${r.id}`} className="cat-tile">
            <span className="cat-tile-icon" aria-hidden="true">{r.icon}</span>
            <span className="cat-tile-name">{r.name}</span>
            <span className="cat-tile-hi">{r.summary}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
