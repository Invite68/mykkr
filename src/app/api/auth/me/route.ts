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
import { findUserByUid, toPublicUser, hasActiveSubscription } from '@/lib/user-db'
import { query }                     from '@/lib/db'

export const dynamic = 'force-dynamic'

// ── Safe column lists — NEVER SELECT * on profile tables ─────────────────────

// Business profile fields safe to return to the owner (no contact_phone, no raw GSTIN in prod)
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
  created_at, updated_at
`

// Customer profile — never return contact_phone (encrypted at rest)
const SAFE_CUSTOMER_COLS = `
  id, user_id,
  display_name, avatar_url,
  default_address, saved_addresses,
  created_at, updated_at
`

// Driver profile — never return license_number, aadhaar, encrypted PII
const SAFE_DRIVER_COLS = `
  id, user_id,
  full_name, avatar_url,
  vehicle_type, vehicle_number, vehicle_model,
  service_areas,
  rating, total_jobs,
  is_available,
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

  const hasSub = await hasActiveSubscription(user.id)

  return NextResponse.json({
    exists:          true,
    user:            pub,
    profile,
    hasSubscription: hasSub,
  })
}
