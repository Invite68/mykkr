/**
 * POST /api/drivers
 *
 * Create or update a driver profile for the authenticated user.
 * Called during Phase 2 of registration (DriverWizard → final step).
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body (JSON) — all fields validated server-side:
 *   fullName, dateOfBirth (YYYY-MM-DD, must be 18+),
 *   termsAccepted (boolean — must be true), privacyAccepted (boolean — must be true),
 *   termsVersion (string — identifies which T&C version was accepted),
 *   vehicleType, vehicleNumber,
 *   licenseNumber?, aadhaarLast4?,
 *   workingArea?, city, state?
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
import { encryptPII }                from '@/lib/encrypt'
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
    vehicleType, vehicleNumber, licenseNumber, aadhaarLast4, workingArea, city, state,
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
  if (!vehicleType || typeof vehicleType !== 'string' || vehicleType.trim().length < 2) {
    return NextResponse.json({ error: 'vehicleType is required' }, { status: 400 })
  }
  if (!vehicleNumber || typeof vehicleNumber !== 'string' || vehicleNumber.trim().length < 4) {
    return NextResponse.json({ error: 'vehicleNumber is required (min 4 chars)' }, { status: 400 })
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  // ── Sanitize ──────────────────────────────────────────────────────────────────
  const dobStr         = dobDate.toISOString().split('T')[0]           // YYYY-MM-DD
  const termsVer       = termsVersion ? String(termsVersion).trim().slice(0, 40) : 'v1.0'
  const nameStr        = String(fullName).trim().slice(0, 120)
  const vehicleTypeStr = String(vehicleType).trim().slice(0, 60)
  const vehicleNumStr  = String(vehicleNumber).trim().toUpperCase().slice(0, 20)
  const cityStr        = String(city).trim().slice(0, 80)
  const stateStr       = state       ? String(state).trim().slice(0, 80)        : 'Haryana'
  const workAreaStr    = workingArea ? String(workingArea).trim().slice(0, 200) : null

  // Aadhaar: store only last 4 digits — never full number
  const aadhaarStr = aadhaarLast4
    ? String(aadhaarLast4).replace(/\D/g, '').slice(-4)
    : null

  // Encrypt driver license number (PII)
  const encLicense = licenseNumber
    ? encryptPII(String(licenseNumber).trim().slice(0, 50))
    : null

  // ── Upsert user ───────────────────────────────────────────────────────────────
  const { user } = await upsertUserOnLogin({
    firebaseUid:  auth.uid,
    phone:        auth.phone,
    role:         'driver',
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

  // ── Upsert driver profile ─────────────────────────────────────────────────────
  const existing = await query('SELECT id FROM driver_profiles WHERE user_id = $1', [user.id])
  let profile: Record<string, unknown>

  if (existing.length > 0) {
    // date_of_birth not overwritten after first set (COALESCE)
    const rows = await query(
      `UPDATE driver_profiles SET
         full_name       = $1, vehicle_type  = $2, vehicle_number = $3,
         license_number  = $4, aadhaar_last4 = $5, working_area   = $6,
         city            = $7, state         = $8,
         date_of_birth   = COALESCE(date_of_birth, $9),
         updated_at      = NOW()
       WHERE user_id = $10
       RETURNING *`,
      [nameStr, vehicleTypeStr, vehicleNumStr, encLicense, aadhaarStr, workAreaStr, cityStr, stateStr, dobStr, user.id]
    )
    profile = rows[0] as Record<string, unknown>
    // Strip encrypted license and DOB from response (both are PII)
    delete profile.license_number
    delete profile.date_of_birth
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 200 })
  } else {
    const rows = await query(
      `INSERT INTO driver_profiles
         (user_id, full_name, vehicle_type, vehicle_number, license_number,
          aadhaar_last4, working_area, city, state, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [user.id, nameStr, vehicleTypeStr, vehicleNumStr, encLicense, aadhaarStr, workAreaStr, cityStr, stateStr, dobStr]
    )
    profile = rows[0] as Record<string, unknown>
    delete profile.license_number
    delete profile.date_of_birth
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 201 })
  }
}
