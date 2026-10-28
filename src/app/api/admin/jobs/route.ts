/**
 * GET  /api/admin/jobs  — list all jobs
 * POST /api/admin/jobs  — cancel / reassign a job
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

  const offset = (page - 1) * limit
  const conditions: string[] = []
  const params: unknown[]   = []

  if (status) { params.push(status); conditions.push(`j.status = $${params.length}`) }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''

  const [rows, countRows] = await Promise.all([
    query<Record<string, unknown>>(
      // Explicit safe columns — customer_phone and driver_phone NEVER returned,
      // even in encrypted form (ciphertext leaks structural information).
      `SELECT
              j.id, j.ref, j.mode, j.status,
              j.customer_name,
              j.pickup_label, j.pickup_lat, j.pickup_lon,
              j.dropoff_label, j.dropoff_lat, j.dropoff_lon,
              j.vehicle_id, j.distance_km,
              j.fare_estimate, j.fare_accepted_paise, j.fare_server_paise,
              j.driver_id, j.driver_name, j.driver_vehicle,
              j.notes, j.cancel_by, j.cancel_reason,
              j.scheduled_at, j.accepted_at, j.picked_up_at,
              j.completed_at, j.cancelled_at,
              j.created_at, j.updated_at,
              u.display_name AS rider_name,
              dp.name        AS driver_name
       FROM jobs j
       JOIN users u ON u.id = j.rider_id
       LEFT JOIN driver_profiles dp ON dp.user_id = j.driver_id
       ${where}
       ORDER BY j.created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
    query<{ total: string }>(
      `SELECT COUNT(*) AS total FROM jobs j ${where}`,
      params
    ),
  ])

  return NextResponse.json({
    jobs:  rows,
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
    jobId:    string
    action:   'cancel' | 'reopen' | 'complete'
    reason?:  string
  }

  const { jobId, action, reason } = body
  if (!jobId) return NextResponse.json({ error: 'jobId required' }, { status: 400 })

  const existing = await query<{ id: string; status: string }>(
    'SELECT id, status FROM jobs WHERE id = $1 LIMIT 1', [jobId]
  )
  if (!existing.length) return NextResponse.json({ error: 'Job not found' }, { status: 404 })

  const STATUS_MAP: Record<string, string> = {
    cancel:   'cancelled_by_driver',
    reopen:   'open',
    complete: 'completed',
  }
  const newStatus = STATUS_MAP[action]
  if (!newStatus) return NextResponse.json({ error: 'Unknown action' }, { status: 400 })

  await query('UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, jobId])

  await logAudit({ actorUid: admin.uid, actorRole: 'admin', action: `job.${action}`,
    targetType: 'job', targetId: jobId,
    oldValue: { status: existing[0].status }, newValue: { status: newStatus, reason }, req })

  return NextResponse.json({ ok: true, jobId, status: newStatus })
}
