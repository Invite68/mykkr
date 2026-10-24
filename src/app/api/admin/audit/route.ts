/**
 * GET /api/admin/audit — paginated audit log
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin }  from '@/lib/admin-auth'
import { readLimiter, checkLimit } from '@/lib/rate-limit'
import { query }         from '@/lib/db'

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  const admin = await requireAdmin(req)
  if (admin instanceof NextResponse) return admin

  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, parseInt(searchParams.get('page')  ?? '1',  10))
  const limit  = Math.min(200, parseInt(searchParams.get('limit') ?? '100', 10))
  const action = searchParams.get('action') ?? ''

  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[]   = []

  if (action) { params.push(`%${action}%`); conditions.push(`a.action ILIKE $${params.length}`) }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const [rows, countRows] = await Promise.all([
    query<Record<string, unknown>>(
      `SELECT a.*, u.display_name AS actor_name
       FROM audit_log a
       LEFT JOIN users u ON u.firebase_uid = a.actor_uid
       ${where}
       ORDER BY a.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM audit_log a ${where}`,
      params
    ),
  ])

  return NextResponse.json({
    logs:  rows,
    total: parseInt(countRows[0]?.total ?? '0', 10),
    page,
    limit,
  })
}
