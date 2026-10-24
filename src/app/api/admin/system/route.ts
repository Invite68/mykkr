/**
 * GET  /api/admin/system — system health & config
 * POST /api/admin/system — update platform settings
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }  from '@/lib/admin-auth'
import { readLimiter, apiLimiter, checkLimit } from '@/lib/rate-limit'
import { query }         from '@/lib/db'
import { logAudit }      from '@/lib/audit'

// In-memory platform settings (persisted to platform_settings table)
// Falls back to defaults if table doesn't exist yet.

const DEFAULTS = {
  businessSubPriceInr:    99,
  customerSubPriceInr:    9.99,
  trialDays:              7,
  maxPhotosPerListing:    5,
  maintenanceMode:        false,
  newRegistrationsOpen:   true,
  driverRegistrationsOpen: true,
}

async function getSettings(): Promise<typeof DEFAULTS> {
  try {
    const rows = await query<{ key: string; value: string }>(
      'SELECT key, value FROM platform_settings'
    )
    const map: Record<string, unknown> = { ...DEFAULTS }
    for (const row of rows) {
      try { map[row.key] = JSON.parse(row.value) } catch { map[row.key] = row.value }
    }
    return map as typeof DEFAULTS
  } catch {
    return DEFAULTS
  }
}

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  const [settings, dbCheck] = await Promise.all([
    getSettings(),
    query<{ now: string }>('SELECT NOW() AS now').then(() => 'ok').catch(() => 'error'),
  ])

  return NextResponse.json({
    settings,
    health: {
      db:      dbCheck,
      uptime:  process.uptime(),
      nodeEnv: process.env.NODE_ENV,
      version: process.env.npm_package_version ?? '1.0.0',
    },
  })
}

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  const body = await req.json() as Record<string, unknown>

  // Ensure platform_settings table exists
  await query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  const allowed = Object.keys(DEFAULTS)
  const updates = Object.entries(body).filter(([k]) => allowed.includes(k))

  if (!updates.length) return NextResponse.json({ error: 'No valid settings provided' }, { status: 400 })

  const oldSettings = await getSettings()

  for (const [key, value] of updates) {
    await query(
      `INSERT INTO platform_settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    )
  }

  const newSettings = await getSettings()

  await logAudit({
    actorUid:   admin.uid,
    actorRole:  'admin',
    action:     'system.settings.update',
    targetType: 'platform',
    oldValue:   oldSettings,
    newValue:   newSettings,
    req,
  })

  return NextResponse.json({ settings: newSettings })
}
