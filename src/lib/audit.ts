/**
 * Audit log helper — appends to audit_log table.
 * Always fire-and-forget on errors (never block the main response).
 */
import { query }        from '@/lib/db'
import { getClientIp } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

interface AuditParams {
  actorUid:   string
  actorRole:  string
  action:     string
  targetType?: string
  targetId?:   string
  oldValue?:   unknown
  newValue?:   unknown
  req?:        NextRequest
}

export async function logAudit(p: AuditParams): Promise<void> {
  try {
    const ip        = p.req ? getClientIp(p.req) : null
    const userAgent = p.req?.headers.get('user-agent') ?? null
    await query(
      `INSERT INTO audit_log
         (actor_uid, actor_role, action, target_type, target_id, old_value, new_value, ip_address, user_agent)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        p.actorUid,
        p.actorRole,
        p.action,
        p.targetType ?? null,
        p.targetId   ?? null,
        p.oldValue   != null ? JSON.stringify(p.oldValue) : null,
        p.newValue   != null ? JSON.stringify(p.newValue) : null,
        ip,
        userAgent,
      ]
    )
  } catch (err) {
    // Never break the main flow due to audit failure
    console.error('[audit]', err)
  }
}
