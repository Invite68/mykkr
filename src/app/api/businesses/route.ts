/**
 * POST /api/businesses
 *
 * Create or update a business profile for the authenticated user.
 * Called during Phase 2 of registration (BusinessWizard → final step).
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body (JSON) — all fields validated server-side:
 *   businessName, ownerName, dateOfBirth (YYYY-MM-DD, must be 18+),
 *   termsAccepted (boolean — must be true), privacyAccepted (boolean — must be true),
 *   termsVersion (string — identifies which T&C version was accepted),
 *   category, subCategory?,
 *   description?, logoUrl?, photoUrls?,
 *   gstin?, addressLine?, city, state, pinCode?,
 *   lat?, lon?,
 *   contactPhone?, contactEmail?, websiteUrl?,
 *   openingTime?, closingTime?, openDays?,
 *   deliveryModes?
 *
 * Consent audit: terms_accepted_at, terms_version, terms_ip are written to the
 * users table exactly once — on first creation. They are NEVER overwritten.
 * The client-supplied timestamp is ignored; we use the server clock.
 *
 * Response:
 *   201 { profile } — created
 *   200 { profile } — updated
 *   400 — validation error
 *   401 — not authenticated
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }  from '@/lib/firebase-admin'
import { apiLimiter, checkLimit } from '@/lib/rate-limit'
import { upsertUserOnLogin, toPublicUser } from '@/lib/user-db'
import { encryptPII }   from '@/lib/encrypt'
import { query }        from '@/lib/db'
import { stripContactDetails } from '@/lib/sanitize'
import { validatePublicUrl } from '@/lib/url-validate'

// Valid top-level categories (must match platform.ts / category seed)
const VALID_CATEGORIES = [
  'Groceries & Daily Essentials',
  'Food & Beverages',
  'Fashion & Lifestyle',
  'Hospitality & Venues',
  'Transportation',
  'Home & Professional Services',
  'Real Estate & Commercial Spaces',
]

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
    + '-' + Math.random().toString(36).slice(2, 7)
}

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
    businessName, ownerName, dateOfBirth,
    termsAccepted, privacyAccepted, termsVersion,
    category, subCategory,
    description, logoUrl, photoUrls,
    gstin, addressLine, city, state, pinCode,
    lat, lon,
    contactPhone, contactEmail, websiteUrl,
    openingTime, closingTime, openDays,
    deliveryModes,
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

  // ── Field validation ──────────────────────────────────────────────────────────
  if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
    return NextResponse.json({ error: 'businessName is required (min 2 chars)' }, { status: 400 })
  }
  if (!ownerName || typeof ownerName !== 'string' || ownerName.trim().length < 2) {
    return NextResponse.json({ error: 'ownerName is required (min 2 chars)' }, { status: 400 })
  }
  if (!category || !VALID_CATEGORIES.includes(String(category))) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  // ── Sanitize ──────────────────────────────────────────────────────────────────
  const dobStr     = dobDate.toISOString().split('T')[0]          // YYYY-MM-DD
  const ownerStr   = String(ownerName).trim().slice(0, 120)
  const termsVer   = termsVersion ? String(termsVersion).trim().slice(0, 40) : 'v1.0'
  const nameStr    = String(businessName).trim().slice(0, 120)
  const descRaw    = description ? String(description).trim().slice(0, 2000) : null
  const descStr    = descRaw ? stripContactDetails(descRaw).value : null
  const catStr     = String(category).trim()
  const subCatStr  = subCategory ? String(subCategory).trim().slice(0, 80) : null
  const cityStr    = String(city).trim().slice(0, 80)
  const stateStr   = state ? String(state).trim().slice(0, 80) : 'Haryana'
  const addrStr    = addressLine ? String(addressLine).trim().slice(0, 300) : null
  const pinStr     = pinCode ? String(pinCode).trim().slice(0, 10) : null
  const gstinStr   = gstin ? String(gstin).trim().toUpperCase().slice(0, 20) : null
  // ── URL validation (SSRF prevention) ─────────────────────────────────────────
  const rawLogoUrl = logoUrl ? String(logoUrl).slice(0, 500) : null
  const rawPhotoUrls = Array.isArray(photoUrls) ? (photoUrls as string[]).slice(0, 10).map(u => String(u).slice(0, 500)) : []
  const rawWebsiteUrl = websiteUrl ? String(websiteUrl).trim().slice(0, 300) : null

  if (rawLogoUrl) {
    const v = validatePublicUrl(rawLogoUrl)
    if (!v.ok) return NextResponse.json({ error: `logoUrl: ${v.reason}` }, { status: 400 })
  }
  for (const u of rawPhotoUrls) {
    const v = validatePublicUrl(u)
    if (!v.ok) return NextResponse.json({ error: `photoUrls: ${v.reason}` }, { status: 400 })
  }
  if (rawWebsiteUrl) {
    const v = validatePublicUrl(rawWebsiteUrl)
    if (!v.ok) return NextResponse.json({ error: `websiteUrl: ${v.reason}` }, { status: 400 })
  }

  const logoStr    = rawLogoUrl
  const photos     = rawPhotoUrls
  const openDaysArr = Array.isArray(openDays) ? (openDays as string[]).slice(0, 7) : []
  const delivArr   = Array.isArray(deliveryModes) ? (deliveryModes as string[]).slice(0, 3) : []
  const openTime   = openingTime ? String(openingTime).trim().slice(0, 10) : null
  const closeTime  = closingTime ? String(closingTime).trim().slice(0, 10) : null
  const emailStr   = contactEmail ? String(contactEmail).trim().slice(0, 200) : null
  const webStr     = rawWebsiteUrl

  // Encrypt contact phone before storage
  const encContactPhone = contactPhone ? encryptPII(String(contactPhone).trim().slice(0, 20)) : null

  const latN  = lat  != null ? Number(lat)  : null
  const lonN  = lon  != null ? Number(lon)  : null
  if (latN !== null && (isNaN(latN) || latN < 6 || latN > 37))   return NextResponse.json({ error: 'lat out of range' }, { status: 400 })
  if (lonN !== null && (isNaN(lonN) || lonN < 68 || lonN > 97)) return NextResponse.json({ error: 'lon out of range' }, { status: 400 })

  // ── Upsert user ───────────────────────────────────────────────────────────────
  const { user } = await upsertUserOnLogin({
    firebaseUid: auth.uid,
    phone:       auth.phone,
    role:        'business',
  })

  // ── Record consent (only on first acceptance; never overwrite) ────────────────
  // IP is best-effort: X-Forwarded-For may be spoofed, but it's standard practice.
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

  // ── Upsert business profile ───────────────────────────────────────────────────
  const existing = await query('SELECT id FROM business_profiles WHERE user_id = $1', [user.id])
  let profile: Record<string, unknown>

  if (existing.length > 0) {
    // Update — owner_dob not overwritten after first set (COALESCE)
    const rows = await query(
      `UPDATE business_profiles SET
         business_name  = $1, description   = $2, category      = $3,
         sub_category   = $4, logo_url       = $5, photo_urls    = $6,
         gstin          = $7, address_line   = $8, city          = $9,
         state          = $10, pin_code       = $11, lat          = $12,
         lon            = $13, contact_phone  = $14, contact_email = $15,
         website_url    = $16, opening_time   = $17, closing_time  = $18,
         open_days      = $19, delivery_modes = $20,
         owner_dob      = COALESCE(owner_dob, $21),
         updated_at     = NOW()
       WHERE user_id = $22
       RETURNING *`,
      [
        nameStr, descStr, catStr, subCatStr, logoStr, photos,
        gstinStr, addrStr, cityStr, stateStr, pinStr,
        latN, lonN, encContactPhone, emailStr, webStr,
        openTime, closeTime, openDaysArr, delivArr,
        dobStr,
        user.id,
      ]
    )
    profile = rows[0] as Record<string, unknown>
    // Strip encrypted phone and DOB from response (DOB is PII — never return to client)
    delete profile.contact_phone
    delete profile.owner_dob
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 200 })
  } else {
    // Insert
    const slug = makeSlug(nameStr)
    const rows = await query(
      `INSERT INTO business_profiles (
         user_id, business_name, slug, description, category, sub_category,
         logo_url, photo_urls, gstin, address_line, city, state, pin_code,
         lat, lon, contact_phone, contact_email, website_url,
         opening_time, closing_time, open_days, delivery_modes,
         owner_dob
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
         $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
       )
       RETURNING *`,
      [
        user.id, nameStr, slug, descStr, catStr, subCatStr,
        logoStr, photos, gstinStr, addrStr, cityStr, stateStr, pinStr,
        latN, lonN, encContactPhone, emailStr, webStr,
        openTime, closeTime, openDaysArr, delivArr,
        dobStr,
      ]
    )
    profile = rows[0] as Record<string, unknown>
    delete profile.contact_phone
    delete profile.owner_dob
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 201 })
  }
}
