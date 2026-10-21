/**
 * POST /api/subscriptions/webhook
 *
 * Razorpay webhook — receives subscription lifecycle events.
 * Signature is verified before processing any event.
 *
 * Events handled:
 *   subscription.activated   → status = 'active', set period dates
 *   subscription.charged     → update period dates + record payment (idempotent)
 *   subscription.cancelled   → status = 'cancelled', set cancelled_at
 *   subscription.completed   → status = 'expired'
 *   payment.failed           → status = 'past_due'
 *
 * Set webhook URL in Razorpay dashboard:
 *   https://mykkr.in/api/subscriptions/webhook
 *
 * Required env var: RAZORPAY_WEBHOOK_SECRET
 *
 * Security:
 *   - HMAC-SHA256 signature verified before ANY processing
 *   - Idempotency: subscription.charged uses ON CONFLICT DO NOTHING on
 *     (razorpay_payment_id) so replay attacks can't double-credit revenue
 *   - rzpSubId extracted from subscription entity only (not payment.subscription_id)
 *     to prevent cross-event injection
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature }    from '@/lib/razorpay'
import { query }                     from '@/lib/db'

export const dynamic = 'force-dynamic'

// Razorpay sends the raw body for signature verification
export async function POST(req: NextRequest) {
  // ── Read raw body for signature check ─────────────────────────────────────────
  const rawBody = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''

  // ── Verify signature FIRST — reject anything without a valid sig ──────────────
  let valid = false
  try {
    valid = verifyWebhookSignature(rawBody, signature)
  } catch (err) {
    console.error('[webhook] Signature verification error:', err)
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  if (!valid) {
    console.warn('[webhook] Invalid Razorpay signature — rejecting')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // ── Parse event ───────────────────────────────────────────────────────────────
  let event: Record<string, unknown>
  try {
    event = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const eventType = event.event as string
  const payload   = event.payload as Record<string, { entity: Record<string, unknown> }>

  // ── Extract subscription entity (safe extraction — no unsafe casting) ─────────
  const subEntity = payload?.subscription?.entity
  if (!subEntity || typeof subEntity !== 'object') {
    // Not a subscription event we care about
    return NextResponse.json({ received: true })
  }

  // Always use the subscription entity's own id for the razorpay_sub_id
  const rzpSubId = typeof subEntity.id === 'string' ? subEntity.id : null

  if (!rzpSubId) {
    return NextResponse.json({ received: true })
  }

  const currentStart = typeof subEntity.current_start === 'number' ? subEntity.current_start : null
  const currentEnd   = typeof subEntity.current_end   === 'number' ? subEntity.current_end   : null
  const plan         = typeof subEntity.plan_id === 'string' ? subEntity.plan_id : null

  console.log(`[webhook] ${eventType} — ${rzpSubId}`)

  try {
    switch (eventType) {
      case 'subscription.activated': {
        await query(
          `UPDATE subscriptions SET
             status               = 'active',
             current_period_start = CASE WHEN $1::bigint IS NOT NULL THEN to_timestamp($1) ELSE current_period_start END,
             current_period_end   = CASE WHEN $2::bigint IS NOT NULL THEN to_timestamp($2) ELSE current_period_end END,
             updated_at           = NOW()
           WHERE razorpay_sub_id = $3`,
          [currentStart, currentEnd, rzpSubId]
        )
        break
      }

      case 'subscription.charged': {
        // ── Idempotency: record the payment with ON CONFLICT DO NOTHING ────────
        // Razorpay may retry webhooks; this prevents duplicate revenue rows.
        const paymentEntity = payload?.payment?.entity
        const rzpPaymentId  = paymentEntity && typeof paymentEntity.id === 'string'
          ? paymentEntity.id
          : null
        const amountPaise   = paymentEntity && typeof paymentEntity.amount === 'number'
          ? paymentEntity.amount
          : null

        // Update subscription period — idempotent (same values on replay)
        await query(
          `UPDATE subscriptions SET
             status               = 'active',
             current_period_start = CASE WHEN $1::bigint IS NOT NULL THEN to_timestamp($1) ELSE current_period_start END,
             current_period_end   = CASE WHEN $2::bigint IS NOT NULL THEN to_timestamp($2) ELSE current_period_end END,
             updated_at           = NOW()
           WHERE razorpay_sub_id = $3`,
          [currentStart, currentEnd, rzpSubId]
        )

        // Record payment if we have the payment ID — skip on replay (ON CONFLICT DO NOTHING)
        if (rzpPaymentId && amountPaise !== null) {
          await query(
            `INSERT INTO subscription_payments
               (razorpay_payment_id, razorpay_sub_id, amount_paise, plan, status, created_at)
             SELECT
               $1, $2, $3,
               (SELECT plan FROM subscriptions WHERE razorpay_sub_id = $2 LIMIT 1),
               'captured',
               NOW()
             ON CONFLICT (razorpay_payment_id) DO NOTHING`,
            [rzpPaymentId, rzpSubId, amountPaise]
          )
          void plan // plan may be used in future for multi-tier pricing
        }
        break
      }

      case 'subscription.cancelled': {
        await query(
          `UPDATE subscriptions SET
             status       = 'cancelled',
             cancelled_at = NOW(),
             updated_at   = NOW()
           WHERE razorpay_sub_id = $1`,
          [rzpSubId]
        )
        break
      }

      case 'subscription.completed': {
        await query(
          `UPDATE subscriptions SET
             status     = 'expired',
             updated_at = NOW()
           WHERE razorpay_sub_id = $1`,
          [rzpSubId]
        )
        break
      }

      case 'payment.failed': {
        // Mark the linked subscription as past_due
        await query(
          `UPDATE subscriptions SET
             status     = 'past_due',
             updated_at = NOW()
           WHERE razorpay_sub_id = $1`,
          [rzpSubId]
        )
        break
      }

      default:
        // Unknown event — acknowledge receipt, don't process
        console.log(`[webhook] Unhandled event: ${eventType}`)
    }
  } catch (err) {
    console.error('[webhook] DB error:', err)
    // Return 500 so Razorpay retries (idempotency handles safe replays)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
