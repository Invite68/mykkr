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

export async function GET(_req: NextRequest) {
  // Fetch current open jobs to send as initial snapshot
  let initialJobs: SafeJob[] = []
  try {
    const rows = await query<Job>(
      `SELECT * FROM jobs
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
