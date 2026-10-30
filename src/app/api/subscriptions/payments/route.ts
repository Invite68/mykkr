/**
 * GET /api/subscriptions/payments
 *
 * Returns the authenticated user's subscription payment history.
 * Used by the business subscription page billing table.
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200 { payments: Payment[] }
 *   401 — not authenticated
 *
 * Security:
 *   - Firebase Auth required
 *   - Only returns payments for the authenticated user
 *   - Explicit safe column list — no SELECT *
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { findUserByUid }             from '@/lib/user-db'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'
import { query }                     from '@/lib/db'

export const dynamic = 'force-dynamic'

const SAFE_PAYMENT_COLS = `
  sp.id,
  sp.razorpay_payment_id,
  sp.amount_paise,
  sp.status,
  sp.created_at
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
    `SELECT ${SAFE_PAYMENT_COLS}
     FROM subscription_payments sp
     JOIN subscriptions s ON s.id = sp.subscription_id
     WHERE s.user_id = $1
     ORDER BY sp.created_at DESC
     LIMIT 24`,
    [user.id]
  )

  return NextResponse.json({ payments: rows })
}
