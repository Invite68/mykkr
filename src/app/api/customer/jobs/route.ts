/**
 * GET /api/customer/jobs
 *
 * Returns the authenticated customer's own jobs, newest first.
 * customer_phone and driver_phone never returned — explicit safe column list.
 *
 * Authorization: Bearer <firebase-id-token>
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { decryptPII } from '@/lib/encrypt'
import { readLimiter, checkLimit } from '@/lib/rate-limit'

const SHOW_PHONE_STATUSES = new Set(['accepted', 'driver_en_route', 'picked_up'])

const SAFE_COLS = `
  id, ref, mode, status, rider_id,
  customer_name,
  pickup_label, pickup_lat, pickup_lon,
  dropoff_label, dropoff_lat, dropoff_lon,
  vehicle_id, distance_km,
  fare_estimate, fare_client_paise, fare_server_paise, fare_accepted_paise,
  driver_id, driver_name, driver_vehicle, driver_phone,
  notes, scheduled_at,
  accepted_at, picked_up_at, completed_at, cancelled_at,
  cancel_by, cancel_reason,
  created_at, updated_at`

interface JobRow {
  id: string
  ref: string
  mode: string
  status: string
  rider_id: string
  customer_name: string
  pickup_label: string
  pickup_lat: number
  pickup_lon: number
  dropoff_label: string
  dropoff_lat: number
  dropoff_lon: number
  vehicle_id: string
  distance_km: number | null
  fare_estimate: number | null
  fare_client_paise: number | null
  fare_server_paise: number | null
  fare_accepted_paise: number | null
  driver_id: string | null
  driver_name: string | null
  driver_vehicle: string | null
  driver_phone: string | null
  notes: string | null
  scheduled_at: string | null
  accepted_at: string | null
  picked_up_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancel_by: string | null
  cancel_reason: string | null
  created_at: string
  updated_at: string
}

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
    const rows = await query<JobRow>(
      `SELECT ${SAFE_COLS} FROM jobs
       WHERE rider_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [auth.uid]
    )

    const jobs = rows.map(j => ({
      ...j,
      // Only reveal driver phone if status permits it
      driver_phone: SHOW_PHONE_STATUSES.has(j.status) && j.driver_phone
        ? decryptPII(j.driver_phone)
        : null,
    }))

    return NextResponse.json({ jobs }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    console.error('[GET /api/customer/jobs]', err)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
