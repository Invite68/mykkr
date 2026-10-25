'use client'

import Link from 'next/link'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { PLANS, formatInr } from '@/config/platform'

interface SubscriptionCtx {
  /** Opens the "subscribe to contact" modal for a business */
  requestContact: (businessName: string) => void
}

const Ctx = createContext<SubscriptionCtx | null>(null)

export function useSubscription(): SubscriptionCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSubscription must be used inside <SubscriptionProvider>')
  return ctx
}

/**
 * Contact details are gated behind the customer subscription.
 * Until auth + Razorpay are wired (NestJS backend), every contact
 * request shows the subscribe modal.
 */
export default function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<string | null>(null)
  const close = useCallback(() => setTarget(null), [])
  const requestContact = useCallback((name: string) => setTarget(name), [])

  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, close])

  const plan = PLANS.customer

  return (
    <Ctx.Provider value={{ requestContact }}>
      {children}
      {target && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="sub-title" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={close} aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="modal-icon" aria-hidden="true">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div className="modal-title" id="sub-title">Subscribe to contact</div>
            <p className="muted">
              Unlock WhatsApp and phone details for <strong>{target}</strong> and every other business on My KKR.
            </p>
            <div className="modal-plan">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                <span>{plan.name}</span>
                <span>{formatInr(plan.priceInr)}<span className="muted"> + GST/mo</span></span>
              </div>
              <div className="muted">{plan.trialDays}-day free trial · Unlimited contacts · Cancel anytime</div>
            </div>
            <Link href="/register?role=customer" className="btn btn-primary btn-block" onClick={close}>
              Start {plan.trialDays}-day free trial →
            </Link>
            <p className="muted" style={{ marginTop: 10 }}>No payment needed during the trial.</p>
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
