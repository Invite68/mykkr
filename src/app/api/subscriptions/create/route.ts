/**
 * POST /api/subscriptions/create
 *
 * Create a Razorpay subscription for the authenticated user.
 * Returns the subscription short_url for redirect to Razorpay checkout.
 *
 * Authorization: Bearer <firebase-id-token>
 *
 * Body: { plan: 'business' | 'customer' }
 *
 * Response:
 *   201 { subscriptionId, shortUrl, plan }
 *   400 — bad request
 *   401 — not authenticated
 *   409 — already has active subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth }               from '@/lib/firebase-admin'
import { findUserByUid, hasActiveSubscription } from '@/lib/user-db'
import { createRazorpaySubscription } from '@/lib/razorpay'
import { query }                     from '@/lib/db'

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────────
  let auth: { uid: string; phone: string }
  try {
    auth = await requireAuth(req)
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse body ────────────────────────────────────────────────────────────────
  let body: Record<string, unknown>
  try {
    body = await req.json() as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { plan } = body
  if (plan !== 'business' && plan !== 'customer') {
    return NextResponse.json({ error: 'plan must be "business" or "customer"' }, { status: 400 })
  }

  // ── Find user ─────────────────────────────────────────────────────────────────
  const user = await findUserByUid(auth.uid)
  if (!user) {
    return NextResponse.json({ error: 'User not found — complete profile first' }, { status: 404 })
  }

  // ── Check existing subscription ───────────────────────────────────────────────
  const alreadyActive = await hasActiveSubscription(user.id)
  if (alreadyActive) {
    return NextResponse.json({ error: 'Already has active subscription' }, { status: 409 })
  }

  // ── Create Razorpay subscription ──────────────────────────────────────────────
  let rzpSub: Awaited<ReturnType<typeof createRazorpaySubscription>>
  try {
    rzpSub = await createRazorpaySubscription({ plan })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Payment provider error'
    console.error('[POST /api/subscriptions/create] Razorpay error:', err)
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  // ── Store subscription record (pending payment) ────────────────────────────────
  await query(
    `INSERT INTO subscriptions (user_id, plan, status, razorpay_sub_id, razorpay_plan_id)
     VALUES ($1, $2, 'trialing', $3, $4)
     ON CONFLICT (razorpay_sub_id) DO NOTHING`,
    [user.id, plan, rzpSub.id, rzpSub.plan_id]
  )

  return NextResponse.json({
    subscriptionId: rzpSub.id,
    shortUrl:       rzpSub.short_url,
    plan,
  }, { status: 201 })
}
