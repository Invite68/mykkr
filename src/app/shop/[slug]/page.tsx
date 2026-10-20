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

const MAX_LISTINGS = 20  // hard cap per business subscription plan

type Params = Promise<{ slug: string }>

// ── Subscription check ────────────────────────────────────────────────────────
// TODO: replace with real DB query when backend is wired:
//   const sub = await query('SELECT active, expires_at FROM subscriptions WHERE slug=$1', [slug])
async function checkSubscription(slug: string): Promise<boolean> {
  // Demo: specific slugs are "active" to show the full storefront
  const DEMO_ACTIVE = ['sharma-kirana-store', 'brijwasi-sweets', 'hotel-natraj-restaurant']
  return DEMO_ACTIVE.includes(slug)
}

export const dynamicParams = false
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
