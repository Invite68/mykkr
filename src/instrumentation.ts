/**
 * Next.js Instrumentation — runs once at server startup.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * Used to:
 *   1. Validate required environment variables (fails fast before serving requests)
 *   2. Any other startup checks (e.g. DB connectivity smoke test)
 *
 * This file is auto-detected by Next.js — no additional config needed.
 */

export async function register() {
  // Only run server-side validation when actually on the server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { assertEnvVars } = await import('@/lib/env-check')
    assertEnvVars()
    console.log('[startup] Environment variables OK')
  }
}
