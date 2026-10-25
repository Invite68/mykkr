import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import RegisterForms from '@/components/register/RegisterForms'
import { PLANS, formatInr } from '@/config/platform'
import { IconCalendar, IconChat, IconPricing, IconCheck } from '@/components/layout/NavIcons'

export const metadata: Metadata = { title: 'Sign in / Register' }

type SearchParams = Promise<{ role?: string }>

const BENEFITS = [
  { icon: <IconCalendar />, title: 'Live availability calendar', desc: 'Customers see exactly when you are free.' },
  { icon: <IconChat />, title: 'Direct WhatsApp & calls', desc: 'No middleman between you and your customer.' },
  { icon: <IconPricing />, title: 'Zero commission, ever', desc: `${formatInr(PLANS.business.priceInr)} + GST flat per month. Keep every rupee.` },
  { icon: <IconCheck />, title: 'Verified business badge', desc: 'Builds instant trust with new customers.' },
]

export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const { role } = await searchParams
  const initialRole = role === 'customer' || role === 'driver' ? role : 'business'

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Sign in / Register' }]} />
      <h1 className="page-title">Join My KKR</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>Phone OTP login &mdash; no passwords. Platform admins are invited, not self-registered.</p>
      <div className="split">
        <RegisterForms initialRole={initialRole} key={initialRole} />
        <aside>
          <div className="panel">
            <h2 className="panel-title">Why businesses choose My KKR</h2>
            <p className="muted" style={{ marginBottom: 12 }}>Less than printing 100 flyers &mdash; and it runs 24 hours a day.</p>
            <div className="form-grid">
              {BENEFITS.map((b) => (
                <div className="trust-item" key={b.title}>
                  <div className="trust-icon" aria-hidden="true">{b.icon}</div>
                  <div>
                    <div className="trust-title">{b.title}</div>
                    <div className="trust-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
