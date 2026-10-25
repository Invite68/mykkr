import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { DIRECT_PAYMENT_METHODS, GST_RATE, PLANS, SUBSCRIPTION_GATEWAY, formatInr, withGst } from '@/config/platform'

export const metadata: Metadata = { title: 'Pricing — My KKR' }

/** Competitor comparison — honest and factual */
const COMPARE_ROWS = [
  { feature: 'Monthly cost for businesses', mykkr: '₹99 + GST', amazon: '₹499–₹3,999', urban: '₹0 (30% commission!)' },
  { feature: 'Commission on each sale', mykkr: '0%', amazon: '5–18%', urban: '25–35%' },
  { feature: 'Customer pays business directly', mykkr: 'Yes — always', amazon: 'No — Amazon holds', urban: 'No — Platform holds' },
  { feature: 'Local discovery (Kurukshetra)', mykkr: 'Yes — hyper-local', amazon: 'No — all-India only', urban: 'Yes — city level' },
  { feature: 'Rides & delivery included', mykkr: 'Yes', amazon: 'No', urban: 'Partial' },
  { feature: 'Venues & real estate', mykkr: 'Yes', amazon: 'No', urban: 'No' },
  { feature: 'WhatsApp / direct contact', mykkr: 'Yes — unlimited', amazon: 'No', urban: 'No — blocked' },
  { feature: 'Setup time', mykkr: '< 5 minutes', amazon: '3–7 days', urban: '2–3 days' },
]

export default function PricingPage() {
  const { business, customer } = PLANS
  const gstPct = Math.round(GST_RATE * 100)

  return (
    <div className="container narrow">
      <Breadcrumbs items={[{ label: 'Pricing' }]} />

      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 className="page-title" style={{ marginBottom: 8 }}>Simple, honest pricing</h1>
        <p style={{ color: 'var(--text-3)', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
          No commission. No hidden fees. Keep every rupee from every sale.
        </p>
      </div>

      {/* ── Plans ───────────────────────────────────────────────── */}
      <div className="price-grid">
        <div className="price-card">
          <div className="price-name">{customer.name}</div>
          <div className="price-amount">{formatInr(customer.priceInr)}</div>
          <div className="price-period">per month + {gstPct}% GST ({formatInr(withGst(customer.priceInr))} total)</div>
          <span className="price-trial">{customer.trialDays}-day free trial · no card needed</span>
          <ul className="price-features">{customer.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/register?role=customer" className="btn btn-outline btn-block">Start free trial →</Link>
        </div>

        <div className="price-card featured">
          <span className="price-pill">Most popular · For businesses</span>
          <div className="price-name">{business.name}</div>
          <div className="price-amount">{formatInr(business.priceInr)}</div>
          <div className="price-period">per month + {gstPct}% GST ({formatInr(withGst(business.priceInr))} total)</div>
          <span className="price-trial">Unlimited listings · 0% commission</span>
          <ul className="price-features">{business.features.map((f) => <li key={f}>{f}</li>)}</ul>
          <Link href="/register?role=business" className="btn btn-primary btn-block">List your business →</Link>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,.5)', textAlign: 'center', marginTop: 8 }}>
            Less than printing 100 flyers — runs 24/7
          </p>
        </div>

        <div className="price-card">
          <div className="price-name">Delivery Driver / Partner</div>
          <div className="price-amount">₹0</div>
          <div className="price-period">no subscription · no commission ever</div>
          <span className="price-trial">Keep 100% of every fare</span>
          <ul className="price-features">
            <li>See delivery &amp; ride jobs nearby</li>
            <li>Customers pay you directly — UPI / cash</li>
            <li>Verified partner badge after KYC</li>
            <li>Set your own rates</li>
          </ul>
          <Link href="/register?role=driver" className="btn btn-outline btn-block">Become a driver →</Link>
        </div>
      </div>

      {/* ── Zero commission banner ───────────────────────────────── */}
      <div className="banner banner-ok" style={{ marginTop: 20 }}>
        <span aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
        <div>
          <strong>My KKR takes zero commission on sales, bookings and deliveries.</strong>{' '}
          Customers pay businesses and drivers directly ({DIRECT_PAYMENT_METHODS.join(' / ')}).
          The only money My KKR collects is the subscription above, processed by {SUBSCRIPTION_GATEWAY} —
          we never see or store card or UPI details.
        </div>
      </div>

      {/* ── Competitor comparison table ──────────────────────────── */}
      <section style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--night-d)', marginBottom: 16, letterSpacing: '-.3px' }}>
          How My KKR compares
        </h2>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="compare-col compare-col--mykkr">My KKR</th>
                <th className="compare-col">Amazon/Flipkart</th>
                <th className="compare-col">UrbanClap/Blinkit</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td className="compare-col compare-col--mykkr compare-val--good">{row.mykkr}</td>
                  <td className="compare-col">{row.amazon}</td>
                  <td className="compare-col">{row.urban}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-4)', marginTop: 8 }}>
          * Comparison based on publicly available pricing as of 2024. Verify independently.
        </p>
      </section>

      {/* ── FAQs ────────────────────────────────────────────────── */}
      <section style={{ marginTop: 36 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--night-d)', marginBottom: 16 }}>Frequently asked questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((faq) => (
            <details key={faq.q} className="faq-item">
              <summary className="faq-q">{faq.q}</summary>
              <p className="faq-a">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', padding: '32px 0 8px' }}>
        <Link href="/register?role=business" className="btn btn-accent btn-lg">
          Start free — list your business →
        </Link>
        <p style={{ marginTop: 10, fontSize: 12.5, color: 'var(--text-3)' }}>
          No credit card required to sign up. 7-day free trial for customers.
        </p>
      </div>
    </div>
  )
}

const FAQS = [
  {
    q: 'Does My KKR take any cut from my sales?',
    a: 'Never. Zero commission — ever. You pay ₹99 + GST per month and keep 100% of every rupee from every sale, booking, or delivery. Customers pay you directly by UPI, cash, or card.',
  },
  {
    q: 'What payment methods can my customers use?',
    a: 'That\'s between you and your customer — UPI, Google Pay, PhonePe, cash, card, or whatever you both agree on. My KKR is not involved in any transaction between you and your customers.',
  },
  {
    q: 'What happens after my subscription expires?',
    a: 'Your profile stays visible but listings are hidden behind a paywall overlay. Renew anytime and listings return immediately.',
  },
  {
    q: 'Can I list multiple types of offerings?',
    a: 'Yes. One ₹99/month subscription covers unlimited goods, services, task/gig listings, and venues. Everything from one profile.',
  },
  {
    q: 'Is the customer subscription required to browse?',
    a: 'Browsing business profiles is free for everyone. The ₹9.99/month customer plan unlocks full contact details, booking flows, and WhatsApp direct access. The 7-day trial has no credit card.',
  },
]
