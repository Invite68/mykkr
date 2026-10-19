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
      <p className="page-sub">Everything on My KKR, grouped by category.</p>

      {CATEGORY_GROUPS.map((g) => {
        const totalInCat = BUSINESSES.filter((b) => b.cat === g.slug).length
        return (
          <section className="sec" key={g.slug} aria-labelledby={`g-${g.slug}`}>
            <div className="sec-head">
              <h2 className="sec-title" id={`g-${g.slug}`}>
                {g.icon} {g.label}
                <span className="sec-count">{totalInCat} listed</span>
              </h2>
              <Link href={`/c/${g.slug}`} className="link">See all →</Link>
            </div>

            {/* Sub-category chips — horizontal scroll */}
            <div className="subcat-scroll">
              {g.subcategories.slice(1).map((s) => {
                const n = BUSINESSES.filter((b) => b.cat === g.slug && b.sub === s).length
                return (
                  <Link
                    key={s}
                    href={`/c/${g.slug}/${encodeURIComponent(s)}`}
                    className="subcat-chip"
                  >
                    <span className="subcat-name">{s}</span>
                    <span className="subcat-count">{n}</span>
                  </Link>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
