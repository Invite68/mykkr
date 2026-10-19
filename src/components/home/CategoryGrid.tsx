import Link from 'next/link'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'

export default function CategoryGrid() {
  return (
    <div className="cat-grid">
      {CATEGORY_GROUPS.map((g) => {
        const count = BUSINESSES.filter((b) => b.cat === g.slug).length
        return (
          <Link key={g.slug} href={`/c/${g.slug}`} className="cat-tile">
            <span className="cat-tile-icon" aria-hidden="true">{g.icon}</span>
            <span className="cat-tile-name">{g.label}</span>
            <span className="cat-tile-count">{count} {count === 1 ? 'business' : 'businesses'} →</span>
          </Link>
        )
      })}
    </div>
  )
}
