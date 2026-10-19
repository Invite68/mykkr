import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'

export const metadata: Metadata = { title: 'All categories — My KKR' }

export default function CategoriesPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'All categories' }]} />
      <h1 className="page-title">All categories</h1>
      <p className="page-sub">Everything on My KKR, grouped the way businesses list it.</p>

      {CATEGORY_GROUPS.map((g) => (
        <section className="sec" key={g.slug} aria-labelledby={`g-${g.slug}`}>
          <div className="sec-head">
            <div>
              <h2 className="sec-title" id={`g-${g.slug}`}>{g.icon} {g.label}</h2>
            </div>
            <Link href={`/c/${g.slug}`} className="link">Open →</Link>
          </div>
          <div className="cat-grid">
            {g.subcategories.slice(1).map((s) => {
              const n = BUSINESSES.filter((b) => b.cat === g.slug && b.sub === s).length
              return (
                <Link key={s} href={`/c/${g.slug}/${encodeURIComponent(s)}`} className="cat-tile">
                  <span className="cat-tile-name">{s}</span>
                  <span className="cat-tile-count">{n} listed →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
