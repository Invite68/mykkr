import Link from 'next/link'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { getGroupIcon } from '@/data/categoryIcons'

export default function CategoryGrid() {
  return (
    <div className="cat-grid">
      {CATEGORY_GROUPS.map((g) => {
        const count = BUSINESSES.filter((b) => b.cat === g.slug).length
        const Icon = getGroupIcon(g.slug)
        return (
          <Link key={g.slug} href={`/c/${g.slug}`} className="cat-tile">
            <span className="cat-tile-icon-wrap" aria-hidden="true">
              <Icon size={26} strokeWidth={1.75} />
            </span>
            <span className="cat-tile-name">{g.label}</span>
            <span className="cat-tile-count">{count} {count === 1 ? 'business' : 'businesses'} →</span>
          </Link>
        )
      })}
    </div>
  )
}
