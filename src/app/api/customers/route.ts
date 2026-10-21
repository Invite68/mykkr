/**
 * POST /api/customers
 *
 * Create or update a customer profile for the authenticated user.
 * Called during Phase 2 of registration (CustomerWizard → final step).
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body (JSON):
 *   fullName, email?, area?, city, state?, pinCode?
 *
 * Response:
 *   201 { profile, user } — created
 *   200 { profile, user } — updated
 *   400 — validation error
 *   401 — not authenticated
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { upsertUserOnLogin, toPublicUser } from '@/lib/user-db'
import { query }                     from '@/lib/db'
import { apiLimiter, checkLimit }    from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  // ── Auth ─────────────────────────────────────────────────────────────────────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { fullName, email, area, city, state, pinCode } = body

  // ── Validation ────────────────────────────────────────────────────────────────
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return NextResponse.json({ error: 'fullName is required (min 2 chars)' }, { status: 400 })
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  // ── Sanitize ──────────────────────────────────────────────────────────────────
  const nameStr   = String(fullName).trim().slice(0, 120)
  const emailStr  = email   ? String(email).trim().slice(0, 200) : null
  const areaStr   = area    ? String(area).trim().slice(0, 200)  : null
  const cityStr   = String(city).trim().slice(0, 80)
  const stateStr  = state   ? String(state).trim().slice(0, 80)  : 'Haryana'
  const pinStr    = pinCode ? String(pinCode).trim().slice(0, 10) : null

  // ── Upsert user ───────────────────────────────────────────────────────────────
  const { user } = await upsertUserOnLogin({
    firebaseUid:  auth.uid,
    phone:        auth.phone,
    role:         'customer',
  })

  // Update display_name on users table
  await query('UPDATE users SET display_name = $1 WHERE id = $2', [nameStr, user.id])

  // ── Upsert customer profile ───────────────────────────────────────────────────
  const existing = await query('SELECT id FROM customer_profiles WHERE user_id = $1', [user.id])
  let profile: Record<string, unknown>

  if (existing.length > 0) {
    const rows = await query(
      `UPDATE customer_profiles SET
         full_name  = $1, email    = $2, area     = $3,
         city       = $4, state    = $5, pin_code = $6, updated_at = NOW()
       WHERE user_id = $7
       RETURNING *`,
      [nameStr, emailStr, areaStr, cityStr, stateStr, pinStr, user.id]
    )
    profile = rows[0] as Record<string, unknown>
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 200 })
  } else {
    const rows = await query(
      `INSERT INTO customer_profiles (user_id, full_name, email, area, city, state, pin_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user.id, nameStr, emailStr, areaStr, cityStr, stateStr, pinStr]
    )
    profile = rows[0] as Record<string, unknown>
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 201 })
  }
}
