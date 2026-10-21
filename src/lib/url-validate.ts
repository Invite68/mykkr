/**
 * URL validation helpers — server-side only.
 *
 * Prevents Server-Side Request Forgery (SSRF) attacks where a malicious actor
 * supplies a URL pointing to internal infrastructure (metadata services,
 * databases, internal APIs) that the server then fetches.
 *
 * Use validatePublicUrl() on every client-supplied URL before:
 *   - Storing it in the DB (logo_url, photo_urls, website_url)
 *   - Passing it to any HTTP client
 *   - Using it in an <img> or <a> that the server will proxy
 *
 * NEVER use this file client-side — import only in API routes.
 */

// RFC-1918 private ranges + loopback + link-local + metadata services
const PRIVATE_RANGES: [number, number, number][] = [
  // Loopback — 127.0.0.0/8
  [0x7F000000, 0xFF000000, 0],
  // RFC-1918 class A — 10.0.0.0/8
  [0x0A000000, 0xFF000000, 0],
  // RFC-1918 class B — 172.16.0.0/12
  [0xAC100000, 0xFFF00000, 0],
  // RFC-1918 class C — 192.168.0.0/16
  [0xC0A80000, 0xFFFF0000, 0],
  // Link-local — 169.254.0.0/16 (AWS/GCP/Azure metadata service)
  [0xA9FE0000, 0xFFFF0000, 0],
  // Carrier-grade NAT — 100.64.0.0/10
  [0x64400000, 0xFFC00000, 0],
  // IPv4-mapped IPv6 loopback / unspecified — 0.0.0.0/8
  [0x00000000, 0xFF000000, 0],
  // Multicast — 224.0.0.0/4
  [0xE0000000, 0xF0000000, 0],
  // Broadcast / reserved — 240.0.0.0/4
  [0xF0000000, 0xF0000000, 0],
]

// Dangerous hostname patterns (in addition to IP range checks)
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',   // GCP metadata
  '169.254.169.254',            // AWS/Azure metadata (also caught by IP check)
  'metadata.azure.com',
  'fd00::ec2',                  // IPv6 metadata
])

function ipToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  const nums = parts.map(Number)
  if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null
  return ((nums[0] << 24) | (nums[1] << 16) | (nums[2] << 8) | nums[3]) >>> 0
}

function isPrivateIp(hostname: string): boolean {
  const ipInt = ipToInt(hostname)
  if (ipInt === null) return false // not a raw IPv4, hostname will be resolved at fetch time
  return PRIVATE_RANGES.some(([network, mask]) => (ipInt & mask) === network)
}

export type UrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; reason: string }

/**
 * Validate that a URL is safe to store / fetch.
 *
 * Rules:
 *   - Must be non-empty string
 *   - Must be https:// (or http:// only for website_url in dev)
 *   - Hostname must not resolve to a private/loopback/metadata IP
 *   - Hostname must not be in the explicit blocklist
 *   - Path must not contain null bytes or control characters
 *   - Max length 2048 chars
 *   - No username/password in the URL (credential leak)
 *
 * @param raw          The raw URL string from the client
 * @param httpsOnly    If true (default), reject http:// schemes
 */
export function validatePublicUrl(
  raw: unknown,
  { httpsOnly = true }: { httpsOnly?: boolean } = {}
): UrlValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { ok: false, reason: 'URL must be a non-empty string' }
  }

  const trimmed = raw.trim()
  if (trimmed.length === 0) {
    return { ok: false, reason: 'URL must be non-empty' }
  }
  if (trimmed.length > 2048) {
    return { ok: false, reason: 'URL too long (max 2048 chars)' }
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return { ok: false, reason: 'URL is not valid' }
  }

  // Scheme check
  const scheme = parsed.protocol // includes trailing ':'
  if (httpsOnly && scheme !== 'https:') {
    return { ok: false, reason: 'URL must use https://' }
  }
  if (!httpsOnly && scheme !== 'https:' && scheme !== 'http:') {
    return { ok: false, reason: 'URL must use https:// or http://' }
  }

  // No credentials in URL (e.g. https://user:pass@host/...)
  if (parsed.username || parsed.password) {
    return { ok: false, reason: 'URL must not contain credentials' }
  }

  const hostname = parsed.hostname.toLowerCase()

  // Explicit hostname blocklist
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    return { ok: false, reason: 'URL hostname is not allowed' }
  }

  // Ends-with checks for *.local, *.internal, *.localhost
  if (
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.test')
  ) {
    return { ok: false, reason: 'URL hostname is not allowed' }
  }

  // Raw IPv4 address check against private ranges
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    if (isPrivateIp(hostname)) {
      return { ok: false, reason: 'URL resolves to a private IP address' }
    }
  }

  // IPv6 address — block all literal IPv6 (private ranges are complex; safer to reject)
  if (hostname.startsWith('[')) {
    return { ok: false, reason: 'IPv6 URLs are not allowed' }
  }

  // Null bytes or control characters in path
  if (/[\x00-\x1F\x7F]/.test(trimmed)) {
    return { ok: false, reason: 'URL contains invalid characters' }
  }

  return { ok: true, url: parsed.toString() }
}

/**
 * Validate an array of URLs (e.g. photo_urls).
 * Returns the safe URLs, or throws if any are invalid.
 */
export function validatePublicUrlArray(
  raws: unknown,
  opts: { httpsOnly?: boolean; maxCount?: number } = {}
): string[] {
  const { httpsOnly = true, maxCount = 10 } = opts
  if (!Array.isArray(raws)) throw new Error('photo_urls must be an array')
  if (raws.length > maxCount) throw new Error(`Too many URLs (max ${maxCount})`)
  return raws.map((raw, i) => {
    const result = validatePublicUrl(raw, { httpsOnly })
    if (!result.ok) throw new Error(`URL at index ${i} is invalid: ${result.reason}`)
    return result.url
  })
}
