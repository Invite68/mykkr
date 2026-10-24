/**
 * GET  /api/admin/businesses — list businesses (paginated, filterable)
 * POST /api/admin/businesses — verify / suspend / unsuspend a business
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
  const page     = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
  const limit    = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
  const category = searchParams.get('category') ?? ''
  const verified = searchParams.get('verified')  ?? ''
  const q        = searchParams.get('q')         ?? ''

  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[]   = []

  if (category) { params.push(`%${category}%`); conditions.push(`bp.category ILIKE $${params.length}`) }
  if (verified === 'true')  conditions.push('bp.gstin IS NOT NULL AND bp.gstin != \'\'')
  if (verified === 'false') conditions.push('(bp.gstin IS NULL OR bp.gstin = \'\')')
  if (q) {
    params.push(`%${q}%`)
    conditions.push(`(bp.business_name ILIKE $${params.length} OR bp.city ILIKE $${params.length})`)
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const [rows, countRows] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT bp.*, u.is_active, u.firebase_uid,
              s.status AS sub_status, s.plan AS sub_plan,
              s.current_period_end, s.trial_ends_at
       FROM business_profiles bp
       JOIN users u ON u.id = bp.user_id
       LEFT JOIN subscriptions s ON s.user_id = bp.user_id AND s.plan = 'business'
       ${where}
       ORDER BY bp.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ total: string }>(
      `SELECT COUNT(*) AS total
       FROM business_profiles bp
       JOIN users u ON u.id = bp.user_id
       ${where}`,
      params
    ),
  ])

  return NextResponse.json({
    businesses: rows,
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
    businessId: string
    action:     'verify' | 'suspend' | 'unsuspend' | 'delete'
  }

  const { businessId, action } = body
  if (!businessId) return NextResponse.json({ error: 'businessId required' }, { status: 400 })

  const existing = await query<{ id: string; user_id: string; business_name: string; gstin: string }>(
    'SELECT id, user_id, business_name, gstin FROM business_profiles WHERE id = $1 LIMIT 1',
    [businessId]
  )
  if (!existing.length) return NextResponse.json({ error: 'Business not found' }, { status: 404 })
  const biz = existing[0]

  if (action === 'verify') {
    // Mark business as verified (admin manually confirms)
    await query(
      'UPDATE business_profiles SET verified_at = NOW(), updated_at = NOW() WHERE id = $1',
      [businessId]
    )
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'business.verify',
      targetType: 'business', targetId: businessId,
      newValue: { business_name: biz.business_name }, req })

  } else if (action === 'suspend') {
    await query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [biz.user_id])
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'business.suspend',
      targetType: 'business', targetId: businessId,
      newValue: { business_name: biz.business_name }, req })

  } else if (action === 'unsuspend') {
    await query('UPDATE users SET is_active = true, updated_at = NOW() WHERE id = $1', [biz.user_id])
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'business.unsuspend',
      targetType: 'business', targetId: businessId,
      newValue: { business_name: biz.business_name }, req })

  } else if (action === 'delete') {
    await query('DELETE FROM business_profiles WHERE id = $1', [businessId])
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'business.delete',
      targetType: 'business', targetId: businessId,
      oldValue: { business_name: biz.business_name }, req })

  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, action, businessId })
}
