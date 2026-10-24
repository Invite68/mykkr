import Link from 'next/link'
import type { Metadata } from 'next'
import SearchForm from '@/components/search/SearchForm'
import HomeFeed from '@/components/home/HomeFeed'
import MediaStrip from '@/components/home/MediaStrip'
import TrustStrip from '@/components/home/TrustStrip'
import SocialProofBar from '@/components/home/SocialProofBar'
import { BUSINESSES } from '@/data/businesses'
import { PLANS, formatInr } from '@/config/platform'

const HERO_PILLS = [
  { href: '/c/services', icon: '🔧', label: 'Services',    cat: 'services' },
  { href: '/c/shopping', icon: '🛍️', label: 'Shop',        cat: 'shop'     },
  { href: '/c/food',     icon: '🍛', label: 'Food & Sweets', cat: 'food'   },
  { href: '/rides',      icon: '🚗', label: 'Rides & Cabs', cat: 'rides'   },
  { href: '/find-book',  icon: '📋', label: 'Post a Task', cat: 'task'     },
  { href: '/c/venues',   icon: '🏛️', label: 'Venues',      cat: 'venues'   },
]

export const metadata: Metadata = {
  title: 'My KKR — Kurukshetra Local Marketplace',
  description:
    'Find trusted local shops, services, venues, rides and properties in Kurukshetra. Browse all categories — zero commission, pay businesses directly.',
}

const POPULAR = [
  { q: 'electrician', label: 'Electrician' },
  { q: 'banquet hall', label: 'Marriage hall' },
  { q: 'sweets', label: 'Mithai' },
  { q: 'cab', label: 'Cab' },
  { q: 'plumber', label: 'Plumber' },
]

// Live stats derived from actual data
const totalBusinesses = BUSINESSES.length
const verifiedCount = BUSINESSES.filter(b => b.verified).length
const avgRating = (
  BUSINESSES.reduce((s, b) => s + b.rating, 0) / BUSINESSES.length
).toFixed(1)

export default function HomePage() {
  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="hero" aria-label="Search Kurukshetra businesses">
        <div className="hero-inner">
          <span className="hero-badge">
            <span className="live-dot" aria-hidden="true" />
            Now live · Kurukshetra, Haryana
          </span>
          <h1>
            Find anything in{' '}
            <span>Kurukshetra</span>
          </h1>
          <p className="hero-sub" lang="hi">कुरुक्षेत्र की हर ज़रूरत — एक जगह</p>
          <SearchForm variant="hero" />
          <p className="hero-hint">
            Popular:{' '}
            {POPULAR.map((p, i) => (
              <span key={p.q}>
                {i > 0 && ' · '}
                <Link href={`/search?q=${encodeURIComponent(p.q)}`}>{p.label}</Link>
              </span>
            ))}
          </p>
          {/* Quick-nav icon chip row */}
          <div className="hero-pills">
            {HERO_PILLS.map((p) => (
              <Link key={p.href} href={p.href} className="hero-pill" data-cat={p.cat}>
                <span className="hero-pill-icon" aria-hidden="true">{p.icon}</span>
                {p.label}
              </Link>
            ))}
          </div>

          {/* Social proof micro-stats */}
          <div className="hero-stats">
            <span className="hero-stat">
              <strong>{totalBusinesses}+</strong> businesses
            </span>
            <span className="hero-stat-sep" aria-hidden="true">·</span>
            <span className="hero-stat">
              <strong>{verifiedCount}</strong> verified
            </span>
            <span className="hero-stat-sep" aria-hidden="true">·</span>
            <span className="hero-stat">
              <strong>★ {avgRating}</strong> avg rating
            </span>
            <span className="hero-stat-sep" aria-hidden="true">·</span>
            <span className="hero-stat">
              <strong>₹0</strong> commission
            </span>
          </div>
        </div>
      </section>

      {/* ── Social proof scrolling bar ────────────────────────────── */}
      <SocialProofBar />

      {/* ── City updates ─────────────────────────────────────────── */}
      <div className="container">
        <section className="sec" aria-labelledby="media-h">
          <div className="sec-head">
            <h2 className="sec-title" id="media-h">City updates &amp; promotions</h2>
            <span className="live-pill">
              <span className="live-dot" aria-hidden="true" />
              Live
            </span>
          </div>
          <MediaStrip />
        </section>
      </div>

      {/* ── Reactive two-tier category nav + filtered business grid ── */}
      <HomeFeed />

      <div className="container">
        {/* ── Trust strip ──────────────────────────────────────────── */}
        <TrustStrip />

        {/* ── Business CTA ─────────────────────────────────────────── */}
        <section className="sec">
          <div className="biz-cta-block">
            <div>
              <div className="biz-cta-eyebrow">For business owners</div>
              <h2 className="biz-cta-heading">Own a business in Kurukshetra?</h2>
              <p className="biz-cta-body">
                Go fully online in under 5 minutes for{' '}
                <strong>{formatInr(PLANS.business.priceInr)} + GST/month</strong>.
                Unlimited listings — goods, services, venues &amp; property.
                Zero commission on every sale — ever.
              </p>
              <p className="biz-cta-proof">
                Less than printing 100 flyers. Your shop runs 24 hours a day.
              </p>
            </div>
            <div className="biz-cta-actions">
              <Link href="/register?role=business" className="btn btn-accent btn-lg">
                List your business free →
              </Link>
              <Link href="/pricing" className="btn btn-ghost-light">
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
