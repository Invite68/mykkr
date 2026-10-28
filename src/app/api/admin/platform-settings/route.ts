/**
 * GET  /api/admin/platform-settings — list all settings (admin only)
 * POST /api/admin/platform-settings — update a single setting (admin only)
 *
 * Security:
 * - requireAdmin() enforced on every request (Firebase session cookie + DB role check)
 * - setSetting() only updates EXISTING keys (no arbitrary key injection)
 * - value is type-validated against the key before write
 * - Rate limited by the standard admin limiter inherited from requireAdmin
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { getAllSettings, setSetting } from '@/lib/platform-settings'

// Keys that admins are permitted to change, and their allowed types.
// Any key NOT in this map will be rejected — belt and braces on top of
// setSetting()'s UPDATE-only behaviour.
const ALLOWED_KEYS: Record<string, 'boolean' | 'integer'> = {
  driver_subscription_enabled: 'boolean',
  driver_plan_amount:           'integer',
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    const settings = await getAllSettings()
    return NextResponse.json({ settings })
  } catch (err) {
    console.error('[platform-settings GET]', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req)
  if (authResult instanceof NextResponse) return authResult
  const { uid } = authResult

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    typeof (body as Record<string, unknown>).key !== 'string' ||
    (body as Record<string, unknown>).value === undefined
  ) {
    return NextResponse.json({ error: 'key and value are required' }, { status: 400 })
  }

  const { key, value } = body as { key: string; value: unknown }

  const expectedType = ALLOWED_KEYS[key]
  if (!expectedType) {
    return NextResponse.json({ error: `Unknown or read-only setting: ${key}` }, { status: 400 })
  }

  // Type-validate value
  let stringValue: string
  if (expectedType === 'boolean') {
    if (value !== true && value !== false && value !== 'true' && value !== 'false') {
      return NextResponse.json({ error: `${key} must be a boolean` }, { status: 400 })
    }
    stringValue = value === true || value === 'true' ? 'true' : 'false'
  } else {
    // integer
    const n = typeof value === 'number' ? value : parseInt(String(value), 10)
    if (!Number.isInteger(n) || n < 0 || n > 100_000) {
      return NextResponse.json({ error: `${key} must be a non-negative integer ≤ 100000` }, { status: 400 })
    }
    stringValue = String(n)
  }

  try {
    await setSetting(key, stringValue, uid)
    return NextResponse.json({ ok: true, key, value: stringValue })
  } catch (err) {
    console.error('[platform-settings POST]', err)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
