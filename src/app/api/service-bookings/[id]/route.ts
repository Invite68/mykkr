/**
 * GET  /api/service-bookings/[id]  — fetch single booking (customer or business owner)
 * PATCH /api/service-bookings/[id] — business accepts/rejects, customer cancels
 *
 * PATCH body:
 *   action: 'accept' | 'reject' | 'cancel' | 'complete'
 *   reason?: string   (for reject/cancel)
 *   quotedPrice?: number  (business can set price on accept)
 *
 * Security:
 * - Firebase Auth required
 * - Role resolved server-side from DB (customer_uid vs business_uid)
 * - customer_phone NEVER returned in any response
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { apiLimiter, checkLimit } from '@/lib/rate-limit'

interface Booking {
  id: string
  ref: string
  customer_uid: string
  business_uid: string
  business_id: string
  category: string
  service_name: string
  description: string | null
  customer_name: string
  customer_phone: string  // encrypted — never returned
  address_label: string
  address_lat: number | null
  address_lon: number | null
  requested_date: string
  requested_time: string
  quoted_price: number | null
  status: string
  accepted_at: string | null
  rejected_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  reject_reason: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
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

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const rows = await query<Booking>(
    `SELECT ${SAFE_COLS} FROM service_bookings WHERE id = $1 LIMIT 1`,
    [id]
  )
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const b = rows[0]
  if (b.customer_uid !== auth.uid && b.business_uid !== auth.uid) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  return NextResponse.json({ booking: b })
}

// ── PATCH — accept / reject / cancel / complete ───────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let body: Record<string, unknown>
  try { body = await req.json() as Record<string, unknown> } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { action, reason, quotedPrice } = body
  if (!action || typeof action !== 'string') {
    return NextResponse.json({ error: 'action is required' }, { status: 400 })
  }

  // Fetch booking — use SAFE_COLS to never pull customer_phone into memory
  const rows = await query<Booking>(
    `SELECT ${SAFE_COLS} FROM service_bookings WHERE id = $1 LIMIT 1`,
    [id]
  )
  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const b = rows[0]

  // Derive role server-side — NEVER trust client
  const isCustomer = b.customer_uid === auth.uid
  const isBusiness = b.business_uid === auth.uid

  if (!isCustomer && !isBusiness) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 })
  }

  const reasonStr = reason ? String(reason).trim().slice(0, 500) : null
  const priceN    = quotedPrice != null ? Number(quotedPrice) : null

  // ── Accept (business only, from pending) ──────────────────────────────────
  if (action === 'accept') {
    if (!isBusiness) return NextResponse.json({ error: 'Only the business can accept' }, { status: 403 })
    if (b.status !== 'pending') return NextResponse.json({ error: `Cannot accept from status "${b.status}"` }, { status: 409 })

    const updated = await query(
      `UPDATE service_bookings SET
         status      = 'accepted',
         accepted_at = NOW(),
         quoted_price = COALESCE($1, quoted_price),
         updated_at  = NOW()
       WHERE id = $2
       RETURNING ${SAFE_COLS}`,
      [priceN, id]
    )
    return NextResponse.json({ booking: updated[0] })
  }

  // ── Reject (business only, from pending) ──────────────────────────────────
  if (action === 'reject') {
    if (!isBusiness) return NextResponse.json({ error: 'Only the business can reject' }, { status: 403 })
    if (b.status !== 'pending') return NextResponse.json({ error: `Cannot reject from status "${b.status}"` }, { status: 409 })

    const updated = await query(
      `UPDATE service_bookings SET
         status        = 'rejected',
         rejected_at   = NOW(),
         reject_reason = $1,
         updated_at    = NOW()
       WHERE id = $2
       RETURNING ${SAFE_COLS}`,
      [reasonStr, id]
    )
    return NextResponse.json({ booking: updated[0] })
  }

  // ── Cancel (customer from pending/accepted, or business from pending) ──────
  if (action === 'cancel') {
    const allowedForCustomer  = ['pending', 'accepted']
    const allowedForBusiness  = ['pending']

    if (isCustomer && !allowedForCustomer.includes(b.status)) {
      return NextResponse.json({ error: `Cannot cancel from status "${b.status}"` }, { status: 409 })
    }
    if (isBusiness && !allowedForBusiness.includes(b.status)) {
      return NextResponse.json({ error: `Business cannot cancel from status "${b.status}"` }, { status: 409 })
    }

    const updated = await query(
      `UPDATE service_bookings SET
         status        = 'cancelled',
         cancelled_at  = NOW(),
         cancel_reason = $1,
         updated_at    = NOW()
       WHERE id = $2
       RETURNING ${SAFE_COLS}`,
      [reasonStr, id]
    )
    return NextResponse.json({ booking: updated[0] })
  }

  // ── Complete (business only, from accepted) ───────────────────────────────
  if (action === 'complete') {
    if (!isBusiness) return NextResponse.json({ error: 'Only the business can mark complete' }, { status: 403 })
    if (b.status !== 'accepted') return NextResponse.json({ error: `Cannot complete from status "${b.status}"` }, { status: 409 })

    const updated = await query(
      `UPDATE service_bookings SET
         status       = 'completed',
         completed_at = NOW(),
         updated_at   = NOW()
       WHERE id = $2
       RETURNING ${SAFE_COLS}`,
      [id]
    )
    return NextResponse.json({ booking: updated[0] })
  }

  return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
}
