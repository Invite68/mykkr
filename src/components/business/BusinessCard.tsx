import Link from 'next/link'
import type { Business } from '@/data/businesses'

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

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
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
  const waHref = waNumber
    ? `https://wa.me/91${waNumber}?text=${encodeURIComponent(waMsg)}`
    : undefined

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
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp btn-sm"
              aria-label={`WhatsApp ${business.name}`}
            >
              <WhatsAppIcon /> Chat
            </a>
          ) : (
            <Link href={href} className="btn btn-accent btn-sm">Contact</Link>
          )}
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
