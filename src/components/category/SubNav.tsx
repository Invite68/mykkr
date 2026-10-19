import Link from 'next/link'
import type { CategoryGroup } from '@/data/categories'

/** Chip row: "All" + each subcategory of a group. Real links, no JS needed. */
export default function SubNav({ group, activeSub }: { group: CategoryGroup; activeSub?: string }) {
  if (group.subcategories.length < 2) return null
  return (
    <nav className="chips" aria-label={`${group.label} subcategories`} style={{ margin: '14px 0 4px' }}>
      <Link href={`/c/${group.slug}`} className={`chip${!activeSub ? ' active' : ''}`}>All</Link>
      {group.subcategories.slice(1).map((s) => (
        <Link key={s} href={`/c/${group.slug}/${encodeURIComponent(s)}`} className={`chip${activeSub === s ? ' active' : ''}`}>
          {s}
        </Link>
      ))}
    </nav>
  )
}
