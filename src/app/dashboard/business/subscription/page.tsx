/**
 * Business Portal — Subscription & Help
 * Plan status, billing, invoices, help centre, contact My KKR.
 */

import Link from 'next/link'
import type { Metadata } from 'next'
import { PLANS, formatInr, withGst } from '@/config/platform'

export const metadata: Metadata = {
  title: 'Subscription — My KKR Business Portal',
  robots: 'noindex,nofollow',
}

const FAQ = [
  {
    q: 'Does My KKR take any commission on my sales?',
    a: 'No. My KKR is a connection platform only. You pay a flat monthly subscription. All customer payments (goods, services, deliveries) go directly from the customer to you — via UPI, card, wallet, or cash. My KKR keeps nothing from those transactions.',
  },
  {
    q: 'How do I accept payments from customers?',
    a: 'You decide: UPI (Google Pay, PhonePe, Paytm), debit/credit card, wallet, or cash on delivery. My KKR does not handle customer-to-business payments. When you agree to a booking or order, share your UPI ID or preferred payment method directly with the customer.',
  },
  {
    q: 'What happens if a customer disputes a payment or order?',
    a: 'My KKR is not involved in disputes between customers and businesses. By agreeing to the platform terms, both parties confirm that all disputes, refunds, and quality issues are between themselves. You should resolve these directly — ideally through in-app chat for a clear paper trail.',
  },
  {
    q: 'Can I pause or cancel my subscription?',
    a: 'Yes. You can cancel any time from this page. Access continues until the end of the billing period. After cancellation your profile is hidden from customers. There are no refunds for partial months.',
  },
  {
    q: 'Can I list unlimited products and services?',
    a: 'Yes. The Business Plan gives you unlimited listings across all categories: goods, services, venues, and tasks/gigs.',
  },
  {
    q: 'How do I get a GST invoice for my subscription payment?',
    a: 'GST invoices are generated automatically and emailed to you after each monthly payment. You can also download them from the Billing section below. My KKR\'s GSTIN is available on all invoices.',
  },
]

export default function SubscriptionPage() {
  const bizPrice = withGst(PLANS.business.priceInr)

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>Subscription &amp; Help</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: '#f1f5f9', margin: 0 }}>Your Plan</h1>
      </div>

      {/* Active plan card */}
      <div style={{
        background: 'linear-gradient(135deg, #12343b 0%, #0f4c4c 100%)',
        borderRadius: 14, padding: 20, marginBottom: 20,
        border: '1.5px solid #0d9488',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: '#f9731610' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#34d399', marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>Currently active</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: '#f1f5f9' }}>{PLANS.business.name}</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: '#6ee7b7', marginTop: 4 }}>
              {formatInr(bizPrice)}/month
              <span style={{ fontSize: 11, fontWeight: 500, marginLeft: 4 }}>(incl. 18% GST)</span>
            </div>
          </div>
          <span style={{
            background: '#16a34a', color: '#fff',
            fontSize: 12, fontWeight: 800, padding: '6px 14px', borderRadius: 99,
          }}>Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 16 }}>
          {[
            { label: 'Next renewal', value: '1 Nov 2026' },
            { label: 'Payment method', value: 'Razorpay auto-charge' },
            { label: 'On plan since', value: 'Apr 2026' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: '#34d399', fontWeight: 600, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e2e8f0' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e3a50' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>What the Business Plan includes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Unlimited product, service, gig, and venue listings',
            'Full business profile — cover photo, logo, portfolio, service prices',
            'Orders, bookings, and inquiries through the app',
            'Customer messaging (in-app chat)',
            'Ratings and reviews from verified customers',
            'Analytics: views, jobs, orders, customer breakdown',
            'Partner delivery driver network access',
            'Google Maps pin and location-based discovery',
            'Hindi + English listing support',
            '₹0 commission on any customer transaction — ever',
          ].map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#94a3b8' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Billing history */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e3a50' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>Billing history</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 360 }}>
            <thead>
              <tr>
                {['Date', 'Amount', 'Status', 'Invoice'].map(h => (
                  <td key={h} style={{ fontSize: 11, fontWeight: 700, color: '#475569', padding: '6px 8px', borderBottom: '1px solid #1e2d3a' }}>{h}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: '1 Oct 2026', amount: formatInr(bizPrice), status: 'Paid', inv: 'KKR-B-20261001' },
                { date: '1 Sep 2026', amount: formatInr(bizPrice), status: 'Paid', inv: 'KKR-B-20260901' },
                { date: '1 Aug 2026', amount: formatInr(bizPrice), status: 'Paid', inv: 'KKR-B-20260801' },
                { date: '1 Jul 2026', amount: formatInr(bizPrice), status: 'Paid', inv: 'KKR-B-20260701' },
              ].map(({ date, amount, status, inv }) => (
                <tr key={inv}>
                  <td style={{ padding: '9px 8px', fontSize: 12, color: '#94a3b8', borderBottom: '1px solid #1e2030' }}>{date}</td>
                  <td style={{ padding: '9px 8px', fontSize: 12, color: '#f1f5f9', fontWeight: 700, borderBottom: '1px solid #1e2030' }}>{amount}</td>
                  <td style={{ padding: '9px 8px', borderBottom: '1px solid #1e2030' }}>
                    <span style={{ background: '#16a34a18', color: '#4ade80', fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 99, border: '1px solid #16a34a30' }}>{status}</span>
                  </td>
                  <td style={{ padding: '9px 8px', fontSize: 11, borderBottom: '1px solid #1e2030' }}>
                    <button style={{ background: 'transparent', border: 'none', color: '#f97316', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {inv}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel plan */}
      <div style={{ background: '#1a1010', borderRadius: 12, padding: 16, marginBottom: 28, border: '1.5px solid #3f1a1a' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fca5a5', marginBottom: 6 }}>Cancel subscription</div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>
          If you cancel, your profile stays live until 1 Nov 2026 (end of current billing period). After that your listings are hidden from customers. You can reactivate at any time.
        </div>
        <button style={{
          padding: '9px 16px', borderRadius: 8, border: '1.5px solid #7f1d1d',
          background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>
          Cancel my plan
        </button>
      </div>

      {/* ── HELP SECTION ────────────────────────────────────────────────────── */}
      <div style={{ fontSize: 11, fontWeight: 800, color: '#f97316', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Help Centre</div>

      {/* Contact My KKR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          {
            label: 'WhatsApp support',
            desc: 'Chat with us on WhatsApp — usually replies in under 2 hours',
            href: 'https://wa.me/919876543210',
            color: '#16a34a',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>,
          },
          {
            label: 'Email support',
            desc: 'support@mykkr.in — replies within 24 hours on business days',
            href: 'mailto:support@mykkr.in',
            color: '#0ea5e9',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
          },
          {
            label: 'Report an issue',
            desc: 'Platform bugs, incorrect listings, account problems',
            href: 'mailto:bugs@mykkr.in',
            color: '#dc2626',
            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
          },
        ].map((c) => (
          <a key={c.label} href={c.href} style={{
            display: 'flex', flexDirection: 'column', gap: 8,
            padding: 14, borderRadius: 12, textDecoration: 'none',
            background: '#1a2535', border: `1.5px solid ${c.color}30`,
          }}>
            <span style={{ color: c.color }}>{c.icon}</span>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{c.label}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{c.desc}</div>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, border: '1.5px solid #1e3a50' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 14 }}>Frequently asked questions</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {FAQ.map(({ q, a }, i) => (
            <div key={q} style={{ borderTop: i > 0 ? '1px solid #1e2d3a' : 'none', padding: '14px 0' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 6 }}>{q}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop: 20, padding: 12, borderRadius: 8,
        background: '#111827', border: '1px solid #1e3a50', fontSize: 11, color: '#475569',
        lineHeight: 1.6,
      }}>
        <strong style={{ color: '#64748b' }}>Disclaimer:</strong> My KKR is strictly a listing and booking connector. My KKR takes no responsibility for disputes, delivery quality, payment issues, or refunds between businesses and customers. All such matters are solely between the relevant users. By using My KKR you confirm you have read and agreed to our Terms of Use.
      </div>
    </>
  )
}
