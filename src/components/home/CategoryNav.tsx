'use client'

import { CATEGORY_GROUPS, ALL_L1_TABS } from '@/data/categories'

export interface CategoryFilter {
  catSlug: string | null   // null = "all"
  subLabel: string | null  // null = "All <cat>" / first chip
}

interface CategoryNavProps {
  filter: CategoryFilter
  onFilter: (f: CategoryFilter) => void
}

export default function CategoryNav({ filter, onFilter }: CategoryNavProps) {
  const activeGroup = CATEGORY_GROUPS.find((g) => g.slug === filter.catSlug) ?? null

  function selectL1(slug: string) {
    // When clicking "All", clear both
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
      {/* L1 row */}
      <div className="cat-l1">
        {ALL_L1_TABS.map((tab) => {
          const isActive =
            tab.slug === 'all'
              ? filter.catSlug === null
              : filter.catSlug === tab.slug
          return (
            <button
              key={tab.slug}
              className={`cat-l1-tab${isActive ? ' active' : ''}`}
              onClick={() => selectL1(tab.slug)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* L2 chips — only shown when a real L1 is selected */}
      {activeGroup && (
        <div className="cat-l2">
          {activeGroup.subcategories.map((sub, i) => {
            const isAllChip = i === 0
            const isActive = isAllChip
              ? filter.subLabel === null
              : filter.subLabel === sub
            return (
              <button
                key={sub}
                className={`cat-l2-chip${isActive ? ' active' : ''}`}
                onClick={() => selectL2(sub, isAllChip)}
              >
                {sub}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
