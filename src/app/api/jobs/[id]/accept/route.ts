/**
 * POST /api/jobs/[id]/accept
 *
 * Atomically accept an open job. Uses a single UPDATE with WHERE guard
 * so only one driver wins even under concurrent requests.
 *
 * Authorization: Bearer <firebase-id-token>  (driver role required)
 *
 * Body (JSON):
 *   driverName, driverPhone, driverVehicle
 *   (driverId is derived from the authenticated Firebase UID)
 *
 * Returns:
 *   200 { job: SafeJob }   — you got it
 *   409 { error, code: 'ALREADY_ACCEPTED' }  — someone else was faster
 *   404 — job not found
 *
 * Security:
 *   - Firebase Auth required — driverId comes from verified token, never body
 *   - driverPhone encrypted before storage
 *   - Response never returns raw phone numbers
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { encryptPII, decryptPII } from '@/lib/encrypt'
import { broadcast } from '@/lib/job-broadcaster'
import type { Job, SafeJob } from '@/lib/job-types'

function toSafeJob(job: Job): SafeJob {
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone
  return {
    ...rest,
    // Reveal driver_phone back to the driver who just accepted
    driver_phone: driver_phone ? decryptPII(driver_phone) : null,
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth — driverId comes from the verified token, NOT the request body ───────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: jobId } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // driverId is always the authenticated Firebase UID — cannot be spoofed by body
  const { driverName, driverPhone, driverVehicle } = body
  const driverId = auth.uid

  if (!driverName || !driverPhone || !driverVehicle) {
    return NextResponse.json({ error: 'Missing driver fields' }, { status: 400 })
  }

  // ── Length & type guards ─────────────────────────────────────────────────────
  const driverIdStr      = String(driverId).trim().slice(0, 128)
  const driverNameStr    = String(driverName).trim().slice(0, 120)
  const driverPhoneStr   = String(driverPhone).trim().slice(0, 20)
  const driverVehicleStr = String(driverVehicle).trim().slice(0, 80)

  if (driverIdStr.length < 1)      return NextResponse.json({ error: 'driverId too short' }, { status: 400 })
  if (driverNameStr.length < 2)    return NextResponse.json({ error: 'driverName too short' }, { status: 400 })
  if (driverPhoneStr.length < 10)  return NextResponse.json({ error: 'driverPhone too short' }, { status: 400 })
  if (driverVehicleStr.length < 1) return NextResponse.json({ error: 'driverVehicle too short' }, { status: 400 })

  // Encrypt driver phone before storage
  const encDriverPhone = encryptPII(driverPhoneStr)

  // ── Atomic accept ────────────────────────────────────────────────────────────
  // The WHERE clause is the race-condition guard:
  //   status = 'open' AND driver_id IS NULL
  // Only one UPDATE can win; the rest get 0 rows back → 409.
  try {
    const rows = await query<Job>(
      `UPDATE jobs SET
         status        = 'accepted',
         driver_id     = $1,
         driver_name   = $2,
         driver_phone  = $3,
         driver_vehicle = $4,
         accepted_at   = NOW(),
         updated_at    = NOW()
       WHERE id = $5
         AND status = 'open'
         AND driver_id IS NULL
       RETURNING *`,
      [driverIdStr, driverNameStr, encDriverPhone, driverVehicleStr, jobId]
    )

    if (rows.length === 0) {
      // Either job doesn't exist, or another driver already accepted it
      const exists = await query('SELECT id FROM jobs WHERE id = $1', [jobId])
      if (exists.length === 0) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 })
      }
      return NextResponse.json(
        { error: 'Job already taken by another driver', code: 'ALREADY_ACCEPTED' },
        { status: 409 }
      )
    }

    const safe = toSafeJob(rows[0])

    // Broadcast update to all driver boards + tracking page pollers
    broadcast({ type: 'job_updated', job: safe })

    return NextResponse.json({ job: safe })
  } catch (err) {
    console.error('[POST /api/jobs/[id]/accept]', err)
    return NextResponse.json({ error: 'Failed to accept job' }, { status: 500 })
  }
}
