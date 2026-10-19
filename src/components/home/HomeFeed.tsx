'use client'

/**
 * HomeFeed — client component that owns the reactive category+business state.
 *
 * Rendered below the hero on the home page.
 * CategoryNav drives L1/L2 filter selection.
 * BusinessGrid re-renders showing only matching businesses.
 */

import { useState } from 'react'
import Link from 'next/link'
import CategoryNav, { type CategoryFilter } from './CategoryNav'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { BUSINESSES, businessesInSub, businessesInSubs } from '@/data/businesses'
import { CATEGORY_GROUPS } from '@/data/categories'

export default function HomeFeed() {
  const [filter, setFilter] = useState<CategoryFilter>({ catSlug: null, subSlug: null })

  // Compute filtered businesses
  const businesses = (() => {
    if (!filter.catSlug) {
      // All: show featured (verified) sorted by rating
      return BUSINESSES.filter((b) => b.verified).sort((a, b) => b.rating - a.rating).slice(0, 8)
    }
    const group = CATEGORY_GROUPS.find((g) => g.slug === filter.catSlug)
    if (!group) return []

    if (filter.subSlug) {
      return businessesInSub(filter.subSlug)
    }
    // All subcategories in this group
    return businessesInSubs(group.subcategories.map((s) => s.slug))
  })()

  const titleText = (() => {
    if (!filter.catSlug) return 'Featured providers'
    const group = CATEGORY_GROUPS.find((g) => g.slug === filter.catSlug)!
    if (filter.subSlug) {
      const sub = group.subcategories.find((s) => s.slug === filter.subSlug)
      return sub ? `${sub.name} businesses` : group.name
    }
    return `${group.name} businesses`
  })()

  const subText = filter.catSlug
    ? `${businesses.length} listing${businesses.length !== 1 ? 's' : ''} · Kurukshetra district`
    : 'Verified · Highest rated · Kurukshetra district'

  return (
    <>
      {/* Two-tier category nav */}
      <CategoryNav filter={filter} onFilter={setFilter} />

      {/* Reactive business grid */}
      <div className="container">
        <section className="sec" aria-labelledby="feed-h">
          <div className="sec-head">
            <div>
              <h2 className="sec-title" id="feed-h">{titleText}</h2>
              <div className="sec-sub">{subText}</div>
            </div>
            {!filter.catSlug && (
              <Link href="/search?q=" className="link">View all →</Link>
            )}
          </div>
          <BusinessGrid businesses={businesses} />
        </section>
      </div>
    </>
  )
}
