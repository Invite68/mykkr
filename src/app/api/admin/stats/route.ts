/**
 * GET /api/admin/stats
 *
 * Platform-level counts for the admin dashboard.
 * Admin-only: requires Bearer token of a user with role = 'admin'.
 *
 * Response:
 *   200 { stats }
 *   401 — not authenticated
 *   403 — not an admin
 *   429 — rate limited
 *   500 — DB error
 *
 * Security:
 *   - Firebase Auth required
 *   - Role checked server-side from users table (never trust client claim)
 *   - Rate limited
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'
import { query }                     from '@/lib/db'

interface AdminStats {
  // Businesses
  totalBusinesses:      number
  verifiedBusinesses:   number
  pendingVerification:  number
  activeBusinessSubs:   number

  // Customers
  totalCustomers:       number
  activeCustomerSubs:   number
  trialCustomers:       number

  // Drivers
  totalDrivers:         number

  // Jobs
  totalJobsAllTime:     number
  openJobs:             number
  completedJobs:        number
  cancelledJobs:        number

  // Revenue (subscription fees only — no commission)
  businessSubRevenue:   number   // paise
  customerSubRevenue:   number   // paise
  totalRevenuePaise:    number

  // Categories
  totalCategories:      number
}

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  // ── Auth ──────────────────────────────────────────────────────────────────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Role check — only admins see this ────────────────────────────────────
  const userRows = await query<{ role: string }>(
    'SELECT role FROM users WHERE firebase_uid = $1 LIMIT 1',
    [auth.uid]
  )
  if (!userRows.length || userRows[0].role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  // ── Fetch all stats in parallel ───────────────────────────────────────────
  try {
    const [
      bizCounts,
      customerCounts,
      driverCount,
      jobCounts,
      revenueCounts,
    ] = await Promise.all([
      // Business counts
      query<{
        total: string
        verified: string
        active_subs: string
      }>(
        `SELECT
           COUNT(*)                                                 AS total,
           COUNT(*) FILTER (WHERE gstin IS NOT NULL AND gstin != '') AS verified,
           (SELECT COUNT(*) FROM subscriptions s
            JOIN users u ON u.id = s.user_id
            JOIN business_profiles bp ON bp.user_id = u.id
            WHERE s.plan = 'business' AND s.status IN ('active','trialing'))
                                                                    AS active_subs
         FROM business_profiles`
      ),

      // Customer counts
      query<{
        total: string
        active_subs: string
        trial_subs: string
      }>(
        `SELECT
           COUNT(*) AS total,
           (SELECT COUNT(*) FROM subscriptions WHERE plan = 'customer' AND status = 'active')  AS active_subs,
           (SELECT COUNT(*) FROM subscriptions WHERE plan = 'customer' AND status = 'trialing') AS trial_subs
         FROM customer_profiles`
      ),

      // Driver count
      query<{ total: string }>(
        'SELECT COUNT(*) AS total FROM driver_profiles'
      ),

      // Job counts
      query<{
        total: string
        open: string
        completed: string
        cancelled: string
      }>(
        `SELECT
           COUNT(*) AS total,
           COUNT(*) FILTER (WHERE status = 'open')                  AS open,
           COUNT(*) FILTER (WHERE status = 'completed')             AS completed,
           COUNT(*) FILTER (WHERE status IN ('cancelled_by_rider','cancelled_by_driver')) AS cancelled
         FROM jobs`
      ),

      // Revenue — subscription payments only (no commission)
      // This requires a subscription_payments table or Razorpay webhook records.
      // Falls back to zero if the table doesn't exist yet.
      query<{
        business_revenue: string
        customer_revenue: string
      }>(
        `SELECT
           COALESCE(SUM(amount_paise) FILTER (WHERE plan = 'business'), 0) AS business_revenue,
           COALESCE(SUM(amount_paise) FILTER (WHERE plan = 'customer'), 0) AS customer_revenue
         FROM subscription_payments
         WHERE status = 'captured'`
      ).catch(() => [{ business_revenue: '0', customer_revenue: '0' }]),
    ])

    const biz        = bizCounts[0]  ?? { total: '0', verified: '0', active_subs: '0' }
    const cust       = customerCounts[0] ?? { total: '0', active_subs: '0', trial_subs: '0' }
    const drv        = driverCount[0]    ?? { total: '0' }
    const jobs       = jobCounts[0]      ?? { total: '0', open: '0', completed: '0', cancelled: '0' }
    const rev        = revenueCounts[0]  ?? { business_revenue: '0', customer_revenue: '0' }

    const bizRevPaise  = parseInt(rev.business_revenue, 10) || 0
    const custRevPaise = parseInt(rev.customer_revenue, 10) || 0

    const stats: AdminStats = {
      totalBusinesses:     parseInt(biz.total,       10) || 0,
      verifiedBusinesses:  parseInt(biz.verified,    10) || 0,
      pendingVerification: (parseInt(biz.total, 10) || 0) - (parseInt(biz.verified, 10) || 0),
      activeBusinessSubs:  parseInt(biz.active_subs, 10) || 0,

      totalCustomers:      parseInt(cust.total,       10) || 0,
      activeCustomerSubs:  parseInt(cust.active_subs, 10) || 0,
      trialCustomers:      parseInt(cust.trial_subs,  10) || 0,

      totalDrivers:        parseInt(drv.total, 10) || 0,

      totalJobsAllTime:    parseInt(jobs.total,     10) || 0,
      openJobs:            parseInt(jobs.open,      10) || 0,
      completedJobs:       parseInt(jobs.completed, 10) || 0,
      cancelledJobs:       parseInt(jobs.cancelled, 10) || 0,

      businessSubRevenue:  bizRevPaise,
      customerSubRevenue:  custRevPaise,
      totalRevenuePaise:   bizRevPaise + custRevPaise,

      // Category count is static — matches seed data
      totalCategories: 7,
    }

    return NextResponse.json(
      { stats },
      {
        headers: {
          // Admin stats: cache for 30s, never public
          'Cache-Control': 'private, max-age=30',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/admin/stats]', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
