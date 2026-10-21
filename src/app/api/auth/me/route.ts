/**
 * GET /api/auth/me
 *
 * Returns the current user's profile based on their Firebase ID token.
 * Called by the client immediately after OTP verification to check:
 *   1. Whether the user exists in our DB
 *   2. Whether their profile is complete
 *   3. Their subscription status
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Responses:
 *   200 { user, profile: null, hasSubscription: false }   — new user, no profile yet
 *   200 { user, profile: {...}, hasSubscription: true/false }
 *   401 — missing or invalid token
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }           from '@/lib/firebase-admin'
import { findUserByUid, toPublicUser, hasActiveSubscription } from '@/lib/user-db'
import { query }                 from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  // ── Lookup user ───────────────────────────────────────────────────────────────
  const user = await findUserByUid(auth.uid)
  if (!user) {
    return NextResponse.json({ exists: false }, { status: 200 })
  }

  const pub = toPublicUser(user)

  // ── Load role-specific profile ────────────────────────────────────────────────
  let profile = null
  if (user.role === 'business') {
    const rows = await query('SELECT * FROM business_profiles WHERE user_id = $1 LIMIT 1', [user.id])
    profile = rows[0] ?? null
  } else if (user.role === 'customer') {
    const rows = await query('SELECT * FROM customer_profiles WHERE user_id = $1 LIMIT 1', [user.id])
    profile = rows[0] ?? null
  } else if (user.role === 'driver') {
    const rows = await query('SELECT * FROM driver_profiles WHERE user_id = $1 LIMIT 1', [user.id])
    profile = rows[0] ?? null
  }

  const hasSub = await hasActiveSubscription(user.id)

  return NextResponse.json({
    exists:          true,
    user:            pub,
    profile,
    hasSubscription: hasSub,
  })
}
