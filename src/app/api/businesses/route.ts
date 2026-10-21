/**
 * POST /api/businesses
 *
 * Create or update a business profile for the authenticated user.
 * Called during Phase 2 of registration (BusinessWizard → final step).
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body (JSON) — all fields validated server-side:
 *   businessName, category, subCategory?,
 *   description?, logoUrl?, photoUrls?,
 *   gstin?, addressLine?, city, state, pinCode?,
 *   lat?, lon?,
 *   contactPhone?, contactEmail?, websiteUrl?,
 *   openingTime?, closingTime?, openDays?,
 *   deliveryModes?
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
    businessName, category, subCategory,
    description, logoUrl, photoUrls,
    gstin, addressLine, city, state, pinCode,
    lat, lon,
    contactPhone, contactEmail, websiteUrl,
    openingTime, closingTime, openDays,
    deliveryModes,
  } = body

  // ── Validation ────────────────────────────────────────────────────────────────
  if (!businessName || typeof businessName !== 'string' || businessName.trim().length < 2) {
    return NextResponse.json({ error: 'businessName is required (min 2 chars)' }, { status: 400 })
  }
  if (!category || !VALID_CATEGORIES.includes(String(category))) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }
  if (!city || typeof city !== 'string' || city.trim().length < 2) {
    return NextResponse.json({ error: 'city is required' }, { status: 400 })
  }

  // ── Sanitize ──────────────────────────────────────────────────────────────────
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
  const logoStr    = logoUrl ? String(logoUrl).slice(0, 500) : null
  const photos     = Array.isArray(photoUrls) ? (photoUrls as string[]).slice(0, 10).map(u => String(u).slice(0, 500)) : []
  const openDaysArr = Array.isArray(openDays) ? (openDays as string[]).slice(0, 7) : []
  const delivArr   = Array.isArray(deliveryModes) ? (deliveryModes as string[]).slice(0, 3) : []
  const openTime   = openingTime ? String(openingTime).trim().slice(0, 10) : null
  const closeTime  = closingTime ? String(closingTime).trim().slice(0, 10) : null
  const emailStr   = contactEmail ? String(contactEmail).trim().slice(0, 200) : null
  const webStr     = websiteUrl ? String(websiteUrl).trim().slice(0, 300) : null

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

  // ── Upsert business profile ───────────────────────────────────────────────────
  const existing = await query('SELECT id FROM business_profiles WHERE user_id = $1', [user.id])
  let profile: Record<string, unknown>

  if (existing.length > 0) {
    // Update
    const rows = await query(
      `UPDATE business_profiles SET
         business_name  = $1, description   = $2, category      = $3,
         sub_category   = $4, logo_url       = $5, photo_urls    = $6,
         gstin          = $7, address_line   = $8, city          = $9,
         state          = $10, pin_code       = $11, lat          = $12,
         lon            = $13, contact_phone  = $14, contact_email = $15,
         website_url    = $16, opening_time   = $17, closing_time  = $18,
         open_days      = $19, delivery_modes = $20, updated_at    = NOW()
       WHERE user_id = $21
       RETURNING *`,
      [
        nameStr, descStr, catStr, subCatStr, logoStr, photos,
        gstinStr, addrStr, cityStr, stateStr, pinStr,
        latN, lonN, encContactPhone, emailStr, webStr,
        openTime, closeTime, openDaysArr, delivArr,
        user.id,
      ]
    )
    profile = rows[0] as Record<string, unknown>
    // Strip encrypted phone from response
    delete profile.contact_phone
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 200 })
  } else {
    // Insert
    const slug = makeSlug(nameStr)
    const rows = await query(
      `INSERT INTO business_profiles (
         user_id, business_name, slug, description, category, sub_category,
         logo_url, photo_urls, gstin, address_line, city, state, pin_code,
         lat, lon, contact_phone, contact_email, website_url,
         opening_time, closing_time, open_days, delivery_modes
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
         $14, $15, $16, $17, $18, $19, $20, $21, $22
       )
       RETURNING *`,
      [
        user.id, nameStr, slug, descStr, catStr, subCatStr,
        logoStr, photos, gstinStr, addrStr, cityStr, stateStr, pinStr,
        latN, lonN, encContactPhone, emailStr, webStr,
        openTime, closeTime, openDaysArr, delivArr,
      ]
    )
    profile = rows[0] as Record<string, unknown>
    delete profile.contact_phone
    return NextResponse.json({ profile, user: toPublicUser(user) }, { status: 201 })
  }
}
