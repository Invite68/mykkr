import Link from 'next/link'
import { CATEGORY_GROUPS } from '@/data/categories'
import { businessesInSubs } from '@/data/businesses'

export default function CategoryGrid() {
  return (
    <div className="cat-grid">
      {CATEGORY_GROUPS.map((g) => {
        const count = businessesInSubs(g.subcategories.map((s) => s.slug)).length
        return (
          <Link key={g.slug} href={`/c/${g.slug}`} className="cat-tile">
            <span className="cat-tile-icon" aria-hidden="true">{g.icon}</span>
            <span className="cat-tile-name">{g.name}</span>
            <span className="cat-tile-hi" lang="hi">{g.nameHi}</span>
            <span className="cat-tile-count">{count} {count === 1 ? 'business' : 'businesses'} →</span>
          </Link>
        )
      })}
    </div>
  )
}
