/**
 * POST /api/jobs
 * Create a new ride or delivery job.
 *
 * Body (JSON):
 *   mode, customerName, customerPhone,
 *   pickupLabel, pickupLat, pickupLon,
 *   dropoffLabel, dropoffLat, dropoffLon,
 *   vehicleId, distanceKm?, fareEstimate?,
 *   notes?, scheduledAt?
 *
 * Returns: { job: { id, ref, status, ... } }
 *
 * Security:
 *   - customerPhone is AES-256-GCM encrypted before insert
 *   - Response never returns raw phone numbers
 *   - No API key needed — authenticated via session (TODO: add auth middleware)
 */

import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { encryptPII } from '@/lib/encrypt'
import { broadcast } from '@/lib/job-broadcaster'
import type { Job, SafeJob } from '@/lib/job-types'

// Generate a short human-readable job reference: KKR-XXXX
function makeRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no ambiguous chars
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return `KKR-${s}`
}

function toSafeJob(job: Job): SafeJob {
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone // never expose
  return {
    ...rest,
    driver_phone: null, // not yet assigned
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    mode, customerName, customerPhone,
    pickupLabel, pickupLat, pickupLon,
    dropoffLabel, dropoffLat, dropoffLon,
    vehicleId, distanceKm, fareEstimate,
    notes, scheduledAt,
  } = body

  // ── Validation ──────────────────────────────────────────────────────────────
  const required = { mode, customerName, customerPhone, pickupLabel, pickupLat, pickupLon, dropoffLabel, dropoffLat, dropoffLon, vehicleId }
  for (const [k, v] of Object.entries(required)) {
    if (v === undefined || v === null || v === '') {
      return NextResponse.json({ error: `Missing required field: ${k}` }, { status: 400 })
    }
  }
  if (mode !== 'ride' && mode !== 'deliver') {
    return NextResponse.json({ error: 'mode must be "ride" or "deliver"' }, { status: 400 })
  }

  // ── Length & type guards (prevent oversized payloads reaching the DB) ────────
  const nameStr   = String(customerName).trim().slice(0, 120)
  const phoneStr  = String(customerPhone).trim().slice(0, 20)
  const pickStr   = String(pickupLabel).trim().slice(0, 300)
  const dropStr   = String(dropoffLabel).trim().slice(0, 300)
  const vehicleStr = String(vehicleId).trim().slice(0, 40)
  const notesStr  = notes ? String(notes).trim().slice(0, 500) : null
  const schedStr  = scheduledAt ? String(scheduledAt).trim().slice(0, 40) : null

  const pickLatN  = Number(pickupLat)
  const pickLonN  = Number(pickupLon)
  const dropLatN  = Number(dropoffLat)
  const dropLonN  = Number(dropoffLon)
  if ([pickLatN, pickLonN, dropLatN, dropLonN].some(isNaN)) {
    return NextResponse.json({ error: 'Coordinates must be numbers' }, { status: 400 })
  }
  // Rough bounding box: India roughly 6°N–37°N, 68°E–97°E
  if (pickLatN < 6 || pickLatN > 37 || pickLonN < 68 || pickLonN > 97 ||
      dropLatN < 6 || dropLatN > 37 || dropLonN < 68 || dropLonN > 97) {
    return NextResponse.json({ error: 'Coordinates out of range' }, { status: 400 })
  }
  const distKmN   = distanceKm  != null ? Number(distanceKm)  : null
  const fareN     = fareEstimate != null ? Number(fareEstimate) : null
  if (distKmN !== null && (isNaN(distKmN) || distKmN < 0 || distKmN > 5000)) {
    return NextResponse.json({ error: 'distanceKm out of range' }, { status: 400 })
  }
  if (fareN !== null && (isNaN(fareN) || fareN < 0 || fareN > 100_000_00)) {
    return NextResponse.json({ error: 'fareEstimate out of range' }, { status: 400 })
  }

  if (nameStr.length < 2)    return NextResponse.json({ error: 'customerName too short' }, { status: 400 })
  if (phoneStr.length < 10)  return NextResponse.json({ error: 'customerPhone too short' }, { status: 400 })
  if (pickStr.length < 2)    return NextResponse.json({ error: 'pickupLabel too short' }, { status: 400 })
  if (dropStr.length < 2)    return NextResponse.json({ error: 'dropoffLabel too short' }, { status: 400 })
  if (vehicleStr.length < 1) return NextResponse.json({ error: 'vehicleId too short' }, { status: 400 })

  // ── Encrypt PII ─────────────────────────────────────────────────────────────
  const encPhone = encryptPII(phoneStr)

  // ── Insert ───────────────────────────────────────────────────────────────────
  let ref = makeRef()

  // Retry once if ref collides (astronomically unlikely but correct)
  try {
    const rows = await query<Job>(
      `INSERT INTO jobs (
         ref, mode,
         customer_name, customer_phone,
         pickup_label, pickup_lat, pickup_lon,
         dropoff_label, dropoff_lat, dropoff_lon,
         vehicle_id, distance_km, fare_estimate,
         notes, scheduled_at
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
       )
       RETURNING *`,
      [
        ref, mode,
        nameStr, encPhone,
        pickStr, pickLatN, pickLonN,
        dropStr, dropLatN, dropLonN,
        vehicleStr,
        distKmN,
        fareN,
        notesStr,
        schedStr,
      ]
    )

    const job = rows[0]
    const safe = toSafeJob(job)

    // Broadcast to all connected driver SSE streams
    broadcast({ type: 'job_new', job: safe })

    return NextResponse.json(
      { job: { id: safe.id, ref: safe.ref, status: safe.status, mode: safe.mode } },
      { status: 201 }
    )
  } catch (err: unknown) {
    // Unique violation on ref — retry with new ref
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === '23505') {
      ref = makeRef()
    }
    console.error('[POST /api/jobs]', err)
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
  }
}
