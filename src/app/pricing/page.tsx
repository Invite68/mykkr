import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { DIRECT_PAYMENT_METHODS, GST_RATE, PLANS, SUBSCRIPTION_GATEWAY, formatInr, withGst } from '@/config/platform'

export const metadata: Metadata = { title: 'Pricing' }

export default function PricingPage() {
  const { business, customer } = PLANS
  const gstPct = Math.round(GST_RATE * 100)

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Pricing' }]} />
      <h1 className="page-title">Simple, honest pricing</h1>
      <p className="page-sub" style={{ marginBottom: 24 }}>No commission. No hidden fees. Keep every rupee.</p>

      <div className="price-grid">
        <div className="price-card">
          <div className="price-name">{customer.name}</div>
          <div className="price-amount">{formatInr(customer.priceInr)}</div>
          <div className="price-period">per month + {gstPct}% GST ({formatInr(withGst(customer.priceInr))} total)</div>
          <span className="price-trial">{customer.trialDays}-day free trial</span>
          <ul className="price-features">{customer.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/register?role=customer" className="btn btn-outline btn-block">Start free trial →</Link>
        </div>

        <div className="price-card featured">
          <span className="price-pill">For businesses</span>
          <div className="price-name">{business.name}</div>
          <div className="price-amount">{formatInr(business.priceInr)}</div>
          <div className="price-period">per month + {gstPct}% GST ({formatInr(withGst(business.priceInr))} total)</div>
          <span className="price-trial">Unlimited listings</span>
          <ul className="price-features">{business.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/register?role=business" className="btn btn-primary btn-block">List your business →</Link>
        </div>

        <div className="price-card">
          <div className="price-name">Delivery Driver / Partner</div>
          <div className="price-amount">₹0</div>
          <div className="price-period">no subscription · no commission</div>
          <span className="price-trial">Keep 100% of fares</span>
          <ul className="price-features">
            <li>Receive delivery &amp; ride jobs nearby</li>
            <li>Customers pay you directly</li>
            <li>Verified partner badge after KYC</li>
          </ul>
          <Link href="/register?role=driver" className="btn btn-outline btn-block">Become a driver →</Link>
        </div>
      </div>

      <div className="banner banner-ok" style={{ marginTop: 20 }}>
        <span aria-hidden="true">🔒</span>
        <div>
          <strong>My KKR takes zero commission on sales, bookings and deliveries.</strong> Customers pay businesses and drivers directly
          ({DIRECT_PAYMENT_METHODS.join(' / ')}). The only money My KKR collects is the subscription above, processed by {SUBSCRIPTION_GATEWAY} —
          we never see or store card or UPI details.
        </div>
      </div>
    </div>
  )
}
