'use client'

/**
 * SubscribeReturn — client component for /subscribe/return.
 *
 * Razorpay sends the user here after checkout (success or cancel).
 * We read the URL params to decide what happened, then:
 *   - On success: poll /api/auth/me until subscription is active, then redirect
 *   - On cancel:  show a "you can subscribe later" message with a retry link
 *
 * The webhook is the source of truth — we just wait for it to land.
 */

import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { firebaseAuth } from '@/lib/firebase-client'

type State = 'checking' | 'activating' | 'active' | 'cancelled' | 'error'

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 8  // 16 seconds total

export default function SubscribeReturn() {
  const params   = useSearchParams()
  const router   = useRouter()
  const [state, setState]     = useState<State>('checking')
  const [role, setRole]       = useState<string>('')
  const [attempts, setAttempts] = useState(0)
  const pollRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  const paymentId = params.get('razorpay_payment_id')
  const subId     = params.get('razorpay_subscription_id')

  useEffect(() => {
    // No payment ID in URL = user cancelled or closed checkout
    if (!paymentId) {
      setState('cancelled')
      return
    }

    setState('activating')

    async function poll(attempt: number) {
      try {
        const user = firebaseAuth.currentUser
        if (!user) {
          // Not signed in — redirect to register
          router.replace('/register')
          return
        }
        const idToken = await user.getIdToken()
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${idToken}` },
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json() as {
            exists?: boolean
            role?: string
            hasSubscription?: boolean
            subscription?: { status?: string }
          }
          const subStatus = data.subscription?.status
          const userRole = data.role ?? ''
          setRole(userRole)

          if (data.hasSubscription || subStatus === 'active' || subStatus === 'trialing') {
            setState('active')
            // Redirect to the right dashboard after a short pause
            setTimeout(() => {
              router.replace(
                userRole === 'business' ? '/dashboard/business'
                : userRole === 'customer' ? '/dashboard/customer'
                : '/dashboard'
              )
            }, 2000)
            return
          }
        }
      } catch {
        // ignore, keep polling
      }

      if (attempt >= POLL_MAX_ATTEMPTS) {
        // Webhook hasn't fired yet — send them to dashboard anyway
        setState('active')
        setTimeout(() => router.replace('/dashboard'), 2000)
        return
      }

      setAttempts(attempt + 1)
      pollRef.current = setTimeout(() => poll(attempt + 1), POLL_INTERVAL_MS)
    }

    poll(0)
    return () => { if (pollRef.current) clearTimeout(pollRef.current) }
  }, [paymentId, router])

  const dashLink =
    role === 'business' ? '/dashboard/business'
    : role === 'customer' ? '/dashboard/customer'
    : '/dashboard'

  return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 60 }}>
      {state === 'checking' || state === 'activating' ? (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <svg
            width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            style={{ animation: 'spin 1s linear infinite', color: 'var(--night-d)', marginBottom: 18 }}
          >
            <circle cx="12" cy="12" r="10" strokeOpacity="0.2"/>
            <path d="M12 2a10 10 0 0 1 10 10"/>
          </svg>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            {state === 'checking' ? 'Verifying payment…' : 'Activating your account…'}
          </h1>
          <p className="muted">
            {state === 'activating' && attempts > 0
              ? `Waiting for confirmation… (${attempts}/${POLL_MAX_ATTEMPTS})`
              : 'Just a moment.'}
          </p>
        </div>
      ) : state === 'active' ? (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ color: '#10b981', marginBottom: 18 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
            You&rsquo;re in!
          </h1>
          <p className="muted" style={{ marginBottom: 6 }}>
            Your subscription is active. Taking you to your dashboard…
          </p>
          <p className="muted" style={{ fontSize: 12 }}>
            Ref: {subId ?? '—'}
          </p>
        </div>
      ) : state === 'cancelled' ? (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ color: '#f59e0b', marginBottom: 18 }}>
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
            Payment not completed
          </h1>
          <p className="muted" style={{ marginBottom: 24 }}>
            Your profile is saved. You can subscribe any time from your dashboard.
          </p>
          <a href={dashLink || '/dashboard'} className="btn btn-primary">
            Go to dashboard
          </a>
          <div style={{ marginTop: 12 }}>
            <a href="/pricing" className="muted" style={{ fontSize: 13 }}>
              View pricing &rarr;
            </a>
          </div>
        </div>
      ) : (
        <div className="panel" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <p className="muted">Something went wrong. <a href="/dashboard">Go to dashboard</a></p>
        </div>
      )}
    </div>
  )
}
