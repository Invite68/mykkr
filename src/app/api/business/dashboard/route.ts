/**
 * GET /api/business/dashboard
 *
 * Returns live dashboard data for the authenticated business user:
 *   - Business profile (name, sub status, view count)
 *   - Subscription details
 *   - Recent orders/bookings (from jobs table — customer requests)
 *   - KPI counts
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Response: 200 { profile, subscription, recentJobs, kpis }
 *
 * Security:
 *   - Firebase Auth required; role checked server-side
 *   - Explicit safe column lists only — no SELECT *
 *   - contact_phone NEVER returned
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'
import { findUserByUid }             from '@/lib/user-db'
import { query }                     from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  // ── Auth ─────────────────────────────────────────────────────────────────────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unauthorized'
    return NextResponse.json({ error: msg }, { status: 401 })
  }

  const user = await findUserByUid(auth.uid)
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (user.role !== 'business') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // ── Run all queries in parallel ───────────────────────────────────────────────
  const [profileRows, subRows, jobCountRows, recentJobRows] = await Promise.all([

    // Business profile (safe columns only — no contact_phone)
    query<{
      id: string; slug: string; business_name: string; logo_url: string | null;
      city: string; category: string; description: string | null;
      opening_time: string | null; closing_time: string | null;
      open_days: string[]; delivery_modes: string[];
    }>(
      `SELECT id, slug, business_name, logo_url, city, category, description,
              opening_time, closing_time, open_days, delivery_modes
       FROM business_profiles
       WHERE user_id = $1
       LIMIT 1`,
      [user.id]
    ),

    // Subscription
    query<{
      status: string; plan: string;
      trial_ends_at: string | null;
      current_period_end: string | null;
      razorpay_sub_id: string | null;
    }>(
      `SELECT status, plan, trial_ends_at, current_period_end, razorpay_sub_id
       FROM subscriptions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [user.id]
    ),

    // Job KPI counts — this month's job requests to this business
    // Jobs link to businesses via the 'business_slug' field or directly via 'business_id'
    // We do counts of all statuses so front end can show "X pending, Y completed"
    query<{ status: string; cnt: string }>(
      `SELECT status, COUNT(*) AS cnt
       FROM jobs
       WHERE business_id = (SELECT id FROM business_profiles WHERE user_id = $1 LIMIT 1)
         AND created_at >= date_trunc('month', NOW())
       GROUP BY status`,
      [user.id]
    ).catch(() => [] as { status: string; cnt: string }[]),

    // 5 most recent jobs for the activity feed
    query<{
      id: string; job_type: string; status: string;
      service_type: string | null; fare_estimate: number | null;
      created_at: string;
    }>(
      `SELECT id, job_type, status, service_type, fare_estimate, created_at
       FROM jobs
       WHERE business_id = (SELECT id FROM business_profiles WHERE user_id = $1 LIMIT 1)
       ORDER BY created_at DESC
       LIMIT 5`,
      [user.id]
    ).catch(() => [] as { id: string; job_type: string; status: string; service_type: string | null; fare_estimate: number | null; created_at: string }[]),
  ])

  const profile = profileRows[0] ?? null
  const subscription = subRows[0] ?? null

  // Aggregate KPIs from counts
  const kpiMap: Record<string, number> = {}
  for (const row of jobCountRows) {
    kpiMap[row.status] = Number(row.cnt)
  }
  const kpis = {
    pending:   kpiMap['pending']   ?? 0,
    accepted:  kpiMap['accepted']  ?? 0,
    completed: kpiMap['completed'] ?? 0,
    cancelled: kpiMap['cancelled'] ?? 0,
    total:     Object.values(kpiMap).reduce((a, b) => a + b, 0),
  }

  return NextResponse.json({
    profile,
    subscription,
    recentJobs: recentJobRows,
    kpis,
  })
}
