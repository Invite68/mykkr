/**
 * POST /api/customers
 *
 * Create or update a customer profile for the authenticated user.
 * Called during Phase 2 of registration (CustomerWizard → final step).
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body (JSON) — all fields validated server-side:
 *   fullName, dateOfBirth (YYYY-MM-DD, must be 18+),
 *   termsAccepted (boolean — must be true), privacyAccepted (boolean — must be true),
 *   termsVersion (string — identifies which T&C version was accepted),
 *   email?, area?, city, state?, pinCode?
 *
 * Consent audit: terms_accepted_at, terms_version, terms_ip are written to the
 * users table exactly once — on first creation. They are NEVER overwritten.
 * The client-supplied timestamp is ignored; we use the server clock.
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

  const {
    fullName, dateOfBirth,
    termsAccepted, privacyAccepted, termsVersion,
    email, area, city, state, pinCode,
  } = body

  // ── Consent validation (legal requirement — hard block) ───────────────────────
  if (termsAccepted !== true) {
    return NextResponse.json({ error: 'You must explicitly accept the Terms of Service to register.' }, { status: 400 })
  }
  if (privacyAccepted !== true) {
    return NextResponse.json({ error: 'You must explicitly accept the Privacy Policy to register.' }, { status: 400 })
  }

  // ── Age gate: must be 18+ ─────────────────────────────────────────────────────
  if (!dateOfBirth || typeof dateOfBirth !== 'string') {
    return NextResponse.json({ error: 'Date of birth is required.' }, { status: 400 })
  }
  const dobDate = new Date(dateOfBirth)
  if (isNaN(dobDate.getTime())) {
    return NextResponse.json({ error: 'Date of birth is invalid.' }, { status: 400 })
  }
  const today = new Date()
  const age = today.getFullYear() - dobDate.getFullYear()
    - (today < new Date(today.getFullYear(), dobDate.getMonth(), dobDate.getDate()) ? 1 : 0)
  if (age < 18) {
    return NextResponse.json({ error: 'You must be 18 or older to register.' }, { status: 400 })
  }

  // ── Validation ────────────────────────────────────────────────────────────────
  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return NextResponse.json({ error: 'fullName is required (min 2 chars)' }, { status: 400 })
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  // ── Sanitize ──────────────────────────────────────────────────────────────────
  const dobStr    = dobDate.toISOString().split('T')[0]           // YYYY-MM-DD
  const termsVer  = termsVersion ? String(termsVersion).trim().slice(0, 40) : 'v1.0'
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

  // ── Record consent (only on first acceptance; never overwrite) ────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
           ?? req.headers.get('x-real-ip')
           ?? 'unknown'
  await query(
    `UPDATE users
     SET terms_accepted_at = COALESCE(terms_accepted_at, NOW()),
         terms_version     = COALESCE(terms_version, $1),
         terms_ip          = COALESCE(terms_ip, $2)
     WHERE id = $3`,
    [termsVer, ip, user.id]
  )

  // ── Upsert customer profile ───────────────────────────────────────────────────
  const existing = await query('SELECT id FROM customer_profiles WHERE user_id = $1', [user.id])
  let profile: Record<string, unknown>

  if (existing.length > 0) {
    // date_of_birth not overwritten after first set (COALESCE)
    const rows = await query(
      `UPDATE customer_profiles SET
         full_name     = $1, email    = $2, area     = $3,
         city          = $4, state    = $5, pin_code = $6,
         date_of_birth = COALESCE(date_of_birth, $7),
         updated_at    = NOW()
       WHERE user_id = $8
       RETURNING *`,
      [nameStr, emailStr, areaStr, cityStr, stateStr, pinStr, dobStr, user.id]
    )
    profile = rows[0] as Record<string, unknown>
    // DOB is PII — never return to client
    delete profile.date_of_birth
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 200 })
  } else {
    const rows = await query(
      `INSERT INTO customer_profiles
         (user_id, full_name, email, area, city, state, pin_code, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user.id, nameStr, emailStr, areaStr, cityStr, stateStr, pinStr, dobStr]
    )
    profile = rows[0] as Record<string, unknown>
    delete profile.date_of_birth
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 201 })
  }
}
