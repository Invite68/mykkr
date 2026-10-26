/**
 * Business Portal — Subscription & Help
 * Brand: teal (#12343b) × gold (#e1b382) × white
 */

import type { Metadata } from 'next'
import { PLANS, formatInr, withGst } from '@/config/platform'

export const metadata: Metadata = {
  title: 'Subscription — My KKR Business Portal',
  robots: 'noindex,nofollow',
}

const C = {
  panel:   '#132b32',
  panelB:  '#1e3d47',
  card:    '#0e2028',
  gold:    '#e1b382',
  goldBg:  'rgba(225,179,130,0.10)',
  goldB:   'rgba(225,179,130,0.22)',
  text1:   '#f0f4f5',
  text2:   '#8fb3bc',
  text3:   '#4a7a88',
  teal:    '#12343b',
  tealMid: '#2d545e',
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
    a: 'Service businesses can add up to 5 service listings. Goods businesses can add up to 18 product listings. This keeps the platform quality high and your shop focused and professional.',
  },
  {
    q: 'How do I get a GST invoice for my subscription payment?',
    a: 'GST invoices are generated automatically and emailed to you after each monthly payment. You can also download them from the Billing section below. My KKR\'s GSTIN is available on all invoices.',
  },
]

const INCLUDES = [
  'Full business profile — cover photo, logo, portfolio, service prices',
  'Orders, bookings, and customer inquiries through the app',
  'Customer messaging via in-app chat',
  'Ratings and reviews from verified customers',
  'Analytics: views, jobs, orders, customer breakdown',
  'Partner delivery driver network access',
  'Google Maps pin and location-based discovery',
  'Hindi + English listing support',
  'Priority in local search results',
  'Zero commission on any customer transaction — ever',
]

export default function SubscriptionPage() {
  const bizPrice = withGst(PLANS.business.priceInr)

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Billing & Support</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: C.text1, margin: 0, letterSpacing: -0.4 }}>Your Plan</h1>
      </div>

      {/* Active plan hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealMid} 100%)`,
        borderRadius: 14, padding: '22px 24px', marginBottom: 20,
        border: `1.5px solid ${C.goldB}`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative ring */}
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: C.goldBg, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, position: 'relative' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', marginBottom: 6, letterSpacing: 0.8, textTransform: 'uppercase' }}>Currently active</div>
            <div style={{ fontWeight: 900, fontSize: 22, color: C.text1, letterSpacing: -0.4 }}>{PLANS.business.name}</div>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.gold, marginTop: 4 }}>
              {formatInr(bizPrice)}<span style={{ fontSize: 12, fontWeight: 500, color: C.text2, marginLeft: 4 }}>/month incl. GST</span>
            </div>
          </div>
          <span style={{
            background: 'rgba(34,197,94,0.18)', color: '#4ade80',
            border: '1px solid rgba(34,197,94,0.35)',
            fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99,
          }}>Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, position: 'relative' }}>
          {[
            { label: 'Next renewal',     value: '1 Nov 2026' },
            { label: 'Payment method',   value: 'Razorpay auto' },
            { label: 'Member since',     value: 'Apr 2026' },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: 10, color: C.text3, fontWeight: 600, marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What's included */}
      <div style={{ background: C.panel, borderRadius: 12, padding: '18px 20px', marginBottom: 20, border: `1px solid ${C.panelB}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text1, marginBottom: 14 }}>What the Business Plan includes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {INCLUDES.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: C.text2 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Billing history */}
      <div style={{ background: C.panel, borderRadius: 12, overflow: 'hidden', marginBottom: 20, border: `1px solid ${C.panelB}` }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.panelB}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Billing history</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 340 }}>
            <thead>
              <tr style={{ background: C.card }}>
                {['Date', 'Amount', 'Status', 'Invoice'].map(h => (
                  <td key={h} style={{ fontSize: 10, fontWeight: 700, color: C.text3, padding: '10px 16px', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</td>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: '1 Oct 2026', amount: formatInr(bizPrice), inv: 'KKR-B-20261001' },
                { date: '1 Sep 2026', amount: formatInr(bizPrice), inv: 'KKR-B-20260901' },
                { date: '1 Aug 2026', amount: formatInr(bizPrice), inv: 'KKR-B-20260801' },
                { date: '1 Jul 2026', amount: formatInr(bizPrice), inv: 'KKR-B-20260701' },
              ].map(({ date, amount, inv }, i, arr) => (
                <tr key={inv}>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: C.text2, borderBottom: i < arr.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>{date}</td>
                  <td style={{ padding: '11px 16px', fontSize: 12, color: C.text1, fontWeight: 800, borderBottom: i < arr.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>{amount}</td>
                  <td style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>
                    <span style={{ background: 'rgba(34,197,94,0.14)', color: '#4ade80', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: '1px solid rgba(34,197,94,0.28)' }}>Paid</span>
                  </td>
                  <td style={{ padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>
                    <button style={{ background: 'transparent', border: 'none', color: C.gold, fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      {inv}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contact support */}
      <div style={{ fontSize: 11, color: C.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 12 }}>Help Centre</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {[
          {
            label: 'WhatsApp support',
            desc: 'Chat with us — replies in under 2 hours',
            href: 'https://wa.me/919876543210',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
              </svg>
            ),
          },
          {
            label: 'Email support',
            desc: 'support@mykkr.in · reply in 24 hrs',
            href: 'mailto:support@mykkr.in',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            ),
          },
          {
            label: 'Report an issue',
            desc: 'Bugs, listings, account problems',
            href: 'mailto:bugs@mykkr.in',
            icon: (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            ),
          },
        ].map((c) => (
          <a key={c.label} href={c.href} style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            padding: '16px 14px', borderRadius: 12, textDecoration: 'none',
            background: C.panel, border: `1px solid ${C.goldB}`,
          }}>
            {c.icon}
            <div style={{ fontWeight: 700, fontSize: 13, color: C.text1 }}>{c.label}</div>
            <div style={{ fontSize: 11, color: C.text3 }}>{c.desc}</div>
          </a>
        ))}
      </div>

      {/* FAQ */}
      <div style={{ background: C.panel, borderRadius: 12, overflow: 'hidden', marginBottom: 20, border: `1px solid ${C.panelB}` }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.panelB}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Frequently asked questions</div>
        </div>
        {FAQ.map(({ q, a }, i) => (
          <div key={q} style={{
            padding: '16px 20px',
            borderBottom: i < FAQ.length - 1 ? `1px solid ${C.panelB}` : 'none',
          }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.gold, marginBottom: 6 }}>{q}</div>
            <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.65 }}>{a}</div>
          </div>
        ))}
      </div>

      {/* Cancel */}
      <div style={{
        background: 'rgba(127,29,29,0.18)', borderRadius: 12, padding: '16px 20px',
        marginBottom: 20, border: '1px solid rgba(185,28,28,0.30)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fca5a5', marginBottom: 6 }}>Cancel subscription</div>
        <div style={{ fontSize: 12, color: C.text2, marginBottom: 14, lineHeight: 1.6 }}>
          If you cancel, your profile stays live until 1 Nov 2026 (end of current billing period). After that your listings are hidden from customers. You can reactivate at any time.
        </div>
        <button style={{
          padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(185,28,28,0.50)',
          background: 'transparent', color: '#f87171', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        }}>
          Cancel my plan
        </button>
      </div>

      {/* Disclaimer */}
      <div style={{
        padding: '12px 16px', borderRadius: 8,
        background: C.card, border: `1px solid ${C.panelB}`,
        fontSize: 11, color: C.text3, lineHeight: 1.65,
      }}>
        <strong style={{ color: C.text2 }}>Disclaimer:</strong> My KKR is strictly a listing and booking connector. My KKR takes no responsibility for disputes, delivery quality, payment issues, or refunds between businesses and customers. All such matters are solely between the relevant users. By using My KKR you confirm you have read and agreed to our Terms of Use.
      </div>
    </>
  )
}
