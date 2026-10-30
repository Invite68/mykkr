/**
 * GET /api/driver/active-job
 *
 * Returns the driver's current active job if they have one
 * (status = accepted | driver_en_route | picked_up).
 *
 * Called on dashboard mount to restore state after page refresh.
 *
 * Security:
 *   - Firebase Auth required
 *   - driver_id matched against auth.uid — cannot see other drivers' jobs
 *   - customer_phone never returned (toSafeJob strips it)
 *   - driver_phone decrypted only for reveal-eligible statuses
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { decryptPII } from '@/lib/encrypt'
import type { Job, SafeJob, JobStatus } from '@/lib/job-types'

const ACTIVE_STATUSES = ['accepted', 'driver_en_route', 'picked_up'] as const
const SHOW_PHONE_STATUSES = new Set<JobStatus>(['accepted', 'driver_en_route', 'picked_up'])

// Explicit safe columns — never SELECT * on jobs
const SAFE_JOB_COLS = `
  id, ref, mode, status, rider_id,
  customer_name,
  pickup_label, pickup_lat, pickup_lon,
  dropoff_label, dropoff_lat, dropoff_lon,
  vehicle_id, distance_km, fare_estimate,
  fare_client_paise, fare_server_paise, fare_accepted_paise,
  notes, scheduled_at,
  driver_id, driver_name, driver_phone, driver_vehicle,
  created_at, accepted_at, picked_up_at, completed_at, updated_at
`

function toSafeJob(job: Job): SafeJob {
  // customer_phone never returned
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone
  return {
    ...rest,
    driver_phone: SHOW_PHONE_STATUSES.has(job.status) && driver_phone
      ? decryptPII(driver_phone)
      : null,
  }
}

export async function GET(req: NextRequest) {
  let auth: { uid: string }
  try {
    auth = await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rows = await query<Job>(
      `SELECT ${SAFE_JOB_COLS}
         FROM jobs
        WHERE driver_id = $1
          AND status = ANY($2::text[])
        ORDER BY accepted_at DESC
        LIMIT 1`,
      [auth.uid, ACTIVE_STATUSES],
    )

    if (!rows.length) {
      return NextResponse.json({ job: null })
    }

    return NextResponse.json({ job: toSafeJob(rows[0]) }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[GET /api/driver/active-job]', err)
    return NextResponse.json({ error: 'Failed to fetch active job' }, { status: 500 })
  }
}
