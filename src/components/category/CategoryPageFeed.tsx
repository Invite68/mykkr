'use client'

import { useState, useMemo } from 'react'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { getSubIcon } from '@/data/categoryIcons'
import type { Business } from '@/data/businesses'

interface CategoryGroup {
  slug: string
  label: string
  subcategories: string[]
}

interface Props {
  group: CategoryGroup
  businesses: Business[]
}

/** Strip leading emoji from subcategory display labels */
function cleanLabel(label: string): string {
  return label
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}‍️⃣·\s]+/gu, '')
    .trim()
}

export default function CategoryPageFeed({ group, businesses }: Props) {
  // null = "All <category>" (first chip)
  const [activeSub, setActiveSub] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!activeSub) return businesses
    return businesses.filter((b) => b.sub === activeSub)
  }, [activeSub, businesses])

  return (
    <>
      {/* L2 subcategory chip strip */}
      <div className="cat-scroll-row cat-l2-row" role="group" aria-label={`${group.label} subcategories`}
        style={{ marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16 }}>
        {group.subcategories.map((sub, i) => {
          const isAllChip = i === 0
          const isActive = isAllChip ? activeSub === null : activeSub === sub
          const SubIcon = getSubIcon(sub)
          return (
            <button
              key={sub}
              className={`cat-l2-chip${isActive ? ' active' : ''}`}
              onClick={() => setActiveSub(isAllChip ? null : sub)}
              aria-pressed={isActive}
            >
              <SubIcon size={13} strokeWidth={2} aria-hidden="true" />
              {isAllChip ? `All ${group.label}` : cleanLabel(sub)}
            </button>
          )
        })}
      </div>

      {/* Filtered business grid */}
      <section className="sec" aria-live="polite">
        <BusinessGrid
          businesses={filtered}
          emptyMessage={`No businesses listed yet in this subcategory. Be the first to register!`}
        />
      </section>
    </>
  )
}
