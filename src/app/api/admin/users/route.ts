/**
 * GET  /api/admin/users  — list all users (paginated, filterable)
 * POST /api/admin/users  — update user (role, is_active)
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

  const { searchParams } = new URL(req.url)
  const page  = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
  const role  = searchParams.get('role')   ?? ''
  const q     = searchParams.get('q')      ?? ''
  const active = searchParams.get('active') ?? ''

  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[]   = []

  if (role)   { params.push(role);   conditions.push(`u.role = $${params.length}`) }
  if (active !== '') {
    params.push(active === 'true')
    conditions.push(`u.is_active = $${params.length}`)
  }
  if (q) {
    params.push(`%${q}%`)
    conditions.push(`(u.display_name ILIKE $${params.length} OR bp.business_name ILIKE $${params.length} OR cp.name ILIKE $${params.length})`)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const [rows, countRows] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT u.id, u.firebase_uid, u.role, u.display_name, u.is_active, u.created_at,
              bp.business_name, bp.category, bp.gstin,
              cp.name AS customer_name,
              dp.name AS driver_name,
              s.status AS sub_status, s.plan AS sub_plan, s.trial_ends_at
       FROM users u
       LEFT JOIN business_profiles  bp ON bp.user_id = u.id
       LEFT JOIN customer_profiles  cp ON cp.user_id = u.id
       LEFT JOIN driver_profiles    dp ON dp.user_id = u.id
       LEFT JOIN subscriptions      s  ON s.user_id  = u.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM users u
       LEFT JOIN business_profiles  bp ON bp.user_id = u.id
       LEFT JOIN customer_profiles  cp ON cp.user_id = u.id
       ${where}`,
      params
    ),
  ])

  return NextResponse.json({
    users: rows,
    total: parseInt(countRows[0]?.total ?? '0', 10),
    page,
    limit,
  })
}

export async function POST(req: NextRequest) {
  const limited = checkLimit(apiLimiter, req)
  if (limited) return limited

  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  const body = await req.json() as {
    userId:    string
    action:    'set_role' | 'activate' | 'deactivate'
    newRole?:  string
  }

  const { userId, action, newRole } = body
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const existing = await query<{ id: string; role: string; is_active: boolean }>(
    'SELECT id, role, is_active FROM users WHERE id = $1 LIMIT 1', [userId]
  )
  if (!existing.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const VALID_ROLES = ['business', 'customer', 'driver', 'admin']
  let updated: Record<string, unknown>[]

  if (action === 'set_role') {
    if (!newRole || !VALID_ROLES.includes(newRole))
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })

    updated = await query<Record<string, unknown>>(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, role, is_active',
      [newRole, userId]
    )
    await logAudit({
      actorUid:   admin.uid,
      actorRole:  'admin',
      action:     'role.change',
      targetType: 'user',
      targetId:   userId,
      oldValue:   { role: existing[0].role },
      newValue:   { role: newRole },
      req,
    })
  } else if (action === 'activate' || action === 'deactivate') {
    const isActive = action === 'activate'
    updated = await query<Record<string, unknown>>(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, role, is_active',
      [isActive, userId]
    )
    await logAudit({
      actorUid:   admin.uid,
      actorRole:  'admin',
      action:     isActive ? 'user.activate' : 'user.deactivate',
      targetType: 'user',
      targetId:   userId,
      oldValue:   { is_active: existing[0].is_active },
      newValue:   { is_active: isActive },
      req,
    })
  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ user: updated[0] })
}
