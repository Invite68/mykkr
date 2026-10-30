/**
 * POST /api/subscriptions/cancel
 *
 * Cancels the authenticated user's active Razorpay subscription.
 * Sets cancel_at_cycle_end = true so access persists until period end.
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200 { ok: true, cancelAt: <ISO period_end> }
 *   400 — no active subscription to cancel
 *   401 — not authenticated
 *   500 — Razorpay error
 *
 * Security:
 *   - Firebase Auth required
 *   - razorpay_sub_id fetched from DB (never trusted from client)
 *   - Idempotent: cancelling an already-cancelled sub is a no-op
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { findUserByUid }             from '@/lib/user-db'
import { apiLimiter, checkLimit }    from '@/lib/rate-limit'
import { query }                     from '@/lib/db'
import { cancelSubscription }        from '@/lib/razorpay'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await findUserByUid(auth.uid)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Fetch subscription from DB — never trust client for this
  const rows = await query<{
    id: string
    razorpay_sub_id: string | null
    status: string
    current_period_end: string | null
  }>(
    `SELECT id, razorpay_sub_id, status, current_period_end
     FROM subscriptions
     WHERE user_id = $1
       AND status IN ('active', 'trialing', 'past_due')
     ORDER BY created_at DESC
     LIMIT 1`,
    [user.id]
  )

  const sub = rows[0]
  if (!sub) {
    return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 400 })
  }

  // Already cancelled — idempotent
  if (sub.status === 'cancelled' || sub.status === 'expired') {
    return NextResponse.json({ ok: true, cancelAt: sub.current_period_end })
  }

  // Cancel at Razorpay (cancel_at_cycle_end keeps access until period end)
  if (sub.razorpay_sub_id) {
    try {
      await cancelSubscription(sub.razorpay_sub_id)
    } catch (err) {
      console.error('[subscriptions/cancel] Razorpay error:', err)
      return NextResponse.json({ error: 'Failed to cancel with payment provider' }, { status: 500 })
    }
  }

  // Update local DB status to cancelled
  await query(
    `UPDATE subscriptions
     SET status = 'cancelled', cancelled_at = NOW()
     WHERE id = $1`,
    [sub.id]
  )

  return NextResponse.json({ ok: true, cancelAt: sub.current_period_end })
}
