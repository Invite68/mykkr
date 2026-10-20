/**
 * POST /api/jobs
 * Customer submits a ride or delivery request.
 * Inserts a new job with status='open', returns ref for tracking.
 */
import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase'
import { jobRef, isValidIndianMobile, encryptPII } from '@/lib/sanitize'

export async function POST(req: Request) {
  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    mode, name, phone,
    pickupLabel, pickupLat, pickupLon,
    dropoffLabel, dropoffLat, dropoffLon,
    vehicleId, distanceKm, fareEstimate,
    notes, scheduledAt,
  } = body as Record<string, unknown>

  // ── Validate ─────────────────────────────────────────────────────────────
  const errors: string[] = []
  if (mode !== 'ride' && mode !== 'deliver')   errors.push('mode must be ride or deliver')
  if (typeof name !== 'string' || name.trim().length < 2) errors.push('name required')
  if (!isValidIndianMobile(String(phone ?? ''))) errors.push('invalid phone number')
  if (typeof pickupLat  !== 'number') errors.push('pickupLat required')
  if (typeof pickupLon  !== 'number') errors.push('pickupLon required')
  if (typeof dropoffLat !== 'number') errors.push('dropoffLat required')
  if (typeof dropoffLon !== 'number') errors.push('dropoffLon required')
  if (typeof pickupLabel  !== 'string' || !pickupLabel.trim())  errors.push('pickupLabel required')
  if (typeof dropoffLabel !== 'string' || !dropoffLabel.trim()) errors.push('dropoffLabel required')
  if (typeof vehicleId !== 'string' || !vehicleId) errors.push('vehicleId required')

  if (errors.length) {
    return NextResponse.json({ errors }, { status: 422 })
  }

  const ref = jobRef()

  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      ref,
      mode: mode as 'ride' | 'deliver',
      status: 'open',
      customer_name:  (name as string).trim(),
      customer_phone: encryptPII(String(phone)),  // encrypt before storing
      pickup_label:  (pickupLabel  as string).trim(),
      pickup_lat:    pickupLat  as number,
      pickup_lon:    pickupLon  as number,
      dropoff_label: (dropoffLabel as string).trim(),
      dropoff_lat:   dropoffLat as number,
      dropoff_lon:   dropoffLon as number,
      vehicle_id:    vehicleId as string,
      distance_km:   typeof distanceKm  === 'number' ? distanceKm  : null,
      fare_estimate: typeof fareEstimate === 'number' ? fareEstimate : null,
      notes:         typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      scheduled_at:  typeof scheduledAt === 'string' && scheduledAt ? scheduledAt : null,
      driver_id:     null,
    })
    .select('id, ref, status, pickup_label, dropoff_label, pickup_lat, pickup_lon, dropoff_lat, dropoff_lon, mode, vehicle_id, fare_estimate, distance_km, scheduled_at, created_at')
    .single()

  if (error) {
    console.error('[jobs POST]', error)
    return NextResponse.json({ error: 'Could not create job' }, { status: 500 })
  }

  return NextResponse.json({ job: data }, { status: 201 })
}
