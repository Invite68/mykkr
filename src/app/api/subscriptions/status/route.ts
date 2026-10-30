/**
 * GET /api/subscriptions/status
 *
 * Return the authenticated user's current subscription status.
 * Used by dashboard subscription banners and gating logic.
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200 { hasSubscription, plan, status, trialEndsAt, periodEnd, razorpaySubId }
 *   401 — not authenticated
 *   404 — user not found
 *
 * Security:
 *   - Firebase Auth required
 *   - Only returns subscription of the authenticated user
 *   - razorpay_sub_id returned so client can link to Razorpay customer portal
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { findUserByUid }             from '@/lib/user-db'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'
import { query }                     from '@/lib/db'

export const dynamic = 'force-dynamic'

const SAFE_SUB_COLS = `
  status, plan,
  trial_ends_at,
  current_period_start,
  current_period_end,
  cancelled_at,
  razorpay_sub_id,
  created_at
`

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
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

  const rows = await query<Record<string, unknown>>(
    `SELECT ${SAFE_SUB_COLS}
     FROM subscriptions
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [user.id]
  )

  const sub = rows[0] ?? null
  const status    = sub?.status as string | null
  const hasSub    = status === 'active' || status === 'trialing'
  const planId    = sub?.plan as string | null
  const trialEnd  = sub?.trial_ends_at as string | null
  const periodEnd = sub?.current_period_end as string | null
  const rzpSubId  = sub?.razorpay_sub_id as string | null

  // Compute trial days remaining for customer plan
  let trialDaysLeft: number | null = null
  if (status === 'trialing' && trialEnd) {
    const msLeft = new Date(trialEnd).getTime() - Date.now()
    trialDaysLeft = Math.max(0, Math.ceil(msLeft / 86_400_000))
  }

  return NextResponse.json({
    hasSubscription: hasSub,
    status,
    plan:            planId,
    trialEndsAt:     trialEnd,
    trialDaysLeft,
    periodEnd,
    razorpaySubId:   rzpSubId,
    role:            user.role,
  })
}
