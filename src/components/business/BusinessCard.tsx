import Link from 'next/link'
import type { Business } from '@/data/businesses'
import { findSub } from '@/data/categories'
import ContactButton from './ContactButton'

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating)
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  )
}

export default function BusinessCard({ business }: { business: Business }) {
  const sub = findSub(business.sub)?.sub
  const href = `/business/${business.slug}`
  return (
    <article className="biz-card">
      <Link href={href} className="biz-top" aria-label={business.name}>
        <span aria-hidden="true">{business.emoji}</span>
        {business.available && <span className="biz-avail">{business.available}</span>}
        {business.verified && <span className="badge-verified">✓ Verified</span>}
      </Link>
      <div className="biz-body">
        <div className="biz-cat">{sub?.name ?? 'Business'}</div>
        <h3 className="biz-name"><Link href={href}>{business.name}</Link></h3>
        <div className="biz-area">📍 {business.area}</div>
        <div className="biz-meta">
          <Stars rating={business.rating} />
          <span>{business.rating.toFixed(1)} ({business.reviews})</span>
        </div>
        <div className="biz-price">{business.priceRange}</div>
        <div className="biz-actions">
          <Link href={href} className="btn btn-outline btn-sm">View</Link>
          <ContactButton businessName={business.name} />
        </div>
      </div>
    </article>
  )
}

export function BusinessGrid({ businesses }: { businesses: Business[] }) {
  if (!businesses.length) {
    return (
      <div className="empty">
        <div className="empty-icon" aria-hidden="true">🏪</div>
        No businesses listed here yet.{' '}
        <Link href="/register?role=business" className="link">Be the first to list →</Link>
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
