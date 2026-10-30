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
 *   200 { exists: true, user, profile, hasSubscription }
 *   200 { exists: false }   ← deliberate: same shape, no timing leak
 *   401 — missing or invalid token
 *
 * Security:
 *   - Firebase Auth required
 *   - SELECT * NEVER used — explicit safe column lists only
 *   - contact_phone / license_number / encrypted PII never returned
 *   - { exists: false } returned (not 404) to prevent user enumeration
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { findUserByUid, toPublicUser } from '@/lib/user-db'
import { query }                     from '@/lib/db'

// Subscription fields safe to return to the owner
const SAFE_SUB_COLS = `
  status, plan,
  trial_ends_at,
  current_period_start, current_period_end,
  cancelled_at,
  razorpay_sub_id
`

export const dynamic = 'force-dynamic'

// ── Safe column lists — NEVER SELECT * on profile tables ─────────────────────

// Business profile fields safe to return to the owner
// NOTE: contact_phone excluded (encrypted at rest)
const SAFE_BUSINESS_COLS = `
  id, user_id, slug, business_name, description,
  category, sub_category,
  logo_url, photo_urls,
  address_line, city, state, pin_code,
  lat, lon,
  contact_email, website_url,
  opening_time, closing_time, open_days,
  delivery_modes,
  gstin,
  kyc_status, verified_at, is_active,
  created_at, updated_at
`

// Customer profile — match actual customer_profiles schema
const SAFE_CUSTOMER_COLS = `
  id, user_id,
  full_name, email,
  area, city, state, pin_code,
  created_at, updated_at
`

// Driver profile — never return license_number, aadhaar (encrypted PII)
const SAFE_DRIVER_COLS = `
  id, user_id,
  full_name,
  vehicle_type, vehicle_number,
  working_area, city, state,
  kyc_status, is_active,
  created_at, updated_at
`

// ─────────────────────────────────────────────────────────────────────────────

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
    // Return exists:false with a tiny artificial delay to make timing-based
    // user enumeration harder (attacker can't distinguish "not found" from
    // "found but fetching profile").
    await new Promise((r) => setTimeout(r, 20 + Math.random() * 30))
    return NextResponse.json({ exists: false }, { status: 200 })
  }

  const pub = toPublicUser(user)

  // ── Load role-specific profile (explicit columns only) ────────────────────────
  let profile = null
  try {
    if (user.role === 'business') {
      const rows = await query<Record<string, unknown>>(
        `SELECT ${SAFE_BUSINESS_COLS} FROM business_profiles WHERE user_id = $1 LIMIT 1`,
        [user.id]
      )
      profile = rows[0] ?? null
    } else if (user.role === 'customer') {
      const rows = await query<Record<string, unknown>>(
        `SELECT ${SAFE_CUSTOMER_COLS} FROM customer_profiles WHERE user_id = $1 LIMIT 1`,
        [user.id]
      )
      profile = rows[0] ?? null
    } else if (user.role === 'driver') {
      const rows = await query<Record<string, unknown>>(
        `SELECT ${SAFE_DRIVER_COLS} FROM driver_profiles WHERE user_id = $1 LIMIT 1`,
        [user.id]
      )
      profile = rows[0] ?? null
    }
  } catch (err) {
    console.error('[GET /api/auth/me] Profile fetch error:', err)
    // Profile load error is non-fatal — return user info without profile
    profile = null
  }

  // ── Load subscription details ──────────────────────────────────────────────────
  let subscription: Record<string, unknown> | null = null
  try {
    const subRows = await query<Record<string, unknown>>(
      `SELECT ${SAFE_SUB_COLS}
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    )
    subscription = subRows[0] ?? null
  } catch (err) {
    console.error('[GET /api/auth/me] Subscription fetch error:', err)
    subscription = null
  }

  const hasSub = subscription?.status === 'active' || subscription?.status === 'trialing'

  return NextResponse.json({
    exists:          true,
    user:            pub,
    profile,
    subscription,
    hasSubscription: hasSub,
    // Convenience alias — keeps SubscribeReturn polling simple
    role:            user.role,
  })
}
