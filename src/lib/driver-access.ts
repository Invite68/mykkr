/**
 * driver-access.ts
 *
 * Server-only helper — checks whether a driver is permitted to accept jobs.
 *
 * Rules:
 *  1. If driver_subscription_enabled = false → always permitted (free access).
 *  2. If driver_subscription_enabled = true  → driver must have an active
 *     subscription row in driver_subscriptions (status = 'active').
 *
 * The driver_subscriptions table is created by the Razorpay webhook handler
 * when a subscription payment succeeds. It does NOT exist yet — the table will
 * be added in a future migration when billing is activated. Until that migration
 * runs, the table check is skipped (using the pg error code for "table not found").
 *
 * This keeps the system safe: if someone flips the toggle before the billing
 * infra is fully wired, drivers still get access (graceful degradation).
 *
 * Usage (from an API route):
 *   const access = await checkDriverAccess(driverId)
 *   if (!access.allowed) return NextResponse.json({ error: access.reason }, { status: 402 })
 */

import { query } from '@/lib/db'
import { isDriverSubscriptionEnabled } from '@/lib/platform-settings'

export interface DriverAccessResult {
  allowed: boolean
  reason?: string // only set when allowed = false
  billingRequired: boolean // true when subscription is enabled globally
}

export async function checkDriverAccess(driverFirebaseUid: string): Promise<DriverAccessResult> {
  // 1. Check global toggle first (cached, cheap)
  const billingRequired = await isDriverSubscriptionEnabled()

  if (!billingRequired) {
    return { allowed: true, billingRequired: false }
  }

  // 2. Subscription is globally enabled — check this driver's status
  try {
    const rows = await query<{ status: string }>(
      `SELECT status FROM driver_subscriptions
        WHERE driver_id = $1
          AND status    = 'active'
        LIMIT 1`,
      [driverFirebaseUid],
    )

    if (rows.length > 0) {
      return { allowed: true, billingRequired: true }
    }

    return {
      allowed: false,
      billingRequired: true,
      reason: 'Driver subscription required. Subscribe from your dashboard to accept jobs.',
    }
  } catch (err: unknown) {
    // Table doesn't exist yet (migration not run) — allow access gracefully
    const pgErr = err as { code?: string }
    if (pgErr?.code === '42P01') {
      // undefined_table — billing infra not deployed yet
      console.warn('[driver-access] driver_subscriptions table not found — granting access (billing not yet active)')
      return { allowed: true, billingRequired: true }
    }
    // Unknown error — fail open (don't block drivers due to infra issues)
    console.error('[driver-access] unexpected error checking driver subscription:', err)
    return { allowed: true, billingRequired: true }
  }
}
