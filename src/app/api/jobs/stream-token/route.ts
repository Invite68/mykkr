/**
 * POST /api/jobs/stream-token
 *
 * Exchange a valid Firebase ID token for a short-lived SSE stream token.
 * The stream token is passed as ?token= on EventSource connections because
 * the browser EventSource API does not support custom headers.
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Response:
 *   200 { token, expiresInMs }
 *   401 — not authenticated
 *   429 — rate limited
 *   500 — STREAM_TOKEN_SECRET not configured
 *
 * Security:
 *   - Requires valid Firebase Auth Bearer token (server-side check)
 *   - Issued token is HMAC-SHA256 signed and expires in 5 minutes
 *   - Rate limited to prevent token farming
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { issueStreamToken }          from '@/lib/stream-token'
import { apiLimiter, checkLimit }    from '@/lib/rate-limit'

const TTL_MS = 5 * 60 * 1000   // must match stream-token.ts

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  // ── Auth — must have a valid Firebase ID token ────────────────────────────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Issue token ───────────────────────────────────────────────────────────
  try {
    const token = issueStreamToken(auth.uid)
    return NextResponse.json({ token, expiresInMs: TTL_MS })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/jobs/stream-token]', msg)
    // Most likely cause: STREAM_TOKEN_SECRET not set
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }
}
