/**
 * GET /api/businesses/[slug]
 *
 * Public business profile from the database.
 * Used by the shop page and business listing cards.
 *
 * NO AUTH required — business profiles are public.
 * contact_phone is NEVER returned (encrypted at rest, never exposed via API).
 *
 * Response shape mirrors the Business interface in @/data/businesses.ts
 * so the ShopClient works with DB data OR static demo data.
 *
 * Response:
 *   200 { business }
 *   404 — slug not found
 *   429 — rate limited
 *   500 — DB error
 */

import { NextRequest, NextResponse } from 'next/server'
import { query }                     from '@/lib/db'
import { readLimiter, checkLimit }   from '@/lib/rate-limit'

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
  created_at:     string
  updated_at:     string
  // joined from subscriptions
  subscription_active: boolean
}

interface DBProduct {
  id:          string
  name:        string
  description: string | null
  price_paise: number | null
  price_label: string | null
  image_urls:  string[]
  in_stock:    boolean
  created_at:  string
}

interface DBReview {
  author_name: string
  rating:      number
  text:        string | null
  created_at:  string
}

// ── Hours helper ──────────────────────────────────────────────────────────────

function formatHours(opening: string | null, closing: string | null, days: string[]): string {
  if (!opening || !closing) return 'Hours not listed'
  const daysStr = days.length > 0 ? days.join(', ') : 'Mon–Sun'
  return `${daysStr} · ${opening} – ${closing}`
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const limited = checkLimit(readLimiter, req)
  if (limited) return limited

  const { slug } = await params

  if (!slug || typeof slug !== 'string' || slug.length > 80 || !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
  }

  try {
    // ── Fetch business profile + subscription status ────────────────────────
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

    if (bizRows.length === 0) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const biz = bizRows[0]
    // contact_phone is intentionally excluded — encrypted at rest, never returned
    const { id, user_id, ...safeFields } = biz
    void id; void user_id

    // ── Fetch product listings (up to 20 — subscription limit) ────────────
    const products = await query<DBProduct>(
      `SELECT id, name, description, price_paise, price_label, image_urls, in_stock, created_at
       FROM   products
       WHERE  business_profile_id = (SELECT id FROM business_profiles WHERE slug = $1)
         AND  is_active = true
       ORDER BY created_at DESC
       LIMIT 20`,
      [slug]
    )

    // ── Fetch recent reviews ───────────────────────────────────────────────
    const reviews = await query<DBReview>(
      `SELECT
         COALESCE(u.display_name, 'Customer') AS author_name,
         r.rating,
         r.text,
         r.created_at
       FROM   reviews r
       LEFT JOIN users u ON u.id = r.reviewer_user_id
       WHERE  r.business_profile_id = (SELECT id FROM business_profiles WHERE slug = $1)
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [slug]
    )

    // ── Build response ─────────────────────────────────────────────────────
    // Shape mirrors Business interface in @/data/businesses.ts so the
    // ShopClient component works without changes.
    const business = {
      slug:         safeFields.slug,
      name:         safeFields.business_name,
      cat:          safeFields.category,
      sub:          safeFields.sub_category ?? safeFields.category,
      area:         [safeFields.address_line, safeFields.city].filter(Boolean).join(', ') || safeFields.city,
      city:         safeFields.city,
      state:        safeFields.state,
      pinCode:      safeFields.pin_code,
      description:  safeFields.description ?? '',
      logoUrl:      safeFields.logo_url,
      photos:       safeFields.photo_urls ?? [],
      lat:          safeFields.lat,
      lon:          safeFields.lon,
      contactEmail: safeFields.contact_email,
      website:      safeFields.website_url,
      gstin:        safeFields.gstin,
      hours:        formatHours(safeFields.opening_time, safeFields.closing_time, safeFields.open_days ?? []),
      openDays:     safeFields.open_days ?? [],
      delivery:     safeFields.delivery_modes ?? [],
      verified:     Boolean(safeFields.gstin),
      hasShop:      true,
      subscriptionActive: safeFields.subscription_active,
      // Map DB products → Listing shape the ShopClient expects
      listings: products.map((p) => ({
        id:         p.id,
        name:       p.name,
        price:      p.price_label ?? (p.price_paise != null ? `₹${(p.price_paise / 100).toLocaleString('en-IN')}` : 'Price on request'),
        note:       p.description ?? undefined,
        imageUrls:  p.image_urls ?? [],
        inStock:    p.in_stock,
      })),
      sampleReviews: reviews.map((r) => ({
        author: r.author_name,
        rating: r.rating,
        date:   new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        text:   r.text ?? '',
      })),
      // Aggregate from reviews
      rating:  reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : 0,
      reviews: reviews.length,
    }

    return NextResponse.json(
      { business },
      {
        headers: {
          // Cache public profile for 60s at CDN; revalidate background
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      }
    )
  } catch (err) {
    console.error('[GET /api/businesses/[slug]]', err)
    return NextResponse.json({ error: 'Failed to load business' }, { status: 500 })
  }
}
