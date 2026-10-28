/**
 * AdminAuthGuard — Server Component
 *
 * Wraps all /admin/* pages. Reads the Firebase session cookie and
 * verifies the user is an admin before rendering children.
 *
 * This is a server-side guard. The client layout (layout.tsx) is
 * purely presentational; this file handles auth.
 *
 * How it works:
 *   - Browser stores the Firebase ID token in a cookie called `__session`
 *     (set by the client after Firebase sign-in via /api/auth/session)
 *   - We read and verify that cookie here on the server
 *   - If invalid / missing / not admin → redirect to /admin-login
 *
 * NOTE: Until Firebase Auth is fully wired to set __session,
 * this guard falls back to checking ADMIN_BYPASS_SECRET (dev only).
 * In production, ADMIN_BYPASS_SECRET must NOT be set.
 */

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminAuth } from '@/lib/firebase-admin-server'
import { query }     from '@/lib/db'

async function verifyAdminSession(): Promise<boolean> {
  // ── Dev bypass — ONLY when no production secret is set ──────────────────────
  // Remove this block entirely before shipping to production.
  if (process.env.NODE_ENV !== 'production' && !process.env.ADMIN_BYPASS_SECRET) {
    // In local dev without Firebase configured, allow access so layout renders
    return true
  }

  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('__session')?.value

    if (!sessionCookie) return false

    // Verify the Firebase session cookie (5-day expiry set at sign-in)
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true)

    // Check DB role — never trust a client claim
    const rows = await query<{ role: string }>(
      'SELECT role FROM users WHERE firebase_uid = $1 LIMIT 1',
      [decoded.uid]
    )

    return rows.length > 0 && rows[0].role === 'admin'
  } catch {
    return false
  }
}

export default async function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await verifyAdminSession()

  if (!isAdmin) {
    redirect('/admin-login')
  }

  return <>{children}</>
}
