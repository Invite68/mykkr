/**
 * Razorpay helper — server-side only.
 *
 * Used ONLY for platform subscription fees:
 *   Business plan: ₹99 + GST / month
 *   Customer plan: ₹9.99 + GST / month
 *
 * All customer-to-business payments are DIRECT (not through this platform).
 *
 * Required env vars (set in Coolify → Environment Variables):
 *   RAZORPAY_KEY_ID       — starts with "rzp_live_" or "rzp_test_"
 *   RAZORPAY_KEY_SECRET   — secret key
 *   RAZORPAY_WEBHOOK_SECRET — for signature verification on /api/subscriptions/webhook
 *
 * Razorpay Subscription Plan IDs must be created once in the Razorpay dashboard
 * and stored as env vars:
 *   RAZORPAY_PLAN_BUSINESS — plan ID for ₹99/month plan
 *   RAZORPAY_PLAN_CUSTOMER — plan ID for ₹9.99/month plan
 */

import crypto from 'crypto'
import { PLANS, GST_RATE } from '@/config/platform'

const BASE_URL = 'https://api.razorpay.com/v1'

function getCredentials() {
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET')
  }
  return { keyId, keySecret }
}

function basicAuth(): string {
  const { keyId, keySecret } = getCredentials()
  return 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64')
}

async function razorpayRequest<T>(
  method: string,
  path: string,
  body?: Record<string, unknown>
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': basicAuth(),
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { description?: string } }
    throw new Error(err.error?.description ?? `Razorpay error: ${res.status}`)
  }

  return res.json() as Promise<T>
}

/**
 * Get the Razorpay Plan ID for a given plan from env vars.
 */
export function getRazorpayPlanId(plan: 'business' | 'customer'): string {
  const envKey = plan === 'business' ? 'RAZORPAY_PLAN_BUSINESS' : 'RAZORPAY_PLAN_CUSTOMER'
  const planId = process.env[envKey]
  if (!planId) throw new Error(`Missing ${envKey} env var`)
  return planId
}

/**
 * Price in paise (Razorpay uses paise for INR).
 * Includes GST.
 */
export function planPricePaise(plan: 'business' | 'customer'): number {
  const base = PLANS[plan].priceInr
  return Math.round(base * (1 + GST_RATE) * 100) // paise
}

export interface RazorpaySubscription {
  id:             string
  plan_id:        string
  status:         string
  current_start:  number
  current_end:    number
  charge_at:      number
  total_count:    number
  paid_count:     number
  short_url:      string
}

/**
 * Create a Razorpay subscription for a user.
 * Returns the subscription object including the payment link.
 */
export async function createRazorpaySubscription(params: {
  plan:        'business' | 'customer'
  customerId?: string   // optional Razorpay customer ID
  totalCount?: number   // number of billing cycles (default 12)
}): Promise<RazorpaySubscription> {
  const planId = getRazorpayPlanId(params.plan)
  const totalCount = params.totalCount ?? 12

  // Razorpay redirects the user here after checkout (success or cancel)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://mykkr.in'
  const returnUrl = `${siteUrl}/subscribe/return`

  return razorpayRequest<RazorpaySubscription>('POST', '/subscriptions', {
    plan_id:     planId,
    total_count: totalCount,
    quantity:    1,
    ...(params.customerId ? { customer_id: params.customerId } : {}),
    notify_info: {
      notify_phone: 1,
      notify_email: 1,
    },
    // Hosted checkout return URL — user lands here after payment
    callback_url: returnUrl,
    cancel_url:   returnUrl,
  })
}

/**
 * Fetch a subscription by Razorpay ID.
 */
export async function fetchSubscription(subscriptionId: string): Promise<RazorpaySubscription> {
  return razorpayRequest<RazorpaySubscription>('GET', `/subscriptions/${subscriptionId}`)
}

/**
 * Cancel a Razorpay subscription (at period end).
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  await razorpayRequest('POST', `/subscriptions/${subscriptionId}/cancel`, {
    cancel_at_cycle_end: 1,
  })
}

/**
 * Verify a Razorpay webhook signature.
 * Returns true if valid.
 */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) throw new Error('Missing RAZORPAY_WEBHOOK_SECRET')

  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  )
}
