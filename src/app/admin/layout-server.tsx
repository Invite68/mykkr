/**
 * Server-side wrapper for the admin layout.
 *
 * Next.js App Router convention:
 *   layout.tsx  — the file the framework picks up automatically.
 *
 * The actual admin UI layout (AdminLayout) is a 'use client' component because
 * it uses React state for tab scrolling. Server Components cannot be 'use client'.
 *
 * To enforce server-side auth BEFORE the client layout renders, we use
 * AdminAuthGuard — a Server Component that verifies the Firebase session cookie
 * and checks role = 'admin' in the DB. If the check fails, it redirects to
 * /admin-login before any of the admin UI is sent to the browser.
 *
 * How this fits together:
 *   layout.tsx  (this file, Server Component)
 *     └─ AdminAuthGuard  (Server Component, verifies session cookie + DB role)
 *         └─ AdminLayout  ('use client', only reached if auth passes)
 *             └─ {children}
 *
 * This file re-exports the default from layout.tsx to keep the file Next.js
 * reads (layout.tsx) as a server component while keeping the client UI separate.
 */

// This file is not used by Next.js directly — see layout.tsx.
// It exists only to document the architecture.
export {}
