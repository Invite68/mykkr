/**
 * Admin auth helper — server-side only.
 * Verifies the request has a valid Firebase token AND that the user is an admin.
 */
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/firebase-admin'
import { query }       from '@/lib/db'

export interface AdminUser {
  uid:   string
  phone: string
  dbId:  string
}

/**
 * Returns the admin user or throws a NextResponse with the error status.
 * Usage:
 *   const admin = await requireAdmin(req)
 *   if (admin instanceof NextResponse) return admin
 */
export async function requireAdmin(req: NextRequest): Promise<AdminUser | NextResponse> {
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  const rows = await query<{ id: string; role: string }>(
    'SELECT id, role FROM users WHERE firebase_uid = $1 LIMIT 1',
    [auth.uid]
  )
  if (!rows.length || rows[0].role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  return { uid: auth.uid, phone: auth.phone, dbId: rows[0].id }
}
