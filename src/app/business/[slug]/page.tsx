import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import ContactButton from '@/components/business/ContactButton'
import { Stars } from '@/components/business/BusinessCard'
import { BUSINESSES, getBusiness } from '@/data/businesses'
import { findArea, osmEmbedUrl } from '@/data/areas'
import { DELIVERY_LABELS } from '@/types'
import { DIRECT_PAYMENT_METHODS, DISCLAIMER } from '@/config/platform'
import BusinessMap from '@/components/business/BusinessMap'

type Params = Promise<{ slug: string }>

export const dynamicParams = false
export function generateStaticParams() {
  return BUSINESSES.map((b) => ({ slug: b.slug }))
}
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = getBusiness((await params).slug)
  if (!b) return { title: 'Business' }
  return {
    title: `${b.name} — My KKR`,
    description: b.description,
    openGraph: { title: b.name, description: b.description, type: 'website' },
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function isOpenNow(hours: string): boolean {
  // Simple heuristic: parse "H:MM AM/PM – H:MM AM/PM"
  const m = hours.match(/(\d+):(\d+)\s*(AM|PM)\s*[–-]\s*(\d+):(\d+)\s*(AM|PM)/i)
  if (!m) return false
  const to24 = (h: string, min: string, ampm: string) => {
    let hr = parseInt(h)
    if (ampm.toUpperCase() === 'PM' && hr !== 12) hr += 12
    if (ampm.toUpperCase() === 'AM' && hr === 12) hr = 0
    return hr * 60 + parseInt(min)
  }
  const now = new Date()
  const nowMins = now.getHours() * 60 + now.getMinutes()
  const open  = to24(m[1], m[2], m[3])
  const close = to24(m[4], m[5], m[6])
  return nowMins >= open && nowMins < close
}

// Photo placeholder colours (used when no real photos are set)
const PHOTO_COLORS = ['#e0f2fe', '#fef9c3', '#f0fdf4', '#fdf4ff', '#fff7ed']
const PHOTO_EMOJIS = ['🏪', '🛍️', '📦', '⭐', '🏠']

// ── Rating bar ────────────────────────────────────────────────────────────────
function RatingBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
      <span style={{ width: 40, color: 'var(--text-3)', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${(value / 5) * 100}%`, height: '100%', background: '#f59e0b', borderRadius: 3 }} />
      </div>
      <span style={{ width: 26, textAlign: 'right', fontWeight: 700, color: 'var(--night-d)' }}>{value.toFixed(1)}</span>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default async function BusinessPage({ params }: { params: Params }) {
  const business = getBusiness((await params).slug)
  if (!business) notFound()

  const area     = findArea(business.area)
  const isRide   = business.cat === 'transport'
  const isService= business.cat === 'services'
  const isVenue  = business.cat === 'venues'
  const open     = isOpenNow(business.hours)

  // Use business-specific coords, or fall back to area centroid
  const lat = business.lat ?? area?.lat
  const lon = business.lon ?? area?.lon

  const photos = business.photos ?? []

  return (
    <div className="container" style={{ maxWidth: 900, paddingBottom: 40 }}>
      <Breadcrumbs
        items={[
          { href: `/c/${business.cat}`, label: business.sub },
          { label: business.name },
        ]}
      />

      {/* ── Photo strip ──────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 20, borderRadius: 16, overflow: 'hidden', height: 200 }}>
        {PHOTO_EMOJIS.map((em, i) => (
          <div
            key={i}
            style={{
              background: photos[i] ? `url(${photos[i]}) center/cover` : PHOTO_COLORS[i],
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, position: 'relative', cursor: 'pointer',
              gridColumn: i === 0 ? 'span 2' : undefined,
              gridRow: i === 0 ? 'span 1' : undefined,
            }}
          >
            {!photos[i] && em}
            {i === 4 && photos.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                No photos yet
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="split" style={{ alignItems: 'flex-start' }}>

        {/* ── Left column ──────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Header */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 44, lineHeight: 1, flexShrink: 0 }}>{business.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 22, fontWeight: 900, color: 'var(--night-d)', margin: 0 }}>{business.name}</h1>
                  {business.verified && (
                    <span className="badge-verified" style={{ position: 'static', fontSize: 11 }}>✓ Verified</span>
                  )}
                </div>
                <div style={{ color: 'var(--text-3)', fontSize: 13, marginTop: 3 }}>{business.sub} · {business.area}, Kurukshetra</div>

                {/* Rating row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 900, fontSize: 16, color: '#92400e' }}>{business.rating.toFixed(1)}</span>
                  <Stars rating={business.rating} />
                  <span style={{ color: 'var(--text-3)', fontSize: 13 }}>{business.reviews.toLocaleString()} reviews</span>
                  <span style={{ color: 'var(--text-3)' }}>·</span>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>{business.priceRange}</span>
                </div>

                {/* Open/Closed badge */}
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: open ? '#dcfce7' : '#fee2e2',
                    color: open ? '#15803d' : '#dc2626',
                    borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
                  }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                    {open ? 'Open now' : 'Closed now'}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{business.hours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <h2 className="panel-title">About</h2>
            <p style={{ lineHeight: 1.7, color: 'var(--text-2)', fontSize: 14, margin: 0 }}>{business.description}</p>

            {/* Highlights */}
            {business.highlights && business.highlights.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {business.highlights.map((h) => (
                  <span key={h} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: 'var(--night-d)' }}>
                    ✓ {h}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Listings / menu */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <h2 className="panel-title">
              {isVenue ? 'Rooms & packages' : isService ? 'Services & rates' : isRide ? 'Vehicles & rates' : 'Products & prices'}
            </h2>
            <div style={{ display: 'grid', gap: 1 }}>
              {business.listings.map((l, i) => (
                <div key={l.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < business.listings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--night-d)' }}>{l.name}</div>
                    {l.note && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{l.note}</div>}
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--night)', fontSize: 14, flexShrink: 0, marginLeft: 16 }}>{l.price}</div>
                </div>
              ))}
            </div>

            {/* Shop CTA if this business has a storefront */}
            {business.hasShop && (
              <div style={{ marginTop: 16, padding: '12px 14px', background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#15803d' }}>🛒 Online Store available</div>
                  <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Browse all items, add to cart, order via WhatsApp</div>
                </div>
                <Link href={`/shop/${business.slug}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                  Visit Shop →
                </Link>
              </div>
            )}
          </div>

          {/* Map */}
          <div className="panel" style={{ marginBottom: 12, padding: 0, overflow: 'hidden', borderRadius: 14 }}>
            <div style={{ padding: '14px 16px 10px' }}>
              <h2 className="panel-title" style={{ marginBottom: 4 }}>Location</h2>
              <p style={{ fontSize: 13, color: 'var(--text-3)', margin: 0 }}>📍 {business.area}, Kurukshetra, Haryana</p>
            </div>
            {lat && lon ? (
              <BusinessMap lat={lat} lon={lon} name={business.name} area={business.area} />
            ) : area ? (
              <iframe className="map-frame" style={{ margin: 0, borderRadius: 0, height: 240 }} src={osmEmbedUrl(area.lat, area.lon, 0.02)} title={`Map of ${business.area}`} loading="lazy" />
            ) : null}
          </div>

          {/* Reviews */}
          {business.sampleReviews && business.sampleReviews.length > 0 && (
            <div className="panel" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <h2 className="panel-title" style={{ margin: 0 }}>Reviews</h2>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: 24, color: 'var(--night-d)', lineHeight: 1 }}>{business.rating.toFixed(1)}</div>
                  <Stars rating={business.rating} />
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{business.reviews} reviews</div>
                </div>
              </div>

              {/* Rating breakdown bars */}
              <div style={{ display: 'grid', gap: 5, marginBottom: 16 }}>
                {[5, 4, 3, 2, 1].map((n) => (
                  <RatingBar key={n} label={`${n} ★`} value={Math.max(0, business.rating - (5 - n) * 0.3)} />
                ))}
              </div>

              {/* Sample reviews */}
              <div style={{ display: 'grid', gap: 14 }}>
                {business.sampleReviews.map((r, i) => (
                  <div key={i} style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${(r.author.charCodeAt(0) * 7) % 360}, 55%, 65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>
                          {r.author[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--night-d)' }}>{r.author}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.date}</div>
                        </div>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside style={{ width: 240, flexShrink: 0 }}>

          {/* Action buttons */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <div style={{ display: 'grid', gap: 8 }}>
              <ContactButton businessName={business.name} label="📞 Call / WhatsApp" className="btn btn-accent btn-block" />
              {isRide && (
                <Link href="/rides" className="btn btn-primary btn-block">🚕 Request a ride</Link>
              )}
              {isService && (
                <Link href={`/post?cat=${business.cat}`} className="btn btn-outline btn-block">📋 Ask for a quote</Link>
              )}
              {business.hasShop && (
                <Link href={`/shop/${business.slug}`} className="btn btn-primary btn-block">🛒 Visit Online Shop</Link>
              )}
              {business.website && (
                <a href={business.website} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-block">🌐 Website</a>
              )}
            </div>
          </div>

          {/* Quick info */}
          <div className="panel" style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.5px', color: 'var(--text-3)', marginBottom: 12 }}>Info</h3>
            <dl style={{ display: 'grid', gap: 10, fontSize: 13 }}>
              <div>
                <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, marginBottom: 1 }}>Hours</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: open ? '#22c55e' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                  {business.hours}
                </dd>
              </div>
              {business.phone && (
                <div>
                  <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, marginBottom: 1 }}>Phone</dt>
                  <dd style={{ margin: 0 }}><a href={`tel:${business.phone}`} style={{ fontWeight: 600, color: 'var(--night)' }}>{business.phone}</a></dd>
                </div>
              )}
              <div>
                <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, marginBottom: 1 }}>Area</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>{business.area}</dd>
              </div>
              {business.delivery.length > 0 && (
                <div>
                  <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, marginBottom: 1 }}>Delivery</dt>
                  <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>{business.delivery.map((d) => DELIVERY_LABELS[d]).join(' · ')}</dd>
                </div>
              )}
              <div>
                <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, marginBottom: 1 }}>Payment</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>Direct — {DIRECT_PAYMENT_METHODS.join(', ')}</dd>
              </div>
              <div>
                <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, marginBottom: 1 }}>Price range</dt>
                <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>{business.priceRange}</dd>
              </div>
            </dl>
          </div>

          {/* Disclaimer */}
          <div className="banner banner-warn" style={{ fontSize: 11, padding: '10px 12px' }}>
            <span aria-hidden="true">⚖️</span>
            <div>{DISCLAIMER}</div>
          </div>
        </aside>
      </div>
    </div>
  )
}
