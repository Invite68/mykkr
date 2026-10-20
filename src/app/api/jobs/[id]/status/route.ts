/**
 * GET /api/jobs/[id]/status
 * Public polling endpoint — returns safe subset of job data.
 * Called by the customer tracking page every 5s as fallback
 * (Supabase Realtime is the primary update channel).
 *
 * Does NOT return customer_phone (PII).
 */
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id, ref, mode, status,
      pickup_label, pickup_lat, pickup_lon,
      dropoff_label, dropoff_lat, dropoff_lon,
      vehicle_id, distance_km, fare_estimate,
      driver_name, driver_phone, driver_vehicle,
      scheduled_at, created_at, accepted_at, picked_up_at, completed_at, cancelled_at,
      cancel_by, cancel_reason
    `)
    .eq('id', jobId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  // Only expose driver phone once job is accepted (not before)
  const showPhone = data.status === 'accepted' || data.status === 'driver_en_route' || data.status === 'picked_up'
  const { driver_phone, ...rest } = data
  const safe = { ...rest, driver_phone: showPhone ? driver_phone : null }

  return NextResponse.json({ job: safe }, {
    headers: { 'Cache-Control': 'no-store' },
  })
}

/**
 * PATCH /api/jobs/[id]/status
 * Driver advances status: accepted → driver_en_route → picked_up → completed
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: jobId } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, driverId } = body as Record<string, unknown>

  const DRIVER_TRANSITIONS: Record<string, string[]> = {
    driver_en_route: ['accepted'],
    picked_up:       ['driver_en_route'],
    completed:       ['picked_up'],
  }

  if (!status || !(status as string in DRIVER_TRANSITIONS)) {
    return NextResponse.json({ error: 'Invalid status transition' }, { status: 422 })
  }

  const allowedFrom = DRIVER_TRANSITIONS[status as string]
  const supabase = getAdminClient()

  const updatePayload: Record<string, string> = { status: status as string }
  if (status === 'picked_up') updatePayload.picked_up_at = new Date().toISOString()
  if (status === 'completed') updatePayload.completed_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('jobs')
    .update(updatePayload)
    .eq('id', jobId)
    .eq('driver_id', String(driverId ?? ''))
    .in('status', allowedFrom)
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Transition not allowed or job not found' }, { status: 409 })
  }

  return NextResponse.json({ job: data })
}
