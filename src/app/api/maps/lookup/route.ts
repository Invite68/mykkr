/**
 * GET /api/maps/lookup?id=...
 *
 * Resolves a HERE place ID (from autocomplete) to full lat/lng + address.
 * API key NEVER leaves this file.
 *
 * Security:
 *   - Firebase Auth required — prevents anonymous draining of HERE API credits
 *   - Rate limited (mapsLimiter: 60/min)
 *   - place ID length capped to prevent overly long upstream requests
 */
import { NextRequest, NextResponse } from 'next/server'
import { lookupById }                from '@/lib/here'
import { requireAuth }               from '@/lib/firebase-admin'
import { mapsLimiter, checkLimit }   from '@/lib/rate-limit'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────────────────────
  const limited = checkLimit(mapsLimiter, req)
  if (limited) return limited

  // ── Auth — must be a logged-in user ─────────────────────────────────────────
  try {
    await requireAuth(req)
  } catch {
    return NextResponse.json({ result: null, error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')?.trim().slice(0, 200)
  if (!id) {
    return NextResponse.json({ result: null, error: 'id required' }, { status: 400 })
  }

  try {
    const result = await lookupById(id)
    return NextResponse.json({ result })
  } catch (err) {
    console.error('[maps/lookup]', err)
    return NextResponse.json({ result: null, error: 'Lookup unavailable' }, { status: 503 })
  }
}
