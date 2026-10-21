/**
 * POST /api/jobs/[id]/cancel
 *
 * Cancel an in-progress job. Two roles can cancel:
 *   - Customer (rider) : can cancel when status is 'open' or 'accepted'
 *                        → status becomes 'cancelled_by_rider'
 *   - Driver           : can cancel when status is 'accepted' or 'driver_en_route'
 *                        → status becomes 'cancelled_by_driver', job goes back to 'open'
 *                          so another driver can pick it up
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body (JSON):
 *   role   : 'rider' | 'driver'
 *   reason?: string  (optional, max 500 chars)
 *
 * Returns:
 *   200 { job: SafeJob }
 *   400 — bad request / invalid transition
 *   401 — not authenticated
 *   403 — not authorised to cancel (driver not assigned to this job)
 *   404 — job not found
 *   409 — job already completed or cancelled
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { query }                     from '@/lib/db'
import { broadcast }                 from '@/lib/job-broadcaster'
import type { Job, SafeJob, JobStatus } from '@/lib/job-types'

// Statuses that can no longer be cancelled
const TERMINAL: JobStatus[] = ['completed', 'cancelled_by_rider', 'cancelled_by_driver']

// Which statuses each role is allowed to cancel from
const RIDER_CANCELLABLE:  JobStatus[] = ['open', 'accepted']
const DRIVER_CANCELLABLE: JobStatus[] = ['accepted', 'driver_en_route']

function toSafeJob(job: Job): SafeJob {
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone
  return { ...rest, driver_phone: null }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
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

  const { role, reason } = body
  if (role !== 'rider' && role !== 'driver') {
    return NextResponse.json({ error: 'role must be "rider" or "driver"' }, { status: 400 })
  }

  const reasonStr = reason ? String(reason).trim().slice(0, 500) : null

  // ── Fetch job ─────────────────────────────────────────────────────────────────
  const rows = await query<Job>('SELECT * FROM jobs WHERE id = $1', [jobId])
  if (rows.length === 0) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const job = rows[0]

  // ── Terminal check ────────────────────────────────────────────────────────────
  if (TERMINAL.includes(job.status)) {
    return NextResponse.json(
      { error: `Job is already ${job.status} — cannot cancel` },
      { status: 409 }
    )
  }

  // ── Role-specific authorisation & transition ──────────────────────────────────
  if (role === 'driver') {
    // Driver must be the one assigned to the job
    if (job.driver_id !== auth.uid) {
      return NextResponse.json({ error: 'Forbidden — not your job' }, { status: 403 })
    }
    if (!DRIVER_CANCELLABLE.includes(job.status)) {
      return NextResponse.json(
        { error: `Driver cannot cancel from status "${job.status}"` },
        { status: 400 }
      )
    }

    // Driver cancels → job goes BACK to open so another driver can take it
    const updated = await query<Job>(
      `UPDATE jobs SET
         status        = 'open',
         driver_id     = NULL,
         driver_name   = NULL,
         driver_phone  = NULL,
         driver_vehicle = NULL,
         accepted_at   = NULL,
         cancel_by     = $1,
         cancel_reason = $2,
         cancelled_at  = NOW(),
         updated_at    = NOW()
       WHERE id = $3
       RETURNING *`,
      [auth.uid, reasonStr, jobId]
    )

    const safe = toSafeJob(updated[0])
    // Broadcast: job is open again — driver boards will see it
    broadcast({ type: 'job_new', job: safe })

    return NextResponse.json({ job: safe })
  }

  // ── Rider cancels ─────────────────────────────────────────────────────────────
  if (!RIDER_CANCELLABLE.includes(job.status)) {
    return NextResponse.json(
      { error: `Rider cannot cancel once the driver is en route` },
      { status: 400 }
    )
  }

  const updated = await query<Job>(
    `UPDATE jobs SET
       status        = 'cancelled_by_rider',
       cancel_by     = $1,
       cancel_reason = $2,
       cancelled_at  = NOW(),
       updated_at    = NOW()
     WHERE id = $3
     RETURNING *`,
    [auth.uid, reasonStr, jobId]
  )

  const safe = toSafeJob(updated[0])
  broadcast({ type: 'job_updated', job: safe })

  return NextResponse.json({ job: safe })
}
