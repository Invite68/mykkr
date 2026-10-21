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
 * Strict limiter for OTP-adjacent endpoints:
 * 5 requests per 10 minutes per IP.
 * Prevents SMS credit drain from brute-force OTP requests.
 */
export const otpLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 })

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

// ── Helper: get client IP from Next.js request ────────────────────────────────

export function getClientIp(req: Request): string {
  // Prefer Cloudflare's header (set when traffic goes through Cloudflare proxy)
  const cf  = (req.headers as Headers).get('cf-connecting-ip')
  if (cf) return cf

  // Vercel / standard reverse proxy
  const xff = (req.headers as Headers).get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()

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
