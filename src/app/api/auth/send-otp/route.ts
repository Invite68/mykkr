/**
 * POST /api/auth/send-otp
 *
 * Server-side gate before the client calls Firebase signInWithPhoneNumber.
 * This route does NOT send the SMS itself — Firebase client SDK does that.
 * This route enforces rate limits so Firebase's 10 SMS/day quota is protected.
 *
 * Flow:
 *   1. Client calls this route with { phone }
 *   2. We check IP limiter (3 per 10 min) + phone limiter (3 per 10 min)
 *   3. If allowed → return { ok: true }
 *   4. Client then calls Firebase signInWithPhoneNumber() to actually send SMS
 *
 * Security:
 *   - Rate limited by both IP AND phone number
 *   - Phone normalised to E.164 before rate-limit key (prevents +91... vs 91... bypass)
 *   - No Firebase credentials exposed to client
 */

import { NextRequest, NextResponse } from 'next/server'
import { otpLimiter, otpPhoneLimiter, otpDailyLimiter, getClientIp } from '@/lib/rate-limit'

function normalisePhone(raw: string): string | null {
  // Strip everything except digits and leading +
  const cleaned = raw.trim().replace(/[^\d+]/g, '')
  // Must be E.164 format: +[country][number], 8–15 digits after +
  if (/^\+\d{8,15}$/.test(cleaned)) return cleaned
  // Accept 10-digit Indian numbers and prepend +91
  if (/^\d{10}$/.test(cleaned)) return `+91${cleaned}`
  return null
}

export async function POST(req: NextRequest) {
  // ── Rate limit by IP first (cheapest check) ──────────────────────────────
  const ip = getClientIp(req)
  const ipResult = otpLimiter.check(ip)
  if (!ipResult.ok) {
    const retryAfterSec = Math.ceil((ipResult.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many OTP requests. Please wait 10 minutes before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    )
  }

  // ── Parse and validate phone ──────────────────────────────────────────────
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const rawPhone = (body as Record<string, unknown>)?.phone
  if (typeof rawPhone !== 'string' || !rawPhone) {
    return NextResponse.json({ error: 'phone is required' }, { status: 400 })
  }

  const phone = normalisePhone(rawPhone)
  if (!phone) {
    return NextResponse.json(
      { error: 'Invalid phone number. Use format: +91XXXXXXXXXX' },
      { status: 400 }
    )
  }

  // ── Rate limit by phone number — 10-minute window ────────────────────────
  const phoneResult = otpPhoneLimiter.check(`otp:phone:${phone}`)
  if (!phoneResult.ok) {
    const retryAfterSec = Math.ceil((phoneResult.resetAt - Date.now()) / 1000)
    return NextResponse.json(
      { error: 'Too many OTP requests for this number. Please wait 10 minutes.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      }
    )
  }

  // ── Rate limit by phone number — daily cap (9 per 24 hours) ──────────────
  const dailyResult = otpDailyLimiter.check(`otp:day:${phone}`)
  if (!dailyResult.ok) {
    return NextResponse.json(
      { error: 'Daily OTP limit reached for this number. Please try again tomorrow.' },
      { status: 429 }
    )
  }

  // ── Allowed — client can proceed to call Firebase ─────────────────────────
  return NextResponse.json({ ok: true, phone })
}
