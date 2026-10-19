import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { CATEGORY_GROUPS } from '@/data/categories'
import { businessesInSub } from '@/data/businesses'

export const metadata: Metadata = { title: 'All categories' }

export default function CategoriesPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'All categories' }]} />
      <h1 className="page-title">All categories</h1>
      <p className="page-sub">Everything on My KKR, grouped the same way businesses list it.</p>

      {CATEGORY_GROUPS.map((g) => (
        <section className="sec" key={g.slug} aria-labelledby={`g-${g.slug}`}>
          <div className="sec-head">
            <div>
              <h2 className="sec-title" id={`g-${g.slug}`}>{g.icon} {g.name}</h2>
              <div className="sec-sub">{g.blurb}</div>
            </div>
            <Link href={`/c/${g.slug}`} className="link">Open →</Link>
          </div>
          <div className="cat-grid">
            {g.subcategories.map((s) => {
              const n = businessesInSub(s.slug).length
              return (
                <Link key={s.slug} href={`/c/${g.slug}/${s.slug}`} className="cat-tile">
                  <span className="cat-tile-icon" aria-hidden="true">{s.icon}</span>
                  <span className="cat-tile-name">{s.name}</span>
                  <span className="cat-tile-hi" lang="hi">{s.nameHi}</span>
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
