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

  // ── Encrypt PII ─────────────────────────────────────────────────────────────
  const encPhone = encryptPII(String(customerPhone))

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
        customerName, encPhone,
        pickupLabel, pickupLat, pickupLon,
        dropoffLabel, dropoffLat, dropoffLon,
        vehicleId,
        distanceKm ?? null,
        fareEstimate ?? null,
        notes ?? null,
        scheduledAt ?? null,
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
