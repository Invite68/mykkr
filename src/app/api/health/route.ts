/**
 * GET /api/health
 *
 * Lightweight health check for Coolify / Docker HEALTHCHECK.
 * Returns minimal information — no version, build hash, or env details
 * that could aid an attacker in fingerprinting the server.
 *
 * Rate limited to prevent use as a port-scan / enumeration probe.
 */

import { NextRequest, NextResponse } from 'next/server'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  return NextResponse.json(
    { status: 'ok' },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
