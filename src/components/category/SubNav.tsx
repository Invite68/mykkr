import Link from 'next/link'
import type { CategoryGroup } from '@/data/categories'

/** Chip row: "All" + each subcategory of a group. Real links, no JS needed. */
export default function SubNav({ group, activeSub }: { group: CategoryGroup; activeSub?: string }) {
  if (group.subcategories.length < 2) return null
  return (
    <nav className="chips" aria-label={`${group.name} subcategories`} style={{ margin: '14px 0 4px' }}>
      <Link href={`/c/${group.slug}`} className={`chip${!activeSub ? ' active' : ''}`}>All</Link>
      {group.subcategories.map((s) => (
        <Link key={s.slug} href={`/c/${group.slug}/${s.slug}`} className={`chip${activeSub === s.slug ? ' active' : ''}`}>
          {s.icon} {s.name}
        </Link>
      ))}
    </nav>
  )
}
