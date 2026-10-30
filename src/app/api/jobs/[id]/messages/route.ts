/**
 * GET  /api/jobs/[id]/messages   — fetch message history for a job
 * POST /api/jobs/[id]/messages   — send a message on a job
 *
 * Security:
 * - Firebase Auth required on both methods
 * - Caller must be the customer (rider_id) OR the driver (driver_id) on that job
 * - Chat only allowed when job status is active (accepted/driver_en_route/picked_up)
 * - Message body capped at 500 chars, stripped of HTML
 * - Rate limited: 20 messages per minute per user
 * - sender_uid always from auth token, never from request body
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query } from '@/lib/db'
import { apiLimiter, getClientIp } from '@/lib/rate-limit'
import { broadcastChat } from '@/lib/chat-broadcaster'

// Statuses where chat is allowed
const CHAT_ALLOWED_STATUSES = new Set(['accepted', 'driver_en_route', 'picked_up'])

interface JobRow {
  id: string
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

function stripHtml(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim()
}

async function resolveParticipant(
  jobId: string,
  uid: string,
): Promise<{ job: JobRow; role: 'customer' | 'driver' } | null> {
  const rows = await query<JobRow>(
    `SELECT id, status, rider_id, driver_id FROM jobs WHERE id = $1 LIMIT 1`,
    [jobId],
  )
  if (!rows.length) return null
  const job = rows[0]
  if (job.rider_id === uid) return { job, role: 'customer' }
  if (job.driver_id === uid) return { job, role: 'driver' }
  return null // not a participant
}

// ── GET — fetch message history ───────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: jobId } = await params
  const participant = await resolveParticipant(jobId, auth.uid)

  if (!participant) {
    return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 })
  }

  // Allow reading history even after job is complete (for reference)
  const messages = await query<MessageRow>(
    `SELECT id, sender_uid, sender_role, body, created_at
       FROM job_messages
      WHERE job_id = $1
      ORDER BY created_at ASC
      LIMIT 200`,
    [jobId],
  )

  return NextResponse.json({ messages })
}

// ── POST — send a message ─────────────────────────────────────────────────────

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Rate limit
  const ip = getClientIp(req)
  const limited = apiLimiter.check(`chat:${ip}`)
  if (!limited.ok) {
    return NextResponse.json({ error: 'Too many messages. Slow down.' }, { status: 429 })
  }

  let auth: { uid: string }
  try { auth = await requireAuth(req) } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: jobId } = await params
  const participant = await resolveParticipant(jobId, auth.uid)

  if (!participant) {
    return NextResponse.json({ error: 'Job not found or access denied' }, { status: 404 })
  }

  // Chat only allowed on active jobs
  if (!CHAT_ALLOWED_STATUSES.has(participant.job.status)) {
    return NextResponse.json(
      { error: 'Chat is only available while a job is active.' },
      { status: 403 },
    )
  }

  // Parse body
  let raw: unknown
  try { raw = await req.json() } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const rawBody = (raw as Record<string, unknown>)?.body
  if (typeof rawBody !== 'string' || !rawBody.trim()) {
    return NextResponse.json({ error: 'Message body is required' }, { status: 400 })
  }

  const body = stripHtml(rawBody).slice(0, 500)
  if (!body) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }

  // Insert message
  const rows = await query<MessageRow>(
    `INSERT INTO job_messages (job_id, sender_uid, sender_role, body)
     VALUES ($1, $2, $3, $4)
     RETURNING id, sender_uid, sender_role, body, created_at`,
    [jobId, auth.uid, participant.role, body],
  )

  const message = rows[0]

  // Broadcast to SSE subscribers on this job
  broadcastChat(jobId, message)

  return NextResponse.json({ message }, { status: 201 })
}
