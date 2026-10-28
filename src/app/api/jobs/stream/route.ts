/**
 * GET /api/jobs/stream
 *
 * Server-Sent Events stream for the driver job board.
 * Each connected driver holds this long-lived connection open.
 * When a job is created or updated, all drivers receive it instantly.
 *
 * SSE format (text/event-stream):
 *   data: {"type":"job_new","job":{...}}\n\n
 *   data: {"type":"job_updated","job":{...}}\n\n
 *   data: {"type":"ping"}\n\n        ← every 25s keepalive
 *
 * No API keys, no auth tokens in the stream — the browser connects directly.
 * TODO: add a signed short-lived token in the URL once Firebase Auth is wired.
 *
 * This route must be dynamic (not statically cached by Next.js).
 */

import { NextRequest } from 'next/server'
import { subscribe } from '@/lib/job-broadcaster'
import { query } from '@/lib/db'
import { verifyStreamToken } from '@/lib/stream-token'
import type { Job, SafeJob, JobEvent } from '@/lib/job-types'

export const dynamic = 'force-dynamic'
// Don't set a timeout — SSE connections are long-lived by design.
// Coolify / Nginx should be configured with proxy_read_timeout 3600s.

function toSafeJob(job: Job): SafeJob {
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone
  void driver_phone
  return { ...rest, driver_phone: null }
}

function encodeEvent(event: JobEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

export async function GET(req: NextRequest) {
  // ── Auth via short-lived stream token (?token=...) ─────────────────────────
  // EventSource doesn't support Authorization headers, so we use a signed
  // query-param token issued by POST /api/jobs/stream-token.
  const { searchParams } = new URL(req.url)
  const tokenParam = searchParams.get('token')
  try {
    if (!tokenParam) throw new Error('missing')
    verifyStreamToken(tokenParam)   // throws if invalid or expired
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    // Return error as SSE so EventSource onError fires cleanly
    return new Response(
      `data: ${JSON.stringify({ type: 'error', code: 'UNAUTHORIZED', message: msg })}\n\n`,
      {
        status: 401,
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
        },
      }
    )
  }

  // Fetch current open jobs to send as initial snapshot.
  // Explicit safe column list — customer_phone and driver_phone NEVER in stream
  // (encrypted ciphertext leaks structural info and is recoverable if key leaks).
  const SAFE_COLS = `
    id, ref, mode, status, rider_id,
    customer_name,
    pickup_label, pickup_lat, pickup_lon,
    dropoff_label, dropoff_lat, dropoff_lon,
    vehicle_id, distance_km,
    fare_estimate, fare_client_paise, fare_server_paise, fare_accepted_paise,
    driver_id, driver_name, driver_vehicle,
    notes, scheduled_at,
    accepted_at, picked_up_at, completed_at, cancelled_at,
    cancel_by, cancel_reason,
    created_at, updated_at`

  let initialJobs: SafeJob[] = []
  try {
    const rows = await query<Job>(
      `SELECT ${SAFE_COLS} FROM jobs
       WHERE status = 'open'
       ORDER BY created_at DESC
       LIMIT 50`
    )
    initialJobs = rows.map(toSafeJob)
  } catch (err) {
    console.error('[SSE /api/jobs/stream] initial load failed:', err)
    // Continue anyway — client will see new jobs via broadcast
  }

  // Build the SSE response stream
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // ── Send initial snapshot ──────────────────────────────────────────────
      for (const job of initialJobs) {
        controller.enqueue(
          encoder.encode(encodeEvent({ type: 'job_new', job }))
        )
      }

      // ── Subscribe to future broadcasts ─────────────────────────────────────
      const unsubscribe = subscribe((event) => {
        try {
          controller.enqueue(encoder.encode(encodeEvent(event)))
        } catch {
          // Stream closed — unsubscribe
          unsubscribe()
        }
      })

      // ── Keepalive ping every 25s ───────────────────────────────────────────
      // Browsers and proxies close idle SSE connections. 25s is safe.
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(encodeEvent({ type: 'ping' })))
        } catch {
          clearInterval(pingInterval)
          unsubscribe()
        }
      }, 25_000)

      // ── Cleanup on close ───────────────────────────────────────────────────
      // ReadableStream cancel is called when the client disconnects
      return () => {
        clearInterval(pingInterval)
        unsubscribe()
      }
    },

    cancel() {
      // Handled in start() return value above
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',   // disable Nginx buffering (Coolify uses Nginx)
    },
  })
}
