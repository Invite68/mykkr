/**
 * POST /api/jobs/[id]/accept
 * Driver atomically accepts an open job.
 *
 * Uses the accept_job() Postgres function which:
 *   - Updates status open→accepted in a single atomic statement
 *   - Returns NULL if another driver already accepted (race condition)
 *   - Only one driver wins, even if 50 hit this endpoint simultaneously
 */
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { driverId, driverName, driverPhone, driverVehicle } = body as Record<string, unknown>

  if (!driverId || !driverName || !driverPhone) {
    return NextResponse.json({ error: 'driverId, driverName, driverPhone required' }, { status: 422 })
  }

  const supabase = getAdminClient()

  // ── Atomic accept via stored procedure ──────────────────────────────────
  // Returns the updated job row, or null if job was already taken
  const { data, error } = await supabase
    .rpc('accept_job', {
      p_job_id:        jobId,
      p_driver_id:     String(driverId),
      p_driver_name:   String(driverName),
      p_driver_phone:  String(driverPhone),
      p_driver_vehicle: String(driverVehicle ?? ''),
    })

  if (error) {
    console.error('[accept_job rpc]', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!data) {
    // Job was already accepted by another driver — race condition handled
    return NextResponse.json(
      { error: 'Job already taken', code: 'ALREADY_ACCEPTED' },
      { status: 409 }
    )
  }

  return NextResponse.json({ job: data })
}
