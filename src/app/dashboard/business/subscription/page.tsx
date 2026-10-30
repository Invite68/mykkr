'use client'

/**
 * Business Portal — Subscription & Billing
 *
 * Fetches live subscription status from /api/subscriptions/status
 * and payment history from /api/subscriptions/payments.
 *
 * Security: auth required via Firebase ID token; no PII exposed.
 */

import type { Metadata } from 'next'
import { useEffect, useState } from 'react'
import { getFirebaseAuth } from '@/lib/firebase-client'
import { PLANS, formatInr, withGst } from '@/config/platform'
import Link from 'next/link'

// metadata export not supported in 'use client' — handled by parent layout
// export const metadata: Metadata = { ... }

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
    a: "GST invoices are generated automatically and emailed to you after each monthly payment. My KKR's GSTIN is available on all invoices.",
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

interface SubStatus {
  hasSubscription: boolean
  status:          string | null
  plan:            string | null
  trialEndsAt:     string | null
  trialDaysLeft:   number | null
  periodEnd:       string | null
  razorpaySubId:   string | null
}

interface Payment {
  id:                  number
  razorpay_payment_id: string
  amount_paise:        number
  status:              string
  created_at:          string
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SubscriptionPage() {
  const bizPrice = withGst(PLANS.business.priceInr)

  const [idToken,   setIdToken]   = useState<string | null>(null)
  const [sub,       setSub]       = useState<SubStatus | null>(null)
  const [payments,  setPayments]  = useState<Payment[]>([])
  const [loading,   setLoading]   = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelDone, setCancelDone] = useState(false)
  const [cancelErr,  setCancelErr]  = useState('')

  useEffect(() => {
    const unsub = getFirebaseAuth().onAuthStateChanged(async (user) => {
      if (!user) return
      try {
        const token = await user.getIdToken()
        setIdToken(token)

        const [subRes, payRes] = await Promise.all([
          fetch('/api/subscriptions/status',   { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
          fetch('/api/subscriptions/payments', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }),
        ])

        if (subRes.ok)  setSub(await subRes.json() as SubStatus)
        if (payRes.ok)  setPayments((await payRes.json() as { payments: Payment[] }).payments ?? [])
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [])

  async function handleCancel() {
    if (!idToken) return
    setCancelling(true); setCancelErr('')
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Could not cancel')
      }
      setCancelDone(true)
    } catch (e) {
      setCancelErr(e instanceof Error ? e.message : 'Error cancelling subscription')
    } finally {
      setCancelling(false)
    }
  }

  const isActive   = sub?.status === 'active' || sub?.status === 'trialing'
  const statusBadge = (() => {
    switch (sub?.status) {
      case 'active':   return { label: 'Active',    bg: 'rgba(34,197,94,0.18)',   color: '#4ade80', border: 'rgba(34,197,94,0.35)' }
      case 'trialing': return { label: 'Trial',     bg: 'rgba(59,130,246,0.18)',  color: '#60a5fa', border: 'rgba(59,130,246,0.35)' }
      case 'past_due': return { label: 'Past due',  bg: 'rgba(251,191,36,0.18)', color: '#fbbf24', border: 'rgba(251,191,36,0.35)' }
      case 'cancelled':return { label: 'Cancelled', bg: 'rgba(239,68,68,0.18)',  color: '#f87171', border: 'rgba(239,68,68,0.35)' }
      default:         return { label: 'Inactive',  bg: 'rgba(100,116,139,0.18)',color: '#94a3b8', border: 'rgba(100,116,139,0.35)' }
    }
  })()

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Billing & Support</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: C.text1, margin: 0, letterSpacing: -0.4 }}>Your Plan</h1>
      </div>

      {/* Plan hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealMid} 100%)`,
        borderRadius: 14, padding: '22px 24px', marginBottom: 20,
        border: `1.5px solid ${C.goldB}`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: C.goldBg, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, position: 'relative' }}>
          <div>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text3, fontSize: 13 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity=".2"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                Loading…
              </div>
            ) : (
              <>
                <div style={{ fontSize: 10, fontWeight: 800, color: statusBadge.color, marginBottom: 6, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {sub?.status === 'trialing' ? `Free trial — ${sub.trialDaysLeft ?? 0} day${sub.trialDaysLeft === 1 ? '' : 's'} left` : statusBadge.label}
                </div>
                <div style={{ fontWeight: 900, fontSize: 22, color: C.text1, letterSpacing: -0.4 }}>{PLANS.business.name}</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.gold, marginTop: 4 }}>
                  {formatInr(bizPrice)}<span style={{ fontSize: 12, fontWeight: 500, color: C.text2, marginLeft: 4 }}>/month incl. GST</span>
                </div>
              </>
            )}
          </div>
          {!loading && (
            <span style={{
              background: statusBadge.bg, color: statusBadge.color,
              border: `1px solid ${statusBadge.border}`,
              fontSize: 11, fontWeight: 800, padding: '5px 12px', borderRadius: 99,
            }}>{statusBadge.label}</span>
          )}
        </div>

        {!loading && sub && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, position: 'relative' }}>
            {[
              { label: 'Next renewal', value: sub.periodEnd ? fmtDate(sub.periodEnd) : '—' },
              { label: 'Payment',      value: 'Razorpay auto' },
              { label: 'Trial ends',   value: sub.trialEndsAt ? fmtDate(sub.trialEndsAt) : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 600, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: C.text1 }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {!loading && !isActive && (
          <div style={{ marginTop: 16, position: 'relative' }}>
            <Link href="/subscribe?plan=business" className="btn btn-primary" style={{ fontSize: 13 }}>
              Subscribe now
            </Link>
          </div>
        )}
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

        {loading ? (
          <div style={{ padding: '24px 20px', color: C.text3, fontSize: 13, textAlign: 'center' }}>Loading payments…</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '24px 20px', color: C.text3, fontSize: 13, textAlign: 'center' }}>No payments recorded yet.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 340 }}>
              <thead>
                <tr style={{ background: C.card }}>
                  {['Date', 'Amount', 'Status', 'Ref'].map(h => (
                    <td key={h} style={{ fontSize: 10, fontWeight: 700, color: C.text3, padding: '10px 16px', textTransform: 'uppercase', letterSpacing: 0.4 }}>{h}</td>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p, i) => (
                  <tr key={p.id}>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: C.text2, borderBottom: i < payments.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>{fmtDate(p.created_at)}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: C.text1, fontWeight: 800, borderBottom: i < payments.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>{formatInr(p.amount_paise / 100)}</td>
                    <td style={{ padding: '11px 16px', borderBottom: i < payments.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>
                      <span style={{
                        background: p.status === 'captured' ? 'rgba(34,197,94,0.14)' : 'rgba(239,68,68,0.14)',
                        color: p.status === 'captured' ? '#4ade80' : '#f87171',
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        border: `1px solid ${p.status === 'captured' ? 'rgba(34,197,94,0.28)' : 'rgba(239,68,68,0.28)'}`,
                      }}>
                        {p.status === 'captured' ? 'Paid' : p.status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 11, color: C.text3, fontFamily: 'monospace', borderBottom: i < payments.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>
                      {p.razorpay_payment_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
          <div key={q} style={{ padding: '16px 20px', borderBottom: i < FAQ.length - 1 ? `1px solid ${C.panelB}` : 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: C.gold, marginBottom: 6 }}>{q}</div>
            <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.65 }}>{a}</div>
          </div>
        ))}
      </div>

      {/* Cancel */}
      {isActive && !cancelDone && (
        <div style={{
          background: 'rgba(127,29,29,0.18)', borderRadius: 12, padding: '16px 20px',
          marginBottom: 20, border: '1px solid rgba(185,28,28,0.30)',
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#fca5a5', marginBottom: 6 }}>Cancel subscription</div>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 14, lineHeight: 1.6 }}>
            If you cancel, your profile stays live until{' '}
            {sub?.periodEnd ? fmtDate(sub.periodEnd) : 'end of billing period'}.{' '}
            After that your listings are hidden from customers. You can reactivate at any time.
          </div>
          {cancelErr && (
            <p style={{ fontSize: 12, color: '#f87171', marginBottom: 10 }}>{cancelErr}</p>
          )}
          <button
            onClick={handleCancel}
            disabled={cancelling}
            style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(185,28,28,0.50)',
              background: 'transparent', color: '#f87171', cursor: cancelling ? 'wait' : 'pointer',
              fontSize: 13, fontWeight: 700, opacity: cancelling ? 0.6 : 1,
            }}
          >
            {cancelling ? 'Cancelling…' : 'Cancel my plan'}
          </button>
        </div>
      )}

      {cancelDone && (
        <div style={{ background: 'rgba(34,197,94,0.12)', borderRadius: 12, padding: '16px 20px', marginBottom: 20, border: '1px solid rgba(34,197,94,0.28)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#4ade80', marginBottom: 4 }}>Subscription cancelled</div>
          <div style={{ fontSize: 12, color: C.text2 }}>Your access continues until {sub?.periodEnd ? fmtDate(sub.periodEnd) : 'end of billing period'}.</div>
        </div>
      )}

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
