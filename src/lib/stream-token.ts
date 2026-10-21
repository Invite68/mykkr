/**
 * stream-token.ts
 *
 * Short-lived HMAC-SHA256 tokens for the SSE job stream.
 *
 * Problem: SSE connections are made via EventSource (browser API), which does NOT
 * support custom headers. So we can't send a Bearer token the usual way.
 * Solution: exchange a Firebase ID token for a short-lived signed token passed
 * as a URL query param (?token=...). Tokens expire in 5 minutes.
 *
 * Token format: base64url( uid + "." + expiry + "." + hmac )
 *
 * Security properties:
 *  - HMAC-SHA256 prevents forgery without the server secret
 *  - 5-minute TTL limits the window of a stolen token
 *  - uid is bound in the signature so tokens can't be reused for other users
 *  - Secret never leaves the server (STREAM_TOKEN_SECRET env var)
 *
 * Env required: STREAM_TOKEN_SECRET  (min 32 chars, not NEXT_PUBLIC_)
 */

import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 5 * 60 * 1000   // 5 minutes

function getSecret(): string {
  const s = process.env.STREAM_TOKEN_SECRET
  if (!s || s.length < 32) {
    throw new Error('STREAM_TOKEN_SECRET must be set (min 32 chars)')
  }
  return s
}

function b64uEncode(s: string): string {
  return Buffer.from(s).toString('base64url')
}

function b64uDecode(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf8')
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

/**
 * Issue a short-lived stream token for the given Firebase UID.
 * Call this after verifying the user's Firebase ID token.
 */
export function issueStreamToken(uid: string): string {
  const secret  = getSecret()
  const expiry  = (Date.now() + TTL_MS).toString()
  const payload = b64uEncode(uid) + '.' + b64uEncode(expiry)
  const mac     = sign(payload, secret)
  return payload + '.' + mac
}

/**
 * Verify a stream token. Returns the uid if valid.
 * Throws a string error message if invalid or expired.
 */
export function verifyStreamToken(token: string): string {
  if (!token || typeof token !== 'string') throw 'missing token'

  const parts = token.split('.')
  if (parts.length !== 3) throw 'malformed token'

  const [encUid, encExpiry, mac] = parts
  const payload  = encUid + '.' + encExpiry
  const secret   = getSecret()
  const expected = sign(payload, secret)

  // Constant-time comparison to prevent timing attacks
  const macBuf  = Buffer.from(mac,      'base64url')
  const expBuf  = Buffer.from(expected, 'base64url')
  if (macBuf.length !== expBuf.length || !timingSafeEqual(macBuf, expBuf)) {
    throw 'invalid signature'
  }

  const expiry = parseInt(b64uDecode(encExpiry), 10)
  if (isNaN(expiry) || Date.now() > expiry) throw 'token expired'

  return b64uDecode(encUid)
}
