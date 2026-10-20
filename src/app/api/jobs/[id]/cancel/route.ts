/**
 * POST /api/jobs/[id]/cancel
 *
 * Cancel a job.
 *   by = 'rider'  → status becomes 'cancelled_by_rider' (terminal)
 *   by = 'driver' → status resets to 'open' (job goes back to board)
 *
 * Body (JSON): { by: 'rider' | 'driver', reason?: string }
 *
 * Returns: { job: SafeJob }
 *
 * Security: server-side only, no secrets in response.
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { broadcast } from '@/lib/job-broadcaster'
import type { Job, SafeJob } from '@/lib/job-types'

function toSafeJob(job: Job): SafeJob {
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone
  void driver_phone
  return { ...rest, driver_phone: null }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  let body: Record<string, unknown>
  try {
    body = await req.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { by, reason } = body
  if (by !== 'rider' && by !== 'driver') {
    return NextResponse.json({ error: 'by must be "rider" or "driver"' }, { status: 400 })
  }

  try {
    let rows: Job[]

    if (by === 'driver') {
      // Driver cancel → job goes back open so other drivers can take it
      rows = await query<Job>(
        `UPDATE jobs SET
           status        = 'open',
           driver_id     = NULL,
           driver_name   = NULL,
           driver_phone  = NULL,
           driver_vehicle = NULL,
           accepted_at   = NULL,
           cancel_by     = 'driver',
           cancel_reason = $1,
           cancelled_at  = NOW(),
           updated_at    = NOW()
         WHERE id = $2
           AND status IN ('accepted', 'driver_en_route')
         RETURNING *`,
        [reason ?? null, jobId]
      )
    } else {
      // Rider cancel → terminal
      rows = await query<Job>(
        `UPDATE jobs SET
           status        = 'cancelled_by_rider',
           cancel_by     = 'rider',
           cancel_reason = $1,
           cancelled_at  = NOW(),
           updated_at    = NOW()
         WHERE id = $2
           AND status IN ('open', 'accepted')
         RETURNING *`,
        [reason ?? null, jobId]
      )
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Job not found or cannot be cancelled in its current state' },
        { status: 409 }
      )
    }

    const safe = toSafeJob(rows[0])
    broadcast({ type: 'job_updated', job: safe })

    return NextResponse.json({ job: safe })
  } catch (err) {
    console.error('[POST /api/jobs/[id]/cancel]', err)
    return NextResponse.json({ error: 'Failed to cancel job' }, { status: 500 })
  }
}
