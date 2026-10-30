/**
 * GET /api/driver/jobs
 *
 * Returns jobs assigned to the authenticated driver (driver_id = auth.uid).
 * Never returns customer_phone. driver_phone only returned for this driver's own jobs.
 *
 * Authorization: Bearer <firebase-id-token>
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { readLimiter, checkLimit } from '@/lib/rate-limit'

const SAFE_COLS = `
  id, ref, mode, status,
  customer_name,
  pickup_label, pickup_lat, pickup_lon,
  dropoff_label, dropoff_lat, dropoff_lon,
  vehicle_id, distance_km,
  fare_accepted_paise,
  driver_id, driver_name, driver_vehicle,
  notes, scheduled_at,
  accepted_at, picked_up_at, completed_at, cancelled_at,
  cancel_by, cancel_reason,
  created_at, updated_at`

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  let auth: { uid: string }
  try {
    auth = await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query(
      `SELECT ${SAFE_COLS} FROM jobs
       WHERE driver_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [auth.uid]
    )

    // driver_phone deliberately omitted — driver already has their own phone
    // customer_phone never included in safe column list above

    return NextResponse.json({ jobs: rows }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[GET /api/driver/jobs]', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
