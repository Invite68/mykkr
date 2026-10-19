'use client'

import { useState, useMemo } from 'react'
import CategoryNav, { CategoryFilter } from './CategoryNav'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { BUSINESSES } from '@/data/businesses'

export default function HomeFeed() {
  const [filter, setFilter] = useState<CategoryFilter>({
    catSlug: null,
    subLabel: null,
  })

  const filtered = useMemo(() => {
    // No L1 selected → show all (featured)
    if (!filter.catSlug) return BUSINESSES

    // L1 selected, no L2 → all businesses in that L1
    const inCat = BUSINESSES.filter((b) => b.cat === filter.catSlug)
    if (!filter.subLabel) return inCat

    // L2 selected → filter by exact sub label
    return inCat.filter((b) => b.sub === filter.subLabel)
  }, [filter])

  return (
    <>
      <CategoryNav filter={filter} onFilter={setFilter} />
      <BusinessGrid
        businesses={filtered}
        emptyMessage={
          filter.catSlug
            ? `No businesses listed yet in this category. Be the first to register!`
            : undefined
        }
      />
    </>
  )
}
