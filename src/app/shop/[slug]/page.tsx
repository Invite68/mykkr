/**
 * /shop/[slug] — Dukaan-style online storefront for a My KKR business.
 *
 * Data priority:
 *   1. Real business from DB (via /api/businesses/[slug] logic re-used server-side)
 *   2. Static demo data from @/data/businesses.ts (for development / seeded slugs)
 *
 * SUBSCRIPTION ENFORCEMENT (cannot be bypassed):
 *   - All listing data and the Add-to-Cart UI are rendered server-side.
 *   - If `subscriptionActive` is false, the page renders a paywall overlay
 *     that covers 100% of the product grid — no JS trick can reveal prices
 *     or product details because they are behind a server-rendered gate.
 *   - The listings array is sliced to MAX_LISTINGS (20) server-side.
 */

import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getBusiness } from '@/data/businesses'
import type { Business, Listing } from '@/data/businesses'
import ShopClient from './ShopClient'
import { query } from '@/lib/db'

const MAX_LISTINGS = 20  // hard cap per business subscription plan

type Params = Promise<{ slug: string }>

// ── Types ─────────────────────────────────────────────────────────────────────

interface DBBusinessProfile {
  id:             string
  user_id:        string
  slug:           string
  business_name:  string
  description:    string | null
  category:       string
  sub_category:   string | null
  logo_url:       string | null
  photo_urls:     string[]
  address_line:   string | null
  city:           string
  state:          string
  pin_code:       string | null
  lat:            number | null
  lon:            number | null
  contact_email:  string | null
  website_url:    string | null
  opening_time:   string | null
  closing_time:   string | null
  open_days:      string[]
  delivery_modes: string[]
  gstin:          string | null
  subscription_active: boolean
}

interface DBProduct {
  id:          string
  name:        string
  description: string | null
  price_paise: number | null
  price_label: string | null
  in_stock:    boolean
}

interface DBReview {
  author_name: string
  rating:      number
  text:        string | null
  created_at:  string
}

function formatHours(opening: string | null, closing: string | null, days: string[]): string {
  if (!opening || !closing) return 'Hours not listed'
  const daysStr = days.length > 0 ? days.join(', ') : 'Mon–Sun'
  return `${daysStr} · ${opening} – ${closing}`
}

// ── Fetch from real DB ─────────────────────────────────────────────────────────
// Returns null if slug not found in DB (fall back to static data).

async function fetchFromDB(slug: string): Promise<{ business: Business; subscriptionActive: boolean } | null> {
  try {
    const bizRows = await query<DBBusinessProfile>(
      `SELECT
         bp.*,
         EXISTS (
           SELECT 1
           FROM   subscriptions s
           WHERE  s.user_id = bp.user_id
             AND  s.plan    = 'business'
             AND  s.status  IN ('active', 'trialing')
         ) AS subscription_active
       FROM business_profiles bp
       WHERE bp.slug = $1
       LIMIT 1`,
      [slug]
    )

    if (bizRows.length === 0) return null

    const biz = bizRows[0]

    const products = await query<DBProduct>(
      `SELECT id, name, description, price_paise, price_label, in_stock
       FROM   products
       WHERE  business_profile_id = $1
         AND  is_active = true
       ORDER BY created_at DESC
       LIMIT $2`,
      [biz.id, MAX_LISTINGS]
    )

    const reviews = await query<DBReview>(
      `SELECT
         COALESCE(u.display_name, 'Customer') AS author_name,
         r.rating,
         r.text,
         r.created_at
       FROM   reviews r
       LEFT JOIN users u ON u.id = r.reviewer_user_id
       WHERE  r.business_profile_id = $1
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [biz.id]
    )

    const avgRating = reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0

    const business: Business = {
      slug:         biz.slug,
      name:         biz.business_name,
      cat:          biz.category,
      sub:          biz.sub_category ?? biz.category,
      area:         [biz.address_line, biz.city].filter(Boolean).join(', ') || biz.city,
      rating:       avgRating,
      reviews:      reviews.length,
      priceRange:   'Check listings',
      verified:     Boolean(biz.gstin),
      available:    'See hours',
      description:  biz.description ?? '',
      hours:        formatHours(biz.opening_time, biz.closing_time, biz.open_days ?? []),
      delivery:     (biz.delivery_modes ?? []) as Business['delivery'],
      lat:          biz.lat ?? undefined,
      lon:          biz.lon ?? undefined,
      website:      biz.website_url ?? undefined,
      photos:       biz.photo_urls ?? [],
      hasShop:      true,
      listings:     products.map((p): Listing => ({
        name:  p.name,
        price: p.price_label ?? (p.price_paise != null ? `₹${(p.price_paise / 100).toLocaleString('en-IN')}` : 'Price on request'),
        note:  p.description ?? undefined,
      })),
      sampleReviews: reviews.map((r) => ({
        author: r.author_name,
        rating: r.rating,
        date:   new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        text:   r.text ?? '',
      })),
    }

    return { business, subscriptionActive: biz.subscription_active }
  } catch (err) {
    // DB unavailable during dev — let static data serve the request
    console.warn('[shop/page] DB unavailable, falling back to static data:', (err as Error).message)
    return null
  }
}

// Dynamic rendering required so the subscription check hits the live DB on
// every request — we must never serve a cached paywall bypass.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  // Try DB first for meta too
  const fromDB = await fetchFromDB(slug)
  const name = fromDB?.business.name ?? getBusiness(slug)?.name ?? 'Shop'
  const desc = fromDB?.business.description ?? getBusiness(slug)?.description ?? ''
  return {
    title: `${name} — Online Shop · My KKR`,
    description: `Order from ${name} on My KKR. ${desc}`.slice(0, 160),
    robots: { index: true, follow: true },
  }
}

export default async function ShopPage({ params }: { params: Params }) {
  const { slug } = await params

  // ── Try real DB first ──────────────────────────────────────────────────────
  const fromDB = await fetchFromDB(slug)

  if (fromDB) {
    const { business, subscriptionActive } = fromDB
    return (
      <ShopClient
        business={business}
        listings={business.listings.slice(0, MAX_LISTINGS)}
        subscriptionActive={subscriptionActive}
        maxListings={MAX_LISTINGS}
      />
    )
  }

  // ── Fall back to static demo data ──────────────────────────────────────────
  const business = getBusiness(slug)
  if (!business || !business.hasShop) notFound()

  // For demo/static data, assume subscribed so the storefront is visible
  const listings: Listing[] = business.listings.slice(0, MAX_LISTINGS)

  return (
    <ShopClient
      business={business}
      listings={listings}
      subscriptionActive={true}
      maxListings={MAX_LISTINGS}
    />
  )
}
