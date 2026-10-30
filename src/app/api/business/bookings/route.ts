/**
 * GET /api/business/bookings
 *
 * Returns service booking requests for the authenticated business owner.
 * customer_phone NEVER returned (encrypted in DB, excluded from SAFE_COLS).
 *
 * Query params:
 *   status?: 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'
 *
 * Authorization: Bearer <firebase-id-token>
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { readLimiter, checkLimit } from '@/lib/rate-limit'

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

const VALID_STATUSES = new Set(['pending', 'accepted', 'rejected', 'cancelled', 'completed'])

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const statusFilter = searchParams.get('status')

  if (statusFilter && !VALID_STATUSES.has(statusFilter)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 })
  }

  try {
    const rows = statusFilter
      ? await query(
          `SELECT ${SAFE_COLS} FROM service_bookings
           WHERE business_uid = $1 AND status = $2
           ORDER BY created_at DESC LIMIT 100`,
          [auth.uid, statusFilter]
        )
      : await query(
          `SELECT ${SAFE_COLS} FROM service_bookings
           WHERE business_uid = $1
           ORDER BY created_at DESC LIMIT 100`,
          [auth.uid]
        )

    return NextResponse.json({ bookings: rows }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[GET /api/business/bookings]', err)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
