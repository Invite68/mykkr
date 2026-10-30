/**
 * POST /api/service-bookings
 * Customer creates a service booking request for a business.
 *
 * GET /api/service-bookings
 * Customer fetches their own service bookings (by customer_uid).
 *
 * Security:
 * - Firebase Auth required
 * - customer_phone encrypted before storage
 * - customer_uid always from auth token (never body)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }  from '@/lib/firebase-admin'
import { query }        from '@/lib/db'
import { encryptPII }   from '@/lib/encrypt'
import { apiLimiter, readLimiter, checkLimit } from '@/lib/rate-limit'

function makeRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `SVC-${s}`
}

const SAFE_COLS = `
  id, ref, customer_uid, business_uid, business_id,
  category, service_name, description,
  customer_name,
  address_label, address_lat, address_lon,
  requested_date, requested_time,
  quoted_price, status,
  accepted_at, rejected_at, completed_at, cancelled_at,
  reject_reason, cancel_reason,
  created_at, updated_at`

// ── GET — customer's own bookings ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query(
      `SELECT ${SAFE_COLS} FROM service_bookings
       WHERE customer_uid = $1
       ORDER BY created_at DESC LIMIT 50`,
      [auth.uid]
    )
    return NextResponse.json({ bookings: rows }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[GET /api/service-bookings]', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

// ── POST — create booking ─────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try { body = await req.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    businessUid, businessId,
    category, serviceName, description,
    customerName, customerPhone,
    addressLabel, addressLat, addressLon,
    requestedDate, requestedTime,
  } = body

  // Required field check
  const required = { businessUid, businessId, category, serviceName, customerName, customerPhone, addressLabel, requestedDate, requestedTime }
  for (const [k, v] of Object.entries(required)) {
    if (!v) return NextResponse.json({ error: `Missing: ${k}` }, { status: 400 })
  }

  const nameStr     = String(customerName).trim().slice(0, 120)
  const phoneStr    = String(customerPhone).trim().slice(0, 20)
  const addrStr     = String(addressLabel).trim().slice(0, 300)
  const descStr     = description ? String(description).trim().slice(0, 1000) : null
  const categoryStr = String(category).trim().slice(0, 60)
  const serviceStr  = String(serviceName).trim().slice(0, 120)
  const dateStr     = String(requestedDate).trim().slice(0, 20)
  const timeStr     = String(requestedTime).trim().slice(0, 20)
  const bizUidStr   = String(businessUid).trim().slice(0, 128)
  const bizIdStr    = String(businessId).trim().slice(0, 128)

  if (nameStr.length < 2)   return NextResponse.json({ error: 'customerName too short' }, { status: 400 })
  if (phoneStr.length < 10) return NextResponse.json({ error: 'customerPhone too short' }, { status: 400 })
  if (addrStr.length < 5)   return NextResponse.json({ error: 'addressLabel too short' }, { status: 400 })

  const latN = addressLat != null ? Number(addressLat) : null
  const lonN = addressLon != null ? Number(addressLon) : null

  // Encrypt customer phone before storage — never stored in plaintext
  const encPhone = encryptPII(phoneStr)

  const ref = makeRef()

  try {
    const rows = await query(
      `INSERT INTO service_bookings (
         ref, customer_uid, business_uid, business_id,
         category, service_name, description,
         customer_name, customer_phone,
         address_label, address_lat, address_lon,
         requested_date, requested_time
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, ref, status, created_at`,
      [
        ref, auth.uid, bizUidStr, bizIdStr,
        categoryStr, serviceStr, descStr,
        nameStr, encPhone,
        addrStr, latN, lonN,
        dateStr, timeStr,
      ]
    )
    return NextResponse.json({ booking: rows[0] }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/service-bookings]', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
