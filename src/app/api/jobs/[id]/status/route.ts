/**
 * GET  /api/jobs/[id]/status   — poll current job state (customer tracking page)
 * PATCH /api/jobs/[id]/status  — driver advances state through the pipeline
 *
 * GET — public (no auth required; used by customer tracking page)
 *   { job: SafeJob } — driver_phone only revealed once status is accepted+
 *
 * PATCH — requires Firebase Auth (driver must own the job)
 *   Body: { status: 'driver_en_route' | 'picked_up' | 'completed' }
 *   Only forward transitions are allowed (no going back).
 *   Returns 403 if the authenticated driver does not own this job.
 *
 * Security:
 *   - Raw phone numbers never returned
 *   - driver_phone only revealed when status is accepted/en_route/picked_up
 *   - PATCH enforces ownership: driver_id must match the authenticated UID
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { decryptPII } from '@/lib/encrypt'
import { broadcast } from '@/lib/job-broadcaster'
import type { Job, SafeJob, JobStatus } from '@/lib/job-types'
import { DRIVER_TRANSITIONS } from '@/lib/job-types'

const SHOW_PHONE_STATUSES: JobStatus[] = ['accepted', 'driver_en_route', 'picked_up']

function toSafeJob(job: Job, revealPhone = false): SafeJob {
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone
  return {
    ...rest,
    driver_phone:
      revealPhone && driver_phone ? decryptPII(driver_phone) : null,
  }
}

// ── GET ───────────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  try {
    const rows = await query<Job>('SELECT * FROM jobs WHERE id = $1', [jobId])
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const job = rows[0]
    const revealPhone = SHOW_PHONE_STATUSES.includes(job.status)
    const safe = toSafeJob(job, revealPhone)

    return NextResponse.json({ job: safe }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    console.error('[GET /api/jobs/[id]/status]', err)
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 })
  }
}

// ── PATCH ─────────────────────────────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth — only the assigned driver can advance the job ───────────────────────
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

  const { status: newStatus } = body
  if (typeof newStatus !== 'string') {
    return NextResponse.json({ error: 'status is required' }, { status: 400 })
  }

  // Verify the requested transition is valid, and that this driver owns the job
  const currentRows = await query<Job>('SELECT status, driver_id FROM jobs WHERE id = $1', [jobId])
  if (currentRows.length === 0) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  const currentStatus = currentRows[0].status
  const ownerId       = currentRows[0].driver_id

  // Ownership check: the job must belong to the authenticated driver
  if (ownerId !== auth.uid) {
    return NextResponse.json({ error: 'Forbidden — not your job' }, { status: 403 })
  }

  const expectedNext = DRIVER_TRANSITIONS[currentStatus]

  if (newStatus !== expectedNext) {
    return NextResponse.json(
      { error: `Cannot transition from "${currentStatus}" to "${newStatus}"` },
      { status: 409 }
    )
  }

  // Build timestamp clause — use a hardcoded safe map to prevent SQL injection.
  // newStatus is already validated against DRIVER_TRANSITIONS above, but we
  // never interpolate it into SQL directly; only known literal column names go in.
  const SAFE_TS_CLAUSES: Record<string, string> = {
    driver_en_route: '',                       // accepted_at already set at accept time
    picked_up:       'picked_up_at = NOW(),',
    completed:       'completed_at = NOW(),',
  }
  // If newStatus isn't in the map (shouldn't happen after transition check), default to ''
  const tsClause = SAFE_TS_CLAUSES[newStatus] ?? ''

  try {
    const rows = await query<Job>(
      `UPDATE jobs SET
         status     = $1,
         ${tsClause}
         updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [newStatus, jobId]
    )

    const safe = toSafeJob(rows[0], SHOW_PHONE_STATUSES.includes(rows[0].status))
    broadcast({ type: 'job_updated', job: safe })

    return NextResponse.json({ job: safe })
  } catch (err) {
    console.error('[PATCH /api/jobs/[id]/status]', err)
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 })
  }
}
