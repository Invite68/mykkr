import Link from 'next/link'
import SearchForm from '@/components/search/SearchForm'
import CategoryGrid from '@/components/home/CategoryGrid'
import MediaStrip from '@/components/home/MediaStrip'
import TrustStrip from '@/components/home/TrustStrip'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { BUSINESSES } from '@/data/businesses'
import { PLANS, formatInr } from '@/config/platform'

const POPULAR = [
  { q: 'electrician', label: 'Electrician' },
  { q: 'banquet', label: 'Marriage hall' },
  { q: 'sweets', label: 'Mithai' },
  { q: 'cab', label: 'Cab' },
]

export default function HomePage() {
  const featured = BUSINESSES.filter((b) => b.verified).sort((a, b) => b.rating - a.rating).slice(0, 8)

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <span className="hero-badge"><span className="live-dot" />Now live · Kurukshetra, Haryana</span>
          <h1>Find anything in <span>Kurukshetra</span></h1>
          <p className="hero-sub" lang="hi">कुरुक्षेत्र की हर ज़रूरत — एक जगह</p>
          <SearchForm variant="hero" />
          <p className="hero-hint">
            Popular:{' '}
            {POPULAR.map((p, i) => (
              <span key={p.q}>
                {i > 0 && ' · '}
                <Link href={`/search?q=${p.q}`}>{p.label}</Link>
              </span>
            ))}
          </p>
        </div>
      </section>

      <div className="container">
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

        <section className="sec" aria-labelledby="media-h">
          <div className="sec-head">
            <h2 className="sec-title" id="media-h">City updates &amp; promotions</h2>
          </div>
          <MediaStrip />
        </section>

        <section className="sec" aria-labelledby="feat-h">
          <div className="sec-head">
            <div>
              <h2 className="sec-title" id="feat-h">Featured providers</h2>
              <div className="sec-sub">Verified · Kurukshetra district</div>
            </div>
            <Link href="/search?q=" className="link">View all →</Link>
          </div>
          <BusinessGrid businesses={featured} />
        </section>

        <section className="sec">
          <TrustStrip />
        </section>

        <section className="sec">
          <div className="banner banner-info">
            <span aria-hidden="true">💡</span>
            <div>
              <strong>Own a business in Kurukshetra?</strong> Go online in under 5 minutes for {formatInr(PLANS.business.priceInr)} + GST/month —
              unlimited listings, zero commission.{' '}
              <Link href="/register?role=business" className="link">List your business →</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
