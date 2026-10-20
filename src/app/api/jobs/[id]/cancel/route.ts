/**
 * POST /api/jobs/[id]/cancel
 * Rider or driver cancels a job.
 *
 * Driver cancel  → job status resets to 'open', driver_id cleared
 *                  → all other drivers see it appear again via Realtime
 * Rider cancel   → job status = 'cancelled_by_rider' (stays closed)
 *
 * Body: { by: 'rider' | 'driver', reason?: string }
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

  const { by, reason } = body as Record<string, unknown>

  if (by !== 'rider' && by !== 'driver') {
    return NextResponse.json({ error: 'by must be rider or driver' }, { status: 422 })
  }

  const supabase = getAdminClient()

  const { data, error } = await supabase
    .rpc('cancel_job', {
      p_job_id: jobId,
      p_by:     String(by),
      p_reason: typeof reason === 'string' ? reason : undefined,
    })

  if (error) {
    console.error('[cancel_job rpc]', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json(
      { error: 'Job not found or not in cancellable state', code: 'NOT_CANCELLABLE' },
      { status: 409 }
    )
  }

  return NextResponse.json({ job: data })
}
