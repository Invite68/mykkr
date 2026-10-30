/**
 * /subscribe/return
 *
 * Razorpay redirects here after the customer completes (or cancels) checkout.
 * Query params injected by Razorpay:
 *   razorpay_subscription_id — the subscription ID
 *   razorpay_payment_id      — payment ID (only on success)
 *   razorpay_signature       — HMAC signature (only on success)
 *
 * We DO NOT verify the signature here — that already happened in the webhook.
 * This page is purely a UX landing; source of truth is the webhook → DB.
 *
 * We poll /api/auth/me for up to 10 s to see if status has flipped to active,
 * then redirect to the appropriate dashboard.
 */

import type { Metadata } from 'next'
import { Suspense } from 'react'
import SubscribeReturn from './SubscribeReturn'

export const metadata: Metadata = {
  title: 'Subscription — My KKR',
  robots: 'noindex,nofollow',
}

export default function SubscribeReturnPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ maxWidth: 480, paddingTop: 60, textAlign: 'center' }}>
        <p className="muted">Loading…</p>
      </div>
    }>
      <SubscribeReturn />
    </Suspense>
  )
}
