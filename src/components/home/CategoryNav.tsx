'use client'

import { LayoutGrid } from 'lucide-react'
import { CATEGORY_GROUPS, ALL_L1_TABS } from '@/data/categories'
import { getGroupIcon, getSubIcon } from '@/data/categoryIcons'

export interface CategoryFilter {
  catSlug: string | null   // null = "all"
  subLabel: string | null  // null = "All <cat>" / first chip
}

interface CategoryNavProps {
  filter: CategoryFilter
  onFilter: (f: CategoryFilter) => void
}

/** Strip leading emoji from subcategory labels for display in chips */
function cleanLabel(label: string): string {
  return label
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}‍️⃣·\s]+/gu, '')
    .trim()
}

export default function CategoryNav({ filter, onFilter }: CategoryNavProps) {
  const activeGroup = CATEGORY_GROUPS.find((g) => g.slug === filter.catSlug) ?? null

  function selectL1(slug: string) {
    if (slug === 'all') {
      onFilter({ catSlug: null, subLabel: null })
    } else {
      onFilter({ catSlug: slug, subLabel: null })
    }
  }

  function selectL2(sub: string, isAll: boolean) {
    if (isAll) {
      onFilter({ ...filter, subLabel: null })
    } else {
      onFilter({ ...filter, subLabel: sub })
    }
  }

  return (
    <div className="cat-nav">
      {/* L1 horizontal scroll row */}
      <div className="cat-scroll-row cat-l1-row" role="tablist" aria-label="Category">
        {ALL_L1_TABS.map((tab) => {
          const isActive =
            tab.slug === 'all'
              ? filter.catSlug === null
              : filter.catSlug === tab.slug
          const Icon = tab.slug === 'all' ? LayoutGrid : getGroupIcon(tab.slug)
          return (
            <button
              key={tab.slug}
              role="tab"
              aria-selected={isActive}
              className={`cat-l1-tab${isActive ? ' active' : ''}`}
              onClick={() => selectL1(tab.slug)}
            >
              <Icon size={15} strokeWidth={2} className="cat-l1-icon" aria-hidden="true" />
              {tab.slug === 'all' ? 'All' : tab.label.replace(/^[^\s]+\s/, '')}
            </button>
          )
        })}
      </div>

      {/* L2 chip strip — shown when a real L1 is active */}
      {activeGroup && (
        <div className="cat-scroll-row cat-l2-row" role="group" aria-label={`${activeGroup.label} subcategories`}>
          {activeGroup.subcategories.map((sub, i) => {
            const isAllChip = i === 0
            const isActive = isAllChip
              ? filter.subLabel === null
              : filter.subLabel === sub
            const SubIcon = getSubIcon(sub)
            return (
              <button
                key={sub}
                className={`cat-l2-chip${isActive ? ' active' : ''}`}
                onClick={() => selectL2(sub, isAllChip)}
                aria-pressed={isActive}
              >
                <SubIcon size={13} strokeWidth={2} aria-hidden="true" />
                {isAllChip ? `All ${activeGroup.label}` : cleanLabel(sub)}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
