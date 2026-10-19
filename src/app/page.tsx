import Link from 'next/link'
import type { Metadata } from 'next'
import SearchForm from '@/components/search/SearchForm'
import CategoryGrid from '@/components/home/CategoryGrid'
import MediaStrip from '@/components/home/MediaStrip'
import TrustStrip from '@/components/home/TrustStrip'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { BUSINESSES } from '@/data/businesses'
import { PLANS, formatInr } from '@/config/platform'

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
  { q: 'cleaning', label: 'Cleaning' },
]

const HOW_STEPS = [
  { icon: '🔍', title: 'Browse or search', desc: 'Find local businesses by category, area or keyword.' },
  { icon: '📞', title: 'Contact directly', desc: 'WhatsApp or call the business — no middleman.' },
  { icon: '💸', title: 'Pay directly', desc: 'UPI, card or cash — 100% goes to the business.' },
]

export default function HomePage() {
  const featured = BUSINESSES
    .filter((b) => b.verified)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8)

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
        </div>
      </section>

      <div className="container">

        {/* ── Categories — first thing after hero ──────────────────── */}
        <section className="sec" aria-labelledby="cat-h">
          <div className="sec-head">
            <div>
              <h2 className="sec-title" id="cat-h">Browse categories</h2>
              <div className="sec-sub">7 categories · goods, services, venues, rides &amp; property</div>
            </div>
            <Link href="/categories" className="link">All categories →</Link>
          </div>
          <CategoryGrid />
        </section>

        {/* ── How it works ─────────────────────────────────────────── */}
        <section className="sec how-strip" aria-label="How My KKR works">
          {HOW_STEPS.map((s) => (
            <div className="how-step" key={s.title}>
              <span className="how-icon" aria-hidden="true">{s.icon}</span>
              <div>
                <div className="how-title">{s.title}</div>
                <div className="how-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </section>

        {/* ── City updates ─────────────────────────────────────────── */}
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

        {/* ── Featured providers ───────────────────────────────────── */}
        <section className="sec" aria-labelledby="feat-h">
          <div className="sec-head">
            <div>
              <h2 className="sec-title" id="feat-h">Featured providers</h2>
              <div className="sec-sub">Verified · Highest rated · Kurukshetra district</div>
            </div>
            <Link href="/search?q=" className="link">View all →</Link>
          </div>
          <BusinessGrid businesses={featured} />
        </section>

        {/* ── Trust strip ──────────────────────────────────────────── */}
        <section className="sec" aria-label="Why My KKR">
          <TrustStrip />
        </section>

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
            </div>
            <div className="biz-cta-actions">
              <Link href="/register?role=business" className="btn btn-accent">
                List your business →
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
