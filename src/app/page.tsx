import Link from 'next/link'
import type { Metadata } from 'next'
import SearchForm from '@/components/search/SearchForm'
import HomeFeed from '@/components/home/HomeFeed'
import MediaStrip from '@/components/home/MediaStrip'
import TrustStrip from '@/components/home/TrustStrip'
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

      {/* ── How it works ─────────────────────────────────────────── */}
      <div className="container">
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
      </div>

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
