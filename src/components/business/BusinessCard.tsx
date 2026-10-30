import Link from 'next/link'
import type { Business } from '@/data/businesses'
import ChatButton from './ChatButton'

// ── SVG Icons ─────────────────────────────────────────────────────────────────

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="stars" aria-label={`${rating} out of 5`} style={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i < full ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: i < full ? '#f59e0b' : '#d1d5db' }}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

function PinIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
}

function ShopIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.18 }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns true if the business is currently open based on its hours string. */
function isOpenNow(hours?: string): boolean | null {
  if (!hours) return null
  if (hours.toLowerCase().includes('24')) return true
  const m = hours.match(/(\d+):(\d+)\s*(AM|PM)\s*[--]\s*(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return null
  const toMins = (h: string, min: string, ampm: string) => {
    let hh = parseInt(h)
    if (ampm.toUpperCase() === 'PM' && hh !== 12) hh += 12
    if (ampm.toUpperCase() === 'AM' && hh === 12) hh = 0
    return hh * 60 + parseInt(min)
  }
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  const open = toMins(m[1], m[2], m[3])
  const close = toMins(m[4], m[5], m[6])
  return cur >= open && cur < close
}

/** Gradient backgrounds for image-free cards */
const CARD_GRADIENTS = [
  'linear-gradient(135deg,#eef3f4 0%,#d8e8ec 100%)',
  'linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%)',
  'linear-gradient(135deg,#fdf4e7 0%,#fde8c4 100%)',
  'linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%)',
  'linear-gradient(135deg,#f0f9ff 0%,#e0f2fe 100%)',
]

function pickGradient(slug: string) {
  let h = 0; for (const c of slug) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return CARD_GRADIENTS[h % CARD_GRADIENTS.length]
}

// ── Card ─────────────────────────────────────────────────────────────────────

export default function BusinessCard({ business }: { business: Business }) {
  const href = `/business/${business.slug}`
  const openStatus = isOpenNow(business.hours)
  const hasCoverPhoto = !!business.photos?.[0]

  const waNumber = business.phone?.replace(/\D/g, '') ?? ''
  const waMsg = `Hi! I found ${business.name} on My KKR. Are you available?`
  const waHref = waNumber ? `https://wa.me/91${waNumber}?text=${encodeURIComponent(waMsg)}` : undefined

  return (
    <article className="biz-card">
      {/* ── Cover photo / placeholder ────────────────────────── */}
      <Link href={href} className="biz-cover" aria-label={`View ${business.name}`}>
        {hasCoverPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={business.photos![0]}
            alt={business.name}
            className="biz-cover-img"
            loading="lazy"
          />
        ) : (
          /* Clean gradient placeholder — NO emoji */
          <div
            className="biz-cover-emoji"
            style={{ background: pickGradient(business.slug) }}
            aria-hidden="true"
          >
            <ShopIcon />
          </div>
        )}

        {/* Open/Closed badge — top right */}
        {openStatus !== null && (
          <span className={`biz-open-badge biz-open-badge--${openStatus ? 'open' : 'closed'}`}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block', marginRight: 4, flexShrink: 0 }} />
            {openStatus ? 'Open' : 'Closed'}
          </span>
        )}

        {/* Verified badge — top left */}
        {business.verified && (
          <span className="biz-cover-verified">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight: 3 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Verified
          </span>
        )}
      </Link>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="biz-body">
        <div className="biz-cat">{business.sub}</div>
        <h3 className="biz-name">
          <Link href={href}>{business.name}</Link>
        </h3>
        {business.description && (
          <p className="biz-desc">{business.description}</p>
        )}
        <div className="biz-area">
          <PinIcon />
          {business.area}
        </div>
        <div className="biz-meta">
          <Stars rating={business.rating} />
          <span>{business.rating.toFixed(1)} <span className="biz-rev-count">({business.reviews} reviews)</span></span>
        </div>
        <div className="biz-price">{business.priceRange}</div>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="biz-actions">
          <Link href={href} className="btn btn-outline btn-sm">View</Link>
          <ChatButton businessName={business.name} waHref={waHref} />
        </div>
      </div>
    </article>
  )
}

// ── Empty state icon (no emoji) ───────────────────────────────────────────────
function EmptyStoreIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.3, margin: '0 auto 10px', display: 'block' }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

// ── Grid ─────────────────────────────────────────────────────────────────────

export function BusinessGrid({
  businesses,
  emptyMessage,
}: {
  businesses: Business[]
  emptyMessage?: string
}) {
  if (!businesses.length) {
    return (
      <div className="empty">
        <EmptyStoreIcon />
        {emptyMessage ?? (
          <>
            No businesses listed here yet.{' '}
            <Link href="/register?role=business" className="link">Be the first</Link>
          </>
        )}
      </div>
    )
  }
  return (
    <div className="biz-grid">
      {businesses.map((b) => (
        <BusinessCard key={b.slug} business={b} />
      ))}
    </div>
  )
}
