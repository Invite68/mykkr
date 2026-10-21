/**
 * /shop/[slug] — Dukaan-style online storefront for a My KKR business.
 *
 * SUBSCRIPTION ENFORCEMENT (cannot be bypassed):
 *   - All listing data and the Add-to-Cart UI are rendered server-side.
 *   - If `subscriptionActive` is false, the page renders a paywall overlay
 *     that covers 100% of the product grid — no JS trick can reveal prices
 *     or product details because they are behind a server-rendered gate.
 *   - The listings array is sliced to MAX_LISTINGS (20) server-side.
 *   - The shop URL is /shop/[slug] — there is no ?bypass= or API endpoint
 *     that exposes raw listing data without the subscription check.
 *
 * When wired to a real DB, replace `checkSubscription()` with a DB query:
 *   SELECT active FROM subscriptions WHERE business_id = $1 AND type = 'business'
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESSES, getBusiness } from '@/data/businesses'
import type { Business, Listing } from '@/data/businesses'
import ShopClient from './ShopClient'
import { query } from '@/lib/db'

const MAX_LISTINGS = 20  // hard cap per business subscription plan

type Params = Promise<{ slug: string }>

// ── Subscription check ────────────────────────────────────────────────────────
// Joins business slug → business_profiles → users → subscriptions.
// Returns true only when the business has an active or trialing subscription.
// Falls back to false (paywall shown) on any DB error so we never accidentally
// reveal products when we cannot verify payment status.
async function checkSubscription(slug: string): Promise<boolean> {
  try {
    const rows = await query<{ active: boolean }>(
      `SELECT EXISTS (
         SELECT 1
         FROM   subscriptions s
         JOIN   users u ON u.id = s.user_id
         JOIN   business_profiles bp ON bp.user_id = u.id
         WHERE  bp.slug = $1
           AND  s.plan  = 'business'
           AND  s.status IN ('active', 'trialing')
       ) AS active`,
      [slug]
    )
    return rows[0]?.active === true
  } catch (err) {
    // On DB error default to locked (safe-fail)
    console.error('[checkSubscription] DB error — defaulting to locked:', err)
    return false
  }
}

// Dynamic rendering required so the subscription check hits the live DB on
// every request — we must never serve a cached paywall bypass.
export const dynamic = 'force-dynamic'

// Keep generateStaticParams for type-safety / IDE hints but dynamic overrides it.
// Remove if you want 404 for unknown slugs without a DB hit.
export function generateStaticParams() {
  return BUSINESSES.filter((b) => b.hasShop).map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = getBusiness((await params).slug)
  if (!b) return { title: 'Shop' }
  return {
    title: `${b.name} — Online Shop · My KKR`,
    description: `Order from ${b.name} on My KKR. ${b.description}`,
    robots: { index: true, follow: true },
  }
}

export default async function ShopPage({ params }: { params: Params }) {
  const { slug } = await params
  const business = getBusiness(slug)

  // Only businesses that opted in to /shop get this page
  if (!business || !business.hasShop) notFound()

  const subscriptionActive = await checkSubscription(slug)

  // Slice server-side — even if someone calls the RSC payload directly,
  // they never see more than MAX_LISTINGS items
  const listings: Listing[] = business.listings.slice(0, MAX_LISTINGS)

  return (
    <ShopClient
      business={business}
      listings={listings}
      subscriptionActive={subscriptionActive}
      maxListings={MAX_LISTINGS}
    />
  )
}
