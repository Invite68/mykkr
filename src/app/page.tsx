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

      {/* ── How it works strip ─────────────────────────────────────── */}
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12,
            marginTop: 24,
          }}
        >
          {HOW_STEPS.map((s) => (
            <div
              key={s.title}
              style={{
                background: 'var(--white)',
                border: '1.5px solid var(--border)',
                borderRadius: 'var(--r-xl)',
                padding: '16px 18px',
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }} aria-hidden="true">{s.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--night-d)' }}>{s.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Categories ──────────────────────────────────────────── */}
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

        {/* ── City updates ─────────────────────────────────────────── */}
        <section className="sec" aria-labelledby="media-h">
          <div className="sec-head">
            <h2 className="sec-title" id="media-h">City updates &amp; promotions</h2>
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
          <div
            style={{
              background: 'linear-gradient(135deg, var(--night-d) 0%, var(--night) 100%)',
              borderRadius: 'var(--r-2xl)',
              padding: '28px 24px',
              color: '#fff',
              display: 'grid',
              gap: 16,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--tan)', marginBottom: 8 }}>
                For business owners
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-.4px', marginBottom: 6 }}>
                Own a business in Kurukshetra?
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.72)', lineHeight: 1.6, maxWidth: 560 }}>
                Go fully online in under 5 minutes for{' '}
                <strong style={{ color: 'var(--tan)' }}>{formatInr(PLANS.business.priceInr)} + GST/month</strong>.
                Unlimited listings — goods, services, venues &amp; property. Zero commission on every sale — ever.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Link href="/register?role=business" className="btn btn-accent">
                List your business →
              </Link>
              <Link href="/pricing" className="btn btn-ghost" style={{ color: 'rgba(255,255,255,.75)', border: '1px solid rgba(255,255,255,.2)' }}>
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
