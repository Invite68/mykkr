/**
 * GET  /api/admin/fare-rates — list all fare rates
 * POST /api/admin/fare-rates — update a fare rate
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }  from '@/lib/admin-auth'
import { readLimiter, apiLimiter, checkLimit } from '@/lib/rate-limit'
import { query }         from '@/lib/db'
import { logAudit }      from '@/lib/audit'

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  const rows = await query('SELECT * FROM fare_rates ORDER BY vehicle_type, mode')
  return NextResponse.json({ fareRates: rows })
}

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  const body = await req.json() as {
    id:                  number
    baseFarePaise?:      number
    perKmPaise?:         number
    perMinPaise?:        number
    surgeMultiplierX100?: number
    isActive?:           boolean
  }

  const { id, baseFarePaise, perKmPaise, perMinPaise, surgeMultiplierX100, isActive } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const existing = await query<Record<string, unknown>>(
    'SELECT * FROM fare_rates WHERE id = $1 LIMIT 1', [id]
  )
  if (!existing.length) return NextResponse.json({ error: 'Fare rate not found' }, { status: 404 })

  const updates: string[] = []
  const params: unknown[] = []

  if (baseFarePaise      != null) { params.push(Math.max(0, baseFarePaise));       updates.push(`base_fare_paise = $${params.length}`) }
  if (perKmPaise         != null) { params.push(Math.max(0, perKmPaise));          updates.push(`per_km_paise = $${params.length}`) }
  if (perMinPaise        != null) { params.push(Math.max(0, perMinPaise));         updates.push(`per_min_paise = $${params.length}`) }
  if (surgeMultiplierX100 != null) { params.push(Math.max(100, surgeMultiplierX100)); updates.push(`surge_multiplier_x100 = $${params.length}`) }
  if (isActive           != null) { params.push(isActive);                         updates.push(`is_active = $${params.length}`) }

  if (!updates.length) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

  params.push(id)
  const rows = await query<Record<string, unknown>>(
    `UPDATE fare_rates SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length} RETURNING *`,
    params
  )

  await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'fare_rate.update',
    targetType: 'fare_rate', targetId: String(id),
    oldValue: existing[0], newValue: rows[0], req })

  return NextResponse.json({ fareRate: rows[0] })
}
