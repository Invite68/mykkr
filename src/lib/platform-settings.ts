/**
 * platform-settings.ts
 *
 * Server-only helper for reading/writing the platform_settings table.
 * Never import this from a client component — it uses the pg pool directly.
 *
 * All reads cache for 60 seconds in-process to avoid a DB hit on every
 * page load. Cache is cleared on write so admin changes take effect
 * within one minute even without a restart.
 *
 * Security:
 * - Only requireAdmin() routes should call set().
 * - get() is safe to call from any server component / route.
 */

import { query } from '@/lib/db'

// ── In-process cache ────────────────────────────────────────────────────────
const CACHE_TTL_MS = 60_000

interface CacheEntry {
  value: string
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

function cacheGet(key: string): string | undefined {
  const entry = cache.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expiresAt) { cache.delete(key); return undefined }
  return entry.value
}

function cacheSet(key: string, value: string) {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS })
}

function cacheDel(key: string) {
  cache.delete(key)
}

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Read a setting value. Returns the default if the key is not in the DB.
 */
export async function getSetting(key: string, fallback = ''): Promise<string> {
  const cached = cacheGet(key)
  if (cached !== undefined) return cached

  const rows = await query<{ value: string }>(
    'SELECT value FROM platform_settings WHERE key = $1',
    [key],
  )
  const value = rows[0]?.value ?? fallback
  cacheSet(key, value)
  return value
}

/**
 * Convenience: read a boolean setting ('true' / 'false').
 */
export async function getBoolSetting(key: string, fallback = false): Promise<boolean> {
  const raw = await getSetting(key, fallback ? 'true' : 'false')
  return raw === 'true'
}

/**
 * Convenience: read a numeric integer setting.
 */
export async function getIntSetting(key: string, fallback = 0): Promise<number> {
  const raw = await getSetting(key, String(fallback))
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? n : fallback
}

/**
 * Update a setting. updatedBy should be the admin's Firebase UID.
 * Only call this from routes protected by requireAdmin().
 *
 * key        — must match an existing row (never creates new keys from user input)
 * value      — new value string
 * updatedBy  — admin uid for audit trail
 */
export async function setSetting(key: string, value: string, updatedBy: string): Promise<void> {
  // Only allow keys that already exist — prevents arbitrary key injection
  await query(
    `UPDATE platform_settings
        SET value      = $1,
            updated_at = now(),
            updated_by = $2
      WHERE key = $3`,
    [value, updatedBy, key],
  )
  cacheDel(key)
}

/**
 * Read all settings at once (for admin panel display).
 */
export interface PlatformSetting {
  key: string
  value: string
  description: string
  updatedAt: string
  updatedBy: string | null
}

export async function getAllSettings(): Promise<PlatformSetting[]> {
  const rows = await query<{
    key: string
    value: string
    description: string
    updated_at: string
    updated_by: string | null
  }>(
    'SELECT key, value, description, updated_at, updated_by FROM platform_settings ORDER BY key',
  )
  return rows.map((r) => ({
    key: r.key,
    value: r.value,
    description: r.description,
    updatedAt: r.updated_at,
    updatedBy: r.updated_by,
  }))
}

// ── Named accessors (strongly typed, self-documenting) ──────────────────────

/**
 * Is driver subscription billing active?
 * When false, drivers access the platform for free.
 */
export async function isDriverSubscriptionEnabled(): Promise<boolean> {
  return getBoolSetting('driver_subscription_enabled', false)
}

/**
 * Monthly subscription fee for drivers in INR (integer paise × 100 for Razorpay).
 */
export async function getDriverPlanAmountRupees(): Promise<number> {
  return getIntSetting('driver_plan_amount', 49)
}
