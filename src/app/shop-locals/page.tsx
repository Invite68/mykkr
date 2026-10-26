'use client'

/**
 * Shop Locals — category + sub-category picker.
 * Two-step flow: pick a category group → pick a sub-category.
 * Only shows GOODS / SHOP categories (not services, transport, events).
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CATEGORY_GROUPS, subSlug } from '@/data/categories'
import { getGroupIcon, getSubIcon } from '@/data/categoryIcons'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

/** Groups that represent physical goods / local shops */
const SHOP_GROUP_SLUGS = ['shopping', 'food', 'venues']

const C = { teal: '#12343b', gold: '#e1b382' }

function stripEmoji(s: string) {
  return s.replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}‍️⃣·\s]+/gu, '').trim()
}

export default function ShopLocalsPage() {
  const router = useRouter()
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  const shopGroups = CATEGORY_GROUPS.filter((g) => SHOP_GROUP_SLUGS.includes(g.slug))
  const activeGroup = shopGroups.find((g) => g.slug === selectedGroup)

  return (
    <div className="container" style={{ paddingBottom: 60 }}>
      <Breadcrumbs items={[{ label: 'Shop Locals' }]} />

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: C.teal, margin: '0 0 4px' }}>
          Shop Locals
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
          {selectedGroup ? 'Choose what you\'re looking for' : 'What are you looking for today?'}
        </p>
      </div>

      {/* Step 1 — category group grid */}
      {!selectedGroup && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          {shopGroups.map((g) => {
            const Icon = getGroupIcon(g.slug)
            return (
              <button
                key={g.slug}
                onClick={() => setSelectedGroup(g.slug)}
                style={{
                  background: '#fff',
                  border: `1.5px solid var(--border)`,
                  borderRadius: 14,
                  padding: '20px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  aspectRatio: '1 / 1',
                  textAlign: 'center',
                  transition: 'border-color .15s, box-shadow .15s',
                  boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.teal
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 12px rgba(18,52,59,.12)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  ;(e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 4px rgba(0,0,0,.06)'
                }}
              >
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 52, height: 52, borderRadius: 14,
                  background: `rgba(18,52,59,.08)`,
                }}>
                  <Icon size={26} strokeWidth={1.7} color={C.teal} />
                </span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.teal }}>{g.label}</span>
              </button>
            )
          })}

          {/* Extra: All Businesses tile */}
          <button
            onClick={() => router.push('/categories')}
            style={{
              background: 'rgba(18,52,59,.04)',
              border: `1.5px dashed rgba(18,52,59,.2)`,
              borderRadius: 14,
              padding: '20px 16px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              aspectRatio: '1 / 1',
              textAlign: 'center',
            }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 52, height: 52, borderRadius: 14,
              background: `rgba(18,52,59,.06)`,
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.teal }}>Browse all</span>
          </button>
        </div>
      )}

      {/* Step 2 — sub-category list */}
      {selectedGroup && activeGroup && (
        <>
          {/* Back button */}
          <button
            onClick={() => setSelectedGroup(null)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'none', border: 'none', cursor: 'pointer',
              color: C.teal, fontSize: 13, fontWeight: 700,
              padding: '0 0 16px', marginLeft: -2,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back to categories
          </button>

          {/* Sub-category grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10,
          }}>
            {activeGroup.subcategories.slice(1).map((sub) => {
              const SubIcon = getSubIcon(sub)
              const label = stripEmoji(sub)
              const href = `/c/${activeGroup.slug}/${subSlug(sub)}`
              return (
                <button
                  key={sub}
                  onClick={() => router.push(href)}
                  style={{
                    background: '#fff',
                    border: `1.5px solid var(--border)`,
                    borderRadius: 14,
                    padding: '18px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    aspectRatio: '1 / 1',
                    textAlign: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,.06)',
                    transition: 'border-color .15s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = C.teal
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'
                  }}
                >
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(18,52,59,.07)',
                  }}>
                    <SubIcon size={22} strokeWidth={1.7} color={C.teal} />
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.teal, lineHeight: 1.3 }}>{label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
