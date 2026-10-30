'use client'

/**
 * /subscribe — Subscription checkout page.
 *
 * URL params:
 *   plan = 'business' | 'customer'
 *
 * Flow:
 *   1. Check Firebase auth → if not signed in, redirect to /register?next=/subscribe?plan=<plan>
 *   2. Check existing subscription via /api/subscriptions/status
 *      → if already active, redirect to appropriate dashboard
 *   3. Call POST /api/subscriptions/create → get Razorpay short_url
 *   4. Redirect to Razorpay hosted checkout
 *   5. Razorpay redirects back to /subscribe/return
 *
 * Security:
 *   - Zero PII sent to Razorpay from this page (only idToken → our backend)
 *   - RAZORPAY_KEY_ID is NOT embedded here — redirect via short_url only
 */

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'
import { PLANS, GST_RATE, formatInr, withGst, DISCLAIMER } from '@/config/platform'

type PlanId  = 'business' | 'customer'
type State   = 'init' | 'checking' | 'redirecting' | 'error'

export default function SubscribePage() {
  const router     = useRouter()
  const params     = useSearchParams()
  const planParam  = params.get('plan') as PlanId | null
  const plan: PlanId = planParam === 'business' || planParam === 'customer'
    ? planParam : 'customer'

  const [state, setState]  = useState<State>('init')
  const [error, setError]  = useState<string | null>(null)

  const planData = PLANS[plan]
  const gstPct   = Math.round(GST_RATE * 100)
  const totalInr = withGst(planData.priceInr)

  useEffect(() => {
    const auth = getAuth(firebaseApp)

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not signed in — send to register with return URL
        const next = encodeURIComponent(`/subscribe?plan=${plan}`)
        router.replace(`/register?next=${next}`)
        return
      }

      setState('checking')

      try {
        const idToken = await user.getIdToken()

        // Check if already subscribed
        const statusRes = await fetch('/api/subscriptions/status', {
          headers: { Authorization: `Bearer ${idToken}` },
          cache: 'no-store',
        })

        if (statusRes.ok) {
          const statusData = await statusRes.json() as {
            hasSubscription?: boolean
            role?: string
          }
          if (statusData.hasSubscription) {
            // Already active — go to dashboard
            const dash = statusData.role === 'business'
              ? '/dashboard/business'
              : statusData.role === 'customer'
              ? '/dashboard/customer'
              : '/dashboard'
            router.replace(dash)
            return
          }
        }

        // Create Razorpay subscription
        setState('redirecting')
        const createRes = await fetch('/api/subscriptions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ plan }),
        })

        if (!createRes.ok) {
          const data = await createRes.json() as { error?: string }
          throw new Error(data.error ?? `Server error ${createRes.status}`)
        }

        const createData = await createRes.json() as { shortUrl?: string }
        if (!createData.shortUrl) throw new Error('No checkout URL received')

        // Redirect to Razorpay hosted checkout
        window.location.href = createData.shortUrl

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong'
        setError(msg)
        setState('error')
      }
    })

    return () => unsub()
  }, [plan, router])

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 48 }}>
      <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
        {/* ── Plan summary ───────────────────────────────── */}
        <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>
          {planData.name}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>
          {formatInr(planData.priceInr)}/month + {gstPct}% GST = <strong>{formatInr(totalInr)}/month</strong>
          {plan === 'customer' && planData.trialDays > 0 && (
            <span> &middot; {planData.trialDays}-day free trial</span>
          )}
        </p>

        {/* ── State: init / checking ─────────────────────── */}
        {(state === 'init' || state === 'checking') && (
          <>
            <svg
              width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
              style={{ animation: 'spin 1s linear infinite', color: 'var(--night-d)', marginBottom: 14 }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <p className="muted">Checking your account…</p>
          </>
        )}

        {/* ── State: redirecting ─────────────────────────── */}
        {state === 'redirecting' && (
          <>
            <svg
              width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              aria-hidden="true"
              style={{ animation: 'spin 1s linear infinite', color: 'var(--night-d)', marginBottom: 14 }}
            >
              <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Taking you to secure checkout…</p>
            <p className="muted" style={{ fontSize: 12.5 }}>
              Powered by Razorpay. Your card details are never shared with My KKR.
            </p>
          </>
        )}

        {/* ── State: error ──────────────────────────────── */}
        {state === 'error' && (
          <>
            <div style={{ color: '#ef4444', marginBottom: 16 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p style={{ fontWeight: 700, marginBottom: 6 }}>Could not start checkout</p>
            <p className="muted" style={{ marginBottom: 20, fontSize: 13 }}>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => { setError(null); setState('init') }}
            >
              Try again
            </button>
            <div style={{ marginTop: 12 }}>
              <a href="/pricing" className="muted" style={{ fontSize: 12.5 }}>View pricing</a>
            </div>
          </>
        )}

        {/* ── Disclaimer ────────────────────────────────── */}
        <p style={{
          marginTop: 28,
          fontSize: 11,
          color: 'var(--text-4)',
          lineHeight: 1.5,
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
        }}>
          {DISCLAIMER}
        </p>
      </div>
    </div>
  )
}
