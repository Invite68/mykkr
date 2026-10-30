'use client'

/**
 * SubscriptionBanner — shows subscription status at the top of dashboards.
 *
 * States:
 *   - Active: shows renewal date (subtle, dismissable)
 *   - Trialing: shows trial days remaining + CTA to subscribe
 *   - Past due / expired / cancelled: prominent warning with subscribe CTA
 *   - No subscription: prominent CTA (shouldn't happen post-registration but handled)
 *
 * Usage:
 *   <SubscriptionBanner idToken={idToken} plan="business" />
 *
 * Security: reads /api/subscriptions/status (auth required) — no PII shown.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface SubStatus {
  hasSubscription: boolean
  status:          string | null
  plan:            string | null
  trialEndsAt:     string | null
  trialDaysLeft:   number | null
  periodEnd:       string | null
}

interface Props {
  idToken: string
  plan?:   'business' | 'customer'
}

export default function SubscriptionBanner({ idToken, plan }: Props) {
  const [sub, setSub]       = useState<SubStatus | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!idToken) return
    let mounted = true
    fetch('/api/subscriptions/status', {
      headers: { Authorization: `Bearer ${idToken}` },
      cache: 'no-store',
    })
      .then(r => r.ok ? r.json() : null)
      .then((data: SubStatus | null) => { if (mounted) setSub(data) })
      .catch(() => { /* non-fatal — banner just won't show */ })
    return () => { mounted = false }
  }, [idToken])

  // Don't render until we know the status
  if (!sub) return null
  // Hide if active and dismissed
  if (dismissed && sub.status === 'active') return null

  const subscribePlan = plan ?? sub.plan ?? 'customer'
  const subscribeHref = `/subscribe?plan=${subscribePlan}`

  // ── Active ─────────────────────────────────────────────────────────────────
  if (sub.status === 'active') {
    const renewDate = sub.periodEnd
      ? new Date(sub.periodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : null
    return (
      <div className="banner banner-ok" role="status" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Subscription active{renewDate ? ` · renews ${renewDate}` : ''}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: 'inherit', opacity: 0.6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    )
  }

  // ── Trialing ────────────────────────────────────────────────────────────────
  if (sub.status === 'trialing') {
    const daysLeft = sub.trialDaysLeft ?? 0
    const urgency  = daysLeft <= 2 ? '#ef4444' : daysLeft <= 4 ? '#f59e0b' : '#2563eb'
    return (
      <div className="banner" style={{ background: `${urgency}14`, borderColor: `${urgency}40`, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={urgency} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          <span style={{ color: urgency, fontWeight: 600 }}>
            {daysLeft === 0
              ? 'Trial ends today!'
              : daysLeft === 1
              ? 'Trial ends tomorrow!'
              : `${daysLeft} days left in your free trial`}
          </span>
        </div>
        <Link href={subscribeHref} className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 12 }}>
          Subscribe now
        </Link>
      </div>
    )
  }

  // ── Past due / cancelled / expired / no subscription ────────────────────────
  const isWarning = sub.status === 'past_due'
  const isCancelled = sub.status === 'cancelled' || sub.status === 'expired' || !sub.hasSubscription

  return (
    <div className={`banner banner-warn`} style={{ justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span>
          {isWarning
            ? 'Payment failed — please update your payment method to keep listings active.'
            : isCancelled
            ? 'Subscription cancelled — listings are paused. Resubscribe to go live again.'
            : 'No active subscription — subscribe to publish listings.'}
        </span>
      </div>
      <Link href={subscribeHref} className="btn btn-accent" style={{ padding: '4px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
        {isCancelled ? 'Resubscribe' : 'Fix payment'}
      </Link>
    </div>
  )
}
