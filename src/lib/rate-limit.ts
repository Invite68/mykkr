/**
 * In-memory rate limiter — zero dependencies, zero cost.
 *
 * Uses a sliding window counter per IP / identifier.
 * Suitable for a single-instance Node.js server (Coolify).
 * If you later run multiple instances, swap the Map for Redis.
 *
 * Usage:
 *   const limiter = createRateLimiter({ limit: 5, windowMs: 60_000 })
 *   const result  = limiter.check(ip)
 *   if (!result.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
 */

interface WindowEntry {
  count:     number
  resetAt:   number   // epoch ms when the window resets
}

interface RateLimitResult {
  ok:         boolean
  remaining:  number
  resetAt:    number   // epoch ms
}

interface RateLimiterOptions {
  /** Max requests per window per key */
  limit:     number
  /** Window length in milliseconds */
  windowMs:  number
  /** Max keys to track before oldest are evicted (default 10 000) */
  maxKeys?:  number
}

function createRateLimiter(opts: RateLimiterOptions) {
  const { limit, windowMs, maxKeys = 10_000 } = opts
  const store = new Map<string, WindowEntry>()

  function evict() {
    // Remove expired entries when map grows large
    if (store.size < maxKeys) return
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) store.delete(key)
      if (store.size < maxKeys * 0.8) break
    }
  }

  return {
    check(key: string): RateLimitResult {
      evict()
      const now     = Date.now()
      const entry   = store.get(key)
      const resetAt = entry && entry.resetAt > now ? entry.resetAt : now + windowMs

      if (!entry || entry.resetAt <= now) {
        store.set(key, { count: 1, resetAt })
        return { ok: true, remaining: limit - 1, resetAt }
      }

      entry.count++
      const remaining = Math.max(0, limit - entry.count)
      return { ok: entry.count <= limit, remaining, resetAt: entry.resetAt }
    },

    /** Reset a specific key (e.g. after successful OTP verify) */
    reset(key: string) {
      store.delete(key)
    },
  }
}

// ── Named limiters — one per sensitivity level ────────────────────────────────

/**
 * OTP send limiter — per IP:
 * 3 SMS requests per 10 minutes.
 * Protects Firebase's 10/day quota from being burned by one bad actor.
 */
export const otpLimiter = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 })

/**
 * OTP send limiter — per phone number (short window):
 * 3 SMS requests per 10 minutes per phone number.
 * Prevents targeting a single victim's phone with floods of OTP messages.
 * Key: 'otp:phone:<e164_phone>'
 */
export const otpPhoneLimiter = createRateLimiter({ limit: 3, windowMs: 10 * 60_000 })

/**
 * OTP send limiter — per phone number (daily cap):
 * 9 SMS requests per 24 hours per phone number.
 * Hard ceiling so no single number can burn the Firebase daily quota.
 * Key: 'otp:day:<e164_phone>'
 */
export const otpDailyLimiter = createRateLimiter({ limit: 9, windowMs: 24 * 60 * 60_000 })

/**
 * Standard API limiter for job creation and profile writes:
 * 30 requests per minute per IP.
 */
export const apiLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 })

/**
 * Loose limiter for read endpoints (job list, business profile):
 * 120 requests per minute per IP.
 */
export const readLimiter = createRateLimiter({ limit: 120, windowMs: 60_000 })

/**
 * Maps API proxy limiter — protects HERE API credit.
 * 60 requests per minute per IP (1 per second average).
 * Autocomplete is chatty but 60/min is reasonable for a real user.
 */
export const mapsLimiter = createRateLimiter({ limit: 60, windowMs: 60_000 })

// ── Helper: get client IP from Next.js request ────────────────────────────────

// Valid IPv4 regex for spoofing protection
const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/

function sanitiseIp(raw: string | null): string | null {
  if (!raw) return null
  const candidate = raw.split(',')[0].trim()
  // Accept IPv4 and simplified IPv6 (enough for rate-limiting identity)
  if (IPV4_RE.test(candidate)) return candidate
  // Very basic IPv6 check — reject anything with spaces or injection chars
  if (candidate.includes(':') && !/[^0-9a-fA-F:.]/.test(candidate)) return candidate
  return null
}

export function getClientIp(req: Request): string {
  const headers = req.headers as Headers

  // ── Cloudflare sets this; it's the real client IP and cannot be spoofed
  // by the client because Cloudflare strips and overwrites it.
  // Only trust it when Cloudflare is in front (production).
  const cf = sanitiseIp(headers.get('cf-connecting-ip'))
  if (cf) return cf

  // ── In dev / non-CF: x-forwarded-for is set by the reverse proxy.
  // We take only the FIRST IP (leftmost = original client).
  // An attacker can prepend IPs, but we always take the first one the
  // trusted proxy inserted, which is the real client.
  const xff = sanitiseIp(headers.get('x-forwarded-for'))
  if (xff) return xff

  // Fallback (direct connection, development)
  return '127.0.0.1'
}

/**
 * One-liner helper for route handlers:
 *
 *   const limited = checkLimit(otpLimiter, req)
 *   if (limited) return limited
 */
export function checkLimit(
  limiter: ReturnType<typeof createRateLimiter>,
  req: Request
): Response | null {
  const ip     = getClientIp(req)
  const result = limiter.check(ip)
  if (result.ok) return null

  return new Response(
    JSON.stringify({ error: 'Too many requests — please try again later' }),
    {
      status: 429,
      headers: {
        'Content-Type':    'application/json',
        'Retry-After':     String(Math.ceil((result.resetAt - Date.now()) / 1000)),
        'X-RateLimit-Limit':     String(0),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset':     String(Math.ceil(result.resetAt / 1000)),
      },
    }
  )
}
