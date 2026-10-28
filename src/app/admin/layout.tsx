/**
 * /admin layout — Server Component wrapper.
 *
 * This file is what Next.js App Router picks up as the layout for all /admin/* routes.
 * It wraps every admin page with AdminAuthGuard (a Server Component) which verifies
 * the Firebase session cookie and checks role = 'admin' in the DB.
 *
 * If the auth check fails → immediate redirect to /admin-login (server-side, no flash).
 * If it passes → renders AdminLayout (the 'use client' UI shell) around {children}.
 *
 * Security architecture:
 *   1. Edge Middleware (src/middleware.ts):
 *      Fast check — if __session cookie is absent, redirect to /admin-login immediately.
 *      Cannot verify the token (Firebase Admin SDK needs Node.js crypto, not Edge runtime).
 *
 *   2. AdminAuthGuard (src/app/admin/auth-guard.tsx):
 *      Full verification — verifies the Firebase session cookie signature + expiry,
 *      then checks users.role = 'admin' in the DB. This catches:
 *        - Expired or revoked Firebase sessions
 *        - Valid Firebase token but demoted admin (role changed in DB)
 *        - Forged cookie values
 *
 *   3. requireAdmin() in /api/admin/* routes:
 *      Bearer token verification + DB role check for every API call.
 *      The UI can never bypass this even if the server component guard were removed.
 */

import AdminAuthGuard from './auth-guard'
import AdminLayout    from './AdminLayout'

export default function AdminServerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminAuthGuard>
  )
}
