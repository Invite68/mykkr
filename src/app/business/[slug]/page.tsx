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
  const m = hours.match(/(\d+):(\d+)\s*(AM|PM)\s*[--]\s*(\d+):(\d+)\s*(AM|PM)/i)
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

// Cover gradient fallbacks — teal/navy palette only, NO purple, NO orange
const COVER_GRADIENTS = [
  'linear-gradient(135deg, #0d3b44 0%, #12343b 60%, #1a4a54 100%)',
  'linear-gradient(135deg, #0c2228 0%, #12343b 60%, #2d545e 100%)',
  'linear-gradient(135deg, #12343b 0%, #1a4a54 60%, #0e3540 100%)',
  'linear-gradient(135deg, #0e2a36 0%, #163642 60%, #1e4454 100%)',
  'linear-gradient(135deg, #1a2a4a 0%, #1e3460 60%, #253e74 100%)',
]
function pickGradient(slug: string) {
  let h = 0; for (const c of slug) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return COVER_GRADIENTS[h % COVER_GRADIENTS.length]
}

// ── SVG Icons ──────────────────────────────────────────────────────────────────
function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.96-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}
function IconWhatsApp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
    </svg>
  )
}
function IconShop() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  )
}
function IconGlobe() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}
function IconTaxi() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="9" width="22" height="10" rx="2" ry="2"/>
      <path d="M16 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"/>
      <circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/>
    </svg>
  )
}
function IconQuote() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}
function IconPin() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  )
}
function IconClock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}
function IconVerified() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L14.09 8.26L20.18 8.61L15.82 12.53L17.27 18.47L12 15.56L6.73 18.47L8.18 12.53L3.82 8.61L9.91 8.26L12 2Z" fill="#12343b" stroke="none"/>
      <polyline points="9 12 11 14 15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  )
}
function IconPayment() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
    </svg>
  )
}
function IconDelivery() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )
}
function IconPrice() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
}
function IconImage() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.35 }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  )
}
function IconBusiness() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function IconCheck() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

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

  const lat = business.lat ?? area?.lat
  const lon = business.lon ?? area?.lon

  const photos = business.photos ?? []
  const coverPhoto = photos[0]
  const coverGradient = pickGradient(business.slug)

  // WhatsApp URL
  const waNumber = business.phone?.replace(/\D/g, '') ?? ''
  const waMsg = `Hi! I found ${business.name} on My KKR. Are you available?`
  const waHref = waNumber
    ? `https://wa.me/91${waNumber}?text=${encodeURIComponent(waMsg)}`
    : undefined

  return (
    <div style={{ maxWidth: '100%', paddingBottom: 60 }}>

      {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 1000, paddingBottom: 0, paddingTop: 12 }}>
        <Breadcrumbs
          items={[
            { href: `/c/${business.cat}`, label: business.sub },
            { label: business.name },
          ]}
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════
          HERO — Cover + Logo + Name + CTAs
          ════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', marginBottom: 0 }}>

        {/* Cover banner */}
        <div style={{
          height: 260,
          background: coverPhoto ? `url(${coverPhoto}) center/cover no-repeat` : coverGradient,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Dark overlay on photo for legibility */}
          {coverPhoto && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.15) 0%, rgba(0,0,0,.55) 100%)' }} />
          )}

          {/* Open/Closed badge — top right */}
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: open ? 'rgba(21,128,61,.9)' : 'rgba(220,38,38,.85)',
              color: '#fff',
              borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 700,
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              {open ? 'Open now' : 'Closed'}
            </span>
          </div>

          {/* Verified badge — top left */}
          {business.verified && (
            <div style={{ position: 'absolute', top: 14, left: 14 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: 'rgba(18,52,59,.9)',
                color: '#fff',
                borderRadius: 20, padding: '4px 11px', fontSize: 12, fontWeight: 700,
                backdropFilter: 'blur(4px)',
              }}>
                <IconVerified />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* ── Hero lower zone — white card with logo overlap ──────────── */}
        <div className="container" style={{ maxWidth: 1000, paddingTop: 0, paddingBottom: 0 }}>

          {/* White card that overlaps the cover bottom */}
          <div style={{
            background: '#fff',
            borderRadius: 16,
            marginTop: -28,
            padding: '14px 16px 16px',
            boxShadow: '0 2px 16px rgba(0,0,0,.10)',
            position: 'relative',
          }}>

            {/* Row 1: Logo + Name + CTA buttons */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>

              {/* Circular logo — lifted slightly above the card top edge */}
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                border: '3px solid #fff',
                background: '#12343b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,.18)',
                marginTop: -38,   /* lift logo above card edge */
              }}>
                <IconBusiness />
              </div>

              {/* Name + meta — fills remaining width */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                    {business.name}
                  </h1>
                  {/* CTAs — top-right */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    {waHref ? (
                      <a href={waHref} target="_blank" rel="noopener noreferrer"
                        className="btn btn-whatsapp"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13 }}>
                        <IconWhatsApp /> WhatsApp
                      </a>
                    ) : (
                      <ContactButton businessName={business.name} label="WhatsApp" className="btn btn-whatsapp" />
                    )}
                    {business.hasShop && (
                      <Link href={`/shop/${business.slug}`} className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13 }}>
                        <IconShop />
                        {isVenue ? 'View venue' : isService ? 'Explore services' : 'Visit shop'}
                      </Link>
                    )}
                    {isRide && (
                      <Link href="/rides" className="btn btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 13 }}>
                        <IconTaxi /> Book ride
                      </Link>
                    )}
                  </div>
                </div>

                {/* Compact meta line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap', fontSize: 13, color: '#64748b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <IconPin />{business.sub}
                  </span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    {business.area}, KKR
                  </span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Stars rating={business.rating} />
                    <span style={{ fontWeight: 700, color: '#92400e', marginLeft: 3 }}>{business.rating.toFixed(1)}</span>
                    <span style={{ color: '#94a3b8' }}>({business.reviews})</span>
                  </span>
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span>{business.priceRange}</span>
                  {isService && (
                    <>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <a href={`/post?cat=${business.cat}`} style={{ color: '#12343b', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <IconQuote /> Get quote
                      </a>
                    </>
                  )}
                  {business.website && (
                    <>
                      <span style={{ color: '#cbd5e1' }}>·</span>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" style={{ color: '#12343b', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <IconGlobe /> Website
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Badges row */}
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
                background: open ? '#dcfce7' : '#fee2e2', color: open ? '#15803d' : '#dc2626',
                borderRadius: 20, padding: '3px 10px',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                {open ? 'Open now' : 'Closed'} · {business.hours}
              </span>
              {business.verified && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700,
                  background: 'rgba(18,52,59,.08)', color: '#12343b',
                  borderRadius: 20, padding: '3px 10px',
                }}>
                  <IconVerified /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky tab nav ────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'var(--white)',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto',
      }}>
        <div className="container" style={{ maxWidth: 1000, paddingTop: 0, paddingBottom: 0 }}>
          <div style={{ display: 'flex', gap: 0 }}>
            {(['Overview', 'Shop / Services', 'Reviews', 'Info & Location'] as const).map((tab) => (
              <a
                key={tab}
                href={`#${tab.toLowerCase().replace(/[^a-z]/g, '-').replace(/-+/g, '-').replace(/-$/, '')}`}
                className="biz-tab-link"
              >
                {tab}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="container" style={{ maxWidth: 1000 }}>

        {/* ── Photo strip — only rendered when photos exist ────── */}
        <div id="overview" style={{ marginTop: photos.length > 0 ? 28 : 0, marginBottom: photos.length > 0 ? 28 : 0 }}>
          {photos.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: 6,
              gridTemplateColumns: photos.length === 1 ? '1fr' : photos.length === 2 ? '2fr 1fr' : '2fr 1fr',
              gridTemplateRows: photos.length >= 3 ? '1fr 1fr' : undefined,
              height: photos.length >= 3 ? 260 : 200,
              borderRadius: 14, overflow: 'hidden',
            }}>
              {photos.slice(0, Math.min(photos.length, 5)).map((p, i) => (
                <div
                  key={i}
                  style={{
                    background: `url(${p}) center/cover no-repeat`,
                    gridRow: i === 0 && photos.length >= 3 ? 'span 2' : undefined,
                    position: 'relative', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          ) : null /* No photos — hide strip entirely, no empty gap */}
        </div>

        {/* ── About ────────────────────────────────────────────── */}
        <div className="panel" style={{ marginBottom: 14 }}>
          <h2 className="panel-title">About {business.name}</h2>
          <p style={{ lineHeight: 1.75, color: 'var(--text-2)', fontSize: 14, margin: 0 }}>{business.description}</p>

          {/* Hours inline */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: open ? '#dcfce7' : '#fee2e2',
              color: open ? '#15803d' : '#dc2626',
              borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
              {open ? 'Open now' : 'Closed now'}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-3)' }}>
              <IconClock />
              {business.hours}
            </span>
          </div>

          {/* Highlights / tags */}
          {business.highlights && business.highlights.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {business.highlights.map((h) => (
                <span key={h} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600,
                  color: 'var(--night-d)',
                }}>
                  <IconCheck /> {h}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Listings ────────────────────────────────────────────────── */}
        <div id="shop---services" className="panel" style={{ marginBottom: 14 }}>
          <h2 className="panel-title">
            {isVenue ? 'Rooms & packages' : isService ? 'Services & rates' : isRide ? 'Vehicles & rates' : 'Products & prices'}
          </h2>
          <div style={{ display: 'grid', gap: 1 }}>
            {business.listings.map((l, i) => (
              <div key={l.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderBottom: i < business.listings.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--night-d)' }}>{l.name}</div>
                  {l.note && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{l.note}</div>}
                </div>
                <div style={{ fontWeight: 800, color: 'var(--night)', fontSize: 14, flexShrink: 0, marginLeft: 16 }}>{l.price}</div>
              </div>
            ))}
          </div>

          {/* Shop CTA */}
          {business.hasShop && (
            <div style={{
              marginTop: 16, padding: '12px 14px',
              background: '#f0fdf4', border: '1.5px solid #bbf7d0', borderRadius: 10,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 13, color: '#15803d', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <IconShop /> Online store available
                </div>
                <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>Browse all items, add to cart, order via WhatsApp</div>
              </div>
              <Link href={`/shop/${business.slug}`} className="btn btn-primary btn-sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
                Visit shop
              </Link>
            </div>
          )}
        </div>

        {/* ── Reviews ─────────────────────────────────────────────────── */}
        {business.sampleReviews && business.sampleReviews.length > 0 && (
          <div id="reviews" className="panel" style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <h2 className="panel-title" style={{ margin: 0 }}>Reviews</h2>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 900, fontSize: 28, color: 'var(--night-d)', lineHeight: 1 }}>{business.rating.toFixed(1)}</div>
                <Stars rating={business.rating} />
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{business.reviews} reviews</div>
              </div>
            </div>

            {/* Rating breakdown */}
            <div style={{ display: 'grid', gap: 6, marginBottom: 20 }}>
              {[5, 4, 3, 2, 1].map((n) => (
                <RatingBar key={n} label={`${n} star`} value={Math.max(0, business.rating - (5 - n) * 0.3)} />
              ))}
            </div>

            {/* Sample reviews */}
            <div style={{ display: 'grid', gap: 16 }}>
              {business.sampleReviews.map((r, i) => (
                <div key={i} style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `hsl(${(r.author.charCodeAt(0) * 7) % 360}, 50%, 60%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0,
                      }}>
                        {r.author[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--night-d)' }}>{r.author}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.date}</div>
                      </div>
                    </div>
                    <Stars rating={r.rating} />
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.65 }}>{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Info & Location ────────────────────────────────────────── */}
        <div id="info---location" className="panel" style={{ marginBottom: 14 }}>
          <h2 className="panel-title">Info &amp; Location</h2>

          <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px 24px', fontSize: 13, marginBottom: 20 }}>
            <div>
              <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IconClock /> Hours
              </dt>
              <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: open ? '#22c55e' : '#ef4444', display: 'inline-block', flexShrink: 0 }} />
                {business.hours}
              </dd>
            </div>

            {business.phone && (
              <div>
                <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IconPhone /> Phone
                </dt>
                <dd style={{ margin: 0 }}>
                  <a href={`tel:${business.phone}`} style={{ fontWeight: 600, color: 'var(--night)' }}>{business.phone}</a>
                </dd>
              </div>
            )}

            <div>
              <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IconPin /> Area
              </dt>
              <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>{business.area}, Kurukshetra, Haryana</dd>
            </div>

            {business.delivery.length > 0 && (
              <div>
                <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <IconDelivery /> Delivery
                </dt>
                <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>{business.delivery.map((d) => DELIVERY_LABELS[d]).join(' · ')}</dd>
              </div>
            )}

            <div>
              <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IconPayment /> Payment
              </dt>
              <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>Direct — {DIRECT_PAYMENT_METHODS.join(', ')}</dd>
            </div>

            <div>
              <dt style={{ color: 'var(--text-3)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IconPrice /> Price range
              </dt>
              <dd style={{ margin: 0, fontWeight: 600, color: 'var(--night-d)' }}>{business.priceRange}</dd>
            </div>
          </dl>

          {/* Map */}
          {(lat && lon) ? (
            <div style={{ borderRadius: 10, overflow: 'hidden', height: 240 }}>
              <BusinessMap lat={lat} lon={lon} name={business.name} area={business.area} />
            </div>
          ) : area ? (
            <div style={{ borderRadius: 10, overflow: 'hidden', height: 240 }}>
              <iframe
                className="map-frame"
                style={{ margin: 0, borderRadius: 0, height: 240 }}
                src={osmEmbedUrl(area.lat, area.lon, 0.02)}
                title={`Map of ${business.area}`}
                loading="lazy"
              />
            </div>
          ) : null}
        </div>

        {/* ── Disclaimer ───────────────────────────────────────────────── */}
        <div style={{
          background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '11px 14px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ fontSize: 11, color: 'var(--text-3)', margin: 0, lineHeight: 1.6 }}>{DISCLAIMER}</p>
        </div>

      </div>
    </div>
  )
}
