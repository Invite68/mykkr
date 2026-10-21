/**
 * POST /api/subscriptions/webhook
 *
 * Razorpay webhook — receives subscription lifecycle events.
 * Signature is verified before processing any event.
 *
 * Events handled:
 *   subscription.activated   → status = 'active', set period dates
 *   subscription.charged     → update period dates (renewal)
 *   subscription.cancelled   → status = 'cancelled', set cancelled_at
 *   subscription.completed   → status = 'expired'
 *   payment.failed           → status = 'past_due'
 *
 * Set webhook URL in Razorpay dashboard:
 *   https://mykkr.in/api/subscriptions/webhook
 *
 * Required env var: RAZORPAY_WEBHOOK_SECRET
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

  // ── Verify signature ──────────────────────────────────────────────────────────
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
  const sub       = payload?.subscription?.entity ?? payload?.payment?.entity ?? {}

  const rzpSubId    = sub.subscription_id as string ?? sub.id as string
  const status      = sub.status as string

  if (!rzpSubId) {
    // Not a subscription event — ignore
    return NextResponse.json({ received: true })
  }

  console.log(`[webhook] ${eventType} — ${rzpSubId} — ${status}`)

  try {
    switch (eventType) {
      case 'subscription.activated': {
        await query(
          `UPDATE subscriptions SET
             status               = 'active',
             current_period_start = to_timestamp($1),
             current_period_end   = to_timestamp($2),
             updated_at           = NOW()
           WHERE razorpay_sub_id = $3`,
          [sub.current_start as number, sub.current_end as number, rzpSubId]
        )
        break
      }

      case 'subscription.charged': {
        // Successful renewal — update period window
        await query(
          `UPDATE subscriptions SET
             status               = 'active',
             current_period_start = to_timestamp($1),
             current_period_end   = to_timestamp($2),
             updated_at           = NOW()
           WHERE razorpay_sub_id = $3`,
          [sub.current_start as number, sub.current_end as number, rzpSubId]
        )
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
        // Only mark as past_due if there's a linked subscription
        if (rzpSubId) {
          await query(
            `UPDATE subscriptions SET
               status     = 'past_due',
               updated_at = NOW()
             WHERE razorpay_sub_id = $1`,
            [rzpSubId]
          )
        }
        break
      }

      default:
        // Unknown event — acknowledge but don't process
        console.log(`[webhook] Unhandled event: ${eventType}`)
    }
  } catch (err) {
    console.error('[webhook] DB error:', err)
    // Return 500 so Razorpay retries
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
