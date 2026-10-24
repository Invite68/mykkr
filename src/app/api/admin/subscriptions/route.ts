/**
 * GET  /api/admin/subscriptions — list all subscriptions
 * POST /api/admin/subscriptions — grant / cancel / extend a subscription
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
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
  const limit  = Math.min(100, parseInt(searchParams.get('limit') ?? '50', 10))
  const status = searchParams.get('status') ?? ''
  const plan   = searchParams.get('plan')   ?? ''

  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[]   = []

  if (status) { params.push(status); conditions.push(`s.status = $${params.length}`) }
  if (plan)   { params.push(plan);   conditions.push(`s.plan   = $${params.length}`) }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const [rows, countRows, revenueRows] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT s.*,
              u.firebase_uid, u.display_name, u.is_active,
              bp.business_name,
              cp.name AS customer_name,
              COALESCE(
                (SELECT SUM(amount_paise) FROM subscription_payments sp
                 WHERE sp.subscription_id = s.id AND sp.status = 'captured'), 0
              ) AS total_paid_paise
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN business_profiles bp ON bp.user_id = s.user_id
       LEFT JOIN customer_profiles cp ON cp.user_id = s.user_id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM subscriptions s ${where}`,
      params
    ),
    query<{ total: string }>(
      `SELECT COALESCE(SUM(amount_paise), 0) AS total
       FROM subscription_payments WHERE status = 'captured'`
    ),
  ])

  return NextResponse.json({
    subscriptions: rows,
    total:         parseInt(countRows[0]?.total ?? '0', 10),
    totalRevenuePaise: parseInt(revenueRows[0]?.total ?? '0', 10),
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
    subscriptionId?: string
    userId?:         string
    action:          'grant' | 'cancel' | 'extend' | 'pause' | 'reactivate'
    plan?:           'business' | 'customer'
    days?:           number   // for extend
  }

  const { subscriptionId, userId, action, plan, days } = body

  // ── GRANT — create a free subscription for a user ──────────────────────────
  if (action === 'grant') {
    if (!userId || !plan) return NextResponse.json({ error: 'userId and plan required' }, { status: 400 })
    const userRows = await query<{ id: string }>('SELECT id FROM users WHERE id = $1 LIMIT 1', [userId])
    if (!userRows.length) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const now   = new Date()
    const end   = new Date(now)
    end.setDate(end.getDate() + 30)

    const rows = await query<Record<string, unknown>>(
      `INSERT INTO subscriptions (user_id, plan, status, current_period_start, current_period_end)
       VALUES ($1, $2, 'active', $3, $4)
       ON CONFLICT (user_id) DO UPDATE
         SET plan = $2, status = 'active', current_period_start = $3, current_period_end = $4, updated_at = NOW()
       RETURNING *`,
      [userId, plan, now.toISOString(), end.toISOString()]
    )
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'subscription.grant',
      targetType: 'subscription', targetId: rows[0].id as string,
      newValue: { plan, userId }, req })
    return NextResponse.json({ subscription: rows[0] })
  }

  // All other actions need subscriptionId
  if (!subscriptionId) return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 })

  const existing = await query<Record<string, unknown>>(
    'SELECT * FROM subscriptions WHERE id = $1 LIMIT 1', [subscriptionId]
  )
  if (!existing.length) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })

  if (action === 'cancel') {
    await query(
      'UPDATE subscriptions SET status = $1, cancelled_at = NOW(), updated_at = NOW() WHERE id = $2',
      ['cancelled', subscriptionId]
    )
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'subscription.cancel',
      targetType: 'subscription', targetId: subscriptionId,
      oldValue: { status: existing[0].status }, newValue: { status: 'cancelled' }, req })

  } else if (action === 'pause') {
    await query(
      'UPDATE subscriptions SET status = $1, updated_at = NOW() WHERE id = $2',
      ['past_due', subscriptionId]
    )
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'subscription.pause',
      targetType: 'subscription', targetId: subscriptionId,
      oldValue: { status: existing[0].status }, newValue: { status: 'past_due' }, req })

  } else if (action === 'reactivate') {
    await query(
      'UPDATE subscriptions SET status = $1, cancelled_at = NULL, updated_at = NOW() WHERE id = $2',
      ['active', subscriptionId]
    )
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'subscription.reactivate',
      targetType: 'subscription', targetId: subscriptionId,
      newValue: { status: 'active' }, req })

  } else if (action === 'extend') {
    const extDays = Math.min(365, Math.max(1, days ?? 30))
    await query(
      `UPDATE subscriptions
       SET current_period_end = GREATEST(current_period_end, NOW()) + ($1 || ' days')::INTERVAL,
           status = 'active', updated_at = NOW()
       WHERE id = $2`,
      [String(extDays), subscriptionId]
    )
    await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: 'subscription.extend',
      targetType: 'subscription', targetId: subscriptionId,
      newValue: { extendedDays: extDays }, req })

  } else {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }

  const updated = await query('SELECT * FROM subscriptions WHERE id = $1 LIMIT 1', [subscriptionId])
  return NextResponse.json({ subscription: updated[0] })
}
