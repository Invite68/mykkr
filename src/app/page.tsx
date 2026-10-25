import Link from 'next/link'
import type { Metadata } from 'next'
import SearchForm from '@/components/search/SearchForm'
import HomeFeed from '@/components/home/HomeFeed'
import MediaStrip from '@/components/home/MediaStrip'
import TrustStrip from '@/components/home/TrustStrip'
import SocialProofBar from '@/components/home/SocialProofBar'
import { BUSINESSES } from '@/data/businesses'
import { PLANS, formatInr } from '@/config/platform'

// SVG path data for each hero pill icon (Lucide-style, 24×24 viewBox)
const HERO_PILLS = [
  {
    href: '/c/services', label: 'Services',
    svg: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></>,
  },
  {
    href: '/c/shopping', label: 'Shop',
    svg: <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  },
  {
    href: '/c/food', label: 'Food & Sweets',
    svg: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></>,
  },
  {
    href: '/rides', label: 'Rides & Cabs',
    svg: <><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  },
  {
    href: '/find-book', label: 'Post a Task',
    svg: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  },
  {
    href: '/c/venues', label: 'Venues',
    svg: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  },
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
          {/* Quick-nav pill row */}
          <div className="hero-pills">
            {HERO_PILLS.map((p) => (
              <Link key={p.href} href={p.href} className="hero-pill">
                <span className="hero-pill-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" aria-hidden="true">{p.svg}</svg>
                </span>
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
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: '#f59e0b' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {avgRating}</strong> avg rating
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
