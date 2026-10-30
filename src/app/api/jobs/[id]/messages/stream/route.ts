/**
 * GET /api/jobs/[id]/messages/stream
 *
 * SSE stream for live chat on a single job.
 * Caller must be the customer (rider_id) or driver (driver_id) on that job.
 *
 * On connect: sends all existing messages as a snapshot, then pushes
 * new messages in real-time as they arrive.
 *
 * Security:
 * - Firebase Bearer token required (query param ?token= or Authorization header)
 * - Participant check: only rider_id or driver_id may connect
 * - No message content in URL — token only
 */

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { subscribeChatJob } from '@/lib/chat-broadcaster'

const KEEPALIVE_MS = 25_000

interface JobRow {
  status: string
  rider_id: string | null
  driver_id: string | null
}

interface MessageRow {
  id: string
  sender_uid: string
  sender_role: string
  body: string
  created_at: string
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth — EventSource cannot set headers, so accept ?token= query param too.
  // requireAuth() already checks Authorization header; here we inject the
  // query-param token into a synthetic request header if present.
  let uid: string
  try {
    const token = req.nextUrl.searchParams.get('token')
    let authReq = req
    if (token && !req.headers.get('authorization')) {
      // Clone request with synthetic Authorization header
      authReq = new Request(req.url, {
        method: req.method,
        headers: { ...Object.fromEntries(req.headers), authorization: `Bearer ${token}` },
        signal: req.signal,
      }) as unknown as typeof req
    }
    const auth = await requireAuth(authReq)
    uid = auth.uid
  } catch {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id: jobId } = await params

  // Participant check
  const rows = await query<JobRow>(
    `SELECT status, rider_id, driver_id FROM jobs WHERE id = $1 LIMIT 1`,
    [jobId],
  )
  if (!rows.length) return new Response('Job not found', { status: 404 })

  const job = rows[0]
  const isParticipant = job.rider_id === uid || job.driver_id === uid
  if (!isParticipant) return new Response('Access denied', { status: 403 })

  // Fetch existing messages for snapshot
  const history = await query<MessageRow>(
    `SELECT id, sender_uid, sender_role, body, created_at
       FROM job_messages
      WHERE job_id = $1
      ORDER BY created_at ASC
      LIMIT 200`,
    [jobId],
  )

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send snapshot of existing messages
      const snapshot = `data: ${JSON.stringify({ type: 'snapshot', messages: history })}\n\n`
      controller.enqueue(encoder.encode(snapshot))

      // Subscribe to new messages
      const unsub = subscribeChatJob(jobId, controller)

      // Keepalive ping every 25s to prevent proxy timeout
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': ping\n\n'))
        } catch {
          clearInterval(keepalive)
        }
      }, KEEPALIVE_MS)

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(keepalive)
        unsub()
        try { controller.close() } catch { /* already closed */ }
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx: disable buffering for SSE
    },
  })
}
