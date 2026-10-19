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

type Params = Promise<{ slug: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return BUSINESSES.map((b) => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const b = getBusiness((await params).slug)
  return { title: b?.name ?? 'Business', description: b?.description }
}

export default async function BusinessPage({ params }: { params: Params }) {
  const business = getBusiness((await params).slug)
  if (!business) notFound()
  const area = findArea(business.area)
  const isRide = business.cat === 'transport'
  const isService = business.cat === 'services'
  const isVenue = business.cat === 'venues'

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { href: `/c/${business.cat}`, label: business.cat.charAt(0).toUpperCase() + business.cat.slice(1) },
          { label: business.name },
        ]}
      />

      <div className="split">
        <div>
          <div className="panel">
            <div className="detail-hero">
              <div className="detail-emoji" aria-hidden="true">{business.emoji}</div>
              <div>
                <div className="biz-cat">{business.sub}</div>
                <h1 className="page-title">{business.name}</h1>
                <div className="biz-meta">
                  <Stars rating={business.rating} />
                  <span>{business.rating.toFixed(1)} · {business.reviews} reviews</span>
                  {business.verified && <span className="badge-verified" style={{ position: 'static' }}>✓ Verified</span>}
                </div>
              </div>
            </div>
            <p className="prose" style={{ marginTop: 14 }}>{business.description}</p>
          </div>

          <div className="panel">
            <h2 className="panel-title">
              {isVenue ? 'Rooms & packages' : isService ? 'Services & rates' : isRide ? 'Vehicles & rates' : 'Products & prices'}
            </h2>
            <table className="list-table">
              <tbody>
                {business.listings.map((l) => (
                  <tr key={l.name}>
                    <td>{l.name}</td>
                    <td>{l.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel">
            <h2 className="panel-title">Location</h2>
            <p className="muted" style={{ marginBottom: 10 }}>📍 {business.area}, Kurukshetra</p>
            {area && (
              <iframe className="map-frame" src={osmEmbedUrl(area.lat, area.lon, 0.02)} title={`Map of ${business.area}`} loading="lazy" />
            )}
          </div>
        </div>

        <aside>
          <div className="panel">
            <div className="biz-price" style={{ fontSize: 18 }}>{business.priceRange}</div>
            <dl className="kv" style={{ margin: '10px 0 16px' }}>
              <dt>Hours</dt>
              <dd>{business.hours}</dd>
              <dt>Area</dt>
              <dd>{business.area}</dd>
              {business.delivery.length > 0 && (
                <>
                  <dt>Delivery</dt>
                  <dd>{business.delivery.map((d) => DELIVERY_LABELS[d]).join(' · ')}</dd>
                </>
              )}
              <dt>Payment</dt>
              <dd>Direct — {DIRECT_PAYMENT_METHODS.join(', ')}</dd>
            </dl>
            <div className="form-grid">
              <ContactButton businessName={business.name} label="WhatsApp / call" className="btn btn-accent btn-block" />
              {isRide && (
                <Link href="/rides" className="btn btn-primary btn-block">🚕 Request a ride</Link>
              )}
              {isService && (
                <Link href={`/post?cat=${business.cat}`} className="btn btn-outline btn-block">Ask for a quote</Link>
              )}
            </div>
          </div>
          <div className="banner banner-warn" style={{ marginTop: 14 }}>
            <span aria-hidden="true">⚖️</span>
            <div>{DISCLAIMER}</div>
          </div>
        </aside>
      </div>
    </div>
  )
}
