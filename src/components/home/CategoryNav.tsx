'use client'

/**
 * CategoryNav — Two-tier reactive category filter
 *
 * L1 bar:  horizontal scroll of parent category tabs  (All + 7 groups)
 * L2 strip: subcategory chips — changes when L1 selection changes
 * Emits (catSlug, subSlug) up via onFilter callback so the parent
 * page can filter the business grid reactively.
 */

import { useState } from 'react'
import { CATEGORY_GROUPS } from '@/data/categories'

export interface CategoryFilter {
  catSlug: string | null  // null = "All"
  subSlug: string | null  // null = "All"
}

interface Props {
  filter: CategoryFilter
  onFilter: (f: CategoryFilter) => void
}

export default function CategoryNav({ filter, onFilter }: Props) {
  const activeGroup = CATEGORY_GROUPS.find((g) => g.slug === filter.catSlug) ?? null

  function selectL1(catSlug: string | null) {
    onFilter({ catSlug, subSlug: null })
  }

  function selectL2(subSlug: string | null) {
    onFilter({ ...filter, subSlug })
  }

  return (
    <div className="cat-nav">
      {/* ── L1 — parent categories ────────────────────────────────────── */}
      <div className="cat-l1" role="tablist" aria-label="Browse by category">
        <div className="cat-l1-inner">
          <button
            role="tab"
            aria-selected={filter.catSlug === null}
            className={`cat-l1-tab${filter.catSlug === null ? ' active' : ''}`}
            onClick={() => selectL1(null)}
          >
            🏪 All
          </button>
          {CATEGORY_GROUPS.map((g) => (
            <button
              key={g.slug}
              role="tab"
              aria-selected={filter.catSlug === g.slug}
              className={`cat-l1-tab${filter.catSlug === g.slug ? ' active' : ''}`}
              onClick={() => selectL1(g.slug)}
            >
              {g.icon} {g.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── L2 — subcategory chips (only when a group is selected) ─────── */}
      {activeGroup && (
        <div className="cat-l2" role="group" aria-label={`${activeGroup.name} subcategories`}>
          <div className="cat-l2-inner">
            <button
              className={`cat-l2-chip${filter.subSlug === null ? ' active' : ''}`}
              onClick={() => selectL2(null)}
            >
              All
            </button>
            {activeGroup.subcategories.map((sub) => (
              <button
                key={sub.slug}
                className={`cat-l2-chip${filter.subSlug === sub.slug ? ' active' : ''}`}
                onClick={() => selectL2(sub.slug)}
              >
                {sub.icon} {sub.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
