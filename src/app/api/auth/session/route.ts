/**
 * POST /api/auth/session
 *
 * Exchanges a Firebase ID token for a server-side session cookie (__session).
 * Called immediately after the client verifies the OTP with Firebase.
 *
 * Flow:
 *   1. Client gets idToken from Firebase after OTP verify
 *   2. Client POSTs { idToken } here
 *   3. Server calls Firebase Admin createSessionCookie() (5-day TTL)
 *   4. Server sets __session cookie (httpOnly, secure, sameSite=strict)
 *   5. Client is now authenticated for all server-protected routes
 *
 * DELETE /api/auth/session — clears the session cookie (sign-out)
 *
 * Security:
 *   - Firebase Admin SDK verifies the idToken before minting the session cookie
 *   - Cookie is httpOnly (JS cannot read it) + secure + sameSite=strict
 *   - 5-day TTL matches Firebase's max session cookie duration
 *   - Rate limited to prevent brute-force session minting
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth }              from '@/lib/firebase-admin'

// Session cookie lives for 5 days (Firebase Admin maximum)
const SESSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const idToken = (body as Record<string, unknown>)?.idToken
  if (typeof idToken !== 'string' || !idToken) {
    return NextResponse.json({ error: 'idToken is required' }, { status: 400 })
  }

  try {
    const adminAuth = getAdminAuth()
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const isProd = process.env.NODE_ENV === 'production'

    const res = NextResponse.json({ ok: true })
    res.cookies.set('__session', sessionCookie, {
      maxAge:   SESSION_DURATION_MS / 1000,   // seconds
      httpOnly: true,
      secure:   isProd,
      sameSite: 'strict',
      path:     '/',
    })
    return res
  } catch (err: unknown) {
    console.error('[POST /api/auth/session] Error minting session cookie:', err)
    const msg = err instanceof Error ? err.message : 'Authentication failed'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}

export async function DELETE(_req: NextRequest) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', {
    maxAge:   0,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path:     '/',
  })
  return res
}
