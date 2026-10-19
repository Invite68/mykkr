import Link from 'next/link'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { CATEGORY_GROUPS, subSlug } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { getGroupIcon, getSubIcon } from '@/data/categoryIcons'

export const metadata: Metadata = { title: 'All categories — My KKR' }

/** Strip leading emoji from subcategory display labels */
function cleanLabel(label: string): string {
  return label
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}‍️⃣·\s]+/gu, '')
    .trim()
}

export default function CategoriesPage() {
  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'All categories' }]} />
      <h1 className="page-title">All categories</h1>
      <p className="page-sub">Everything on My KKR, grouped by category.</p>

      {CATEGORY_GROUPS.map((g) => {
        const totalInCat = BUSINESSES.filter((b) => b.cat === g.slug).length
        const GroupIcon = getGroupIcon(g.slug)
        return (
          <section className="sec" key={g.slug} aria-labelledby={`g-${g.slug}`}>
            <div className="sec-head">
              <h2 className="sec-title" id={`g-${g.slug}`}>
                <span className="sec-title-icon" aria-hidden="true">
                  <GroupIcon size={18} strokeWidth={2} />
                </span>
                {g.label}
                <span className="sec-count">{totalInCat} listed</span>
              </h2>
              <Link href={`/c/${g.slug}`} className="link">See all →</Link>
            </div>

            {/* Sub-category chips — horizontal scroll */}
            <div className="subcat-scroll">
              {g.subcategories.slice(1).map((s) => {
                const n = BUSINESSES.filter((b) => b.cat === g.slug && b.sub === s).length
                const SubIcon = getSubIcon(s)
                return (
                  <Link
                    key={s}
                    href={`/c/${g.slug}/${subSlug(s)}`}
                    className="subcat-chip"
                  >
                    <span className="subcat-chip-icon" aria-hidden="true">
                      <SubIcon size={13} strokeWidth={2} />
                    </span>
                    <span className="subcat-name">{cleanLabel(s)}</span>
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
