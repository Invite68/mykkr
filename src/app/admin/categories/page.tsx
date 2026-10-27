'use client'

/**
 * Admin — Categories & Sub-categories Management
 * Add / rename / activate / deactivate groups and sub-categories
 */

import { useState } from 'react'
import { CATEGORY_GROUPS } from '@/data/categories'
import { getGroupIcon, getSubIcon } from '@/data/categoryIcons'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

interface ManagedGroup {
  slug: string; label: string; active: boolean
  subcategories: { label: string; active: boolean }[]
}

/* Seed from static category data */
const INITIAL_GROUPS: ManagedGroup[] = CATEGORY_GROUPS.map(g => ({
  slug: g.slug,
  label: g.label,
  active: true,
  subcategories: g.subcategories.slice(1).map(s => ({ label: s, active: true })),
}))

function IcChevron({ open }: { open: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}><polyline points="9 18 15 12 9 6"/></svg>
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 38, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: checked ? C.green : '#d1d5db', position: 'relative', transition: 'background .15s', flexShrink: 0 }} aria-pressed={checked}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 18 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
    </button>
  )
}

export default function AdminCategories() {
  const [groups, setGroups] = useState<ManagedGroup[]>(INITIAL_GROUPS)
  const [expanded, setExpanded] = useState<string | null>(groups[0]?.slug ?? null)
  const [toast, setToast]   = useState('')
  const [editingGroup, setEditingGroup] = useState<string | null>(null)
  const [editGroupLabel, setEditGroupLabel] = useState('')
  const [newSubInput, setNewSubInput]   = useState<Record<string, string>>({})
  const [editSubIdx, setEditSubIdx]     = useState<{ groupSlug: string; idx: number } | null>(null)
  const [editSubLabel, setEditSubLabel] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function toggleGroup(slug: string) {
    setGroups(prev => prev.map(g => g.slug === slug ? { ...g, active: !g.active } : g))
    showToast('Category status updated')
  }

  function toggleSub(groupSlug: string, idx: number) {
    setGroups(prev => prev.map(g => g.slug === groupSlug
      ? { ...g, subcategories: g.subcategories.map((s, i) => i === idx ? { ...s, active: !s.active } : s) }
      : g
    ))
    showToast('Sub-category status updated')
  }

  function addSub(groupSlug: string) {
    const label = (newSubInput[groupSlug] ?? '').trim()
    if (!label) return
    setGroups(prev => prev.map(g => g.slug === groupSlug
      ? { ...g, subcategories: [...g.subcategories, { label, active: true }] }
      : g
    ))
    setNewSubInput(prev => ({ ...prev, [groupSlug]: '' }))
    showToast(`"${label}" added`)
  }

  function deleteSub(groupSlug: string, idx: number) {
    if (!confirm('Remove this sub-category?')) return
    setGroups(prev => prev.map(g => g.slug === groupSlug
      ? { ...g, subcategories: g.subcategories.filter((_, i) => i !== idx) }
      : g
    ))
    showToast('Sub-category removed')
  }

  function saveGroupLabel(slug: string) {
    if (!editGroupLabel.trim()) return
    setGroups(prev => prev.map(g => g.slug === slug ? { ...g, label: editGroupLabel.trim() } : g))
    setEditingGroup(null)
    showToast('Category renamed')
  }

  function saveSubLabel() {
    if (!editSubIdx || !editSubLabel.trim()) return
    const { groupSlug, idx } = editSubIdx
    setGroups(prev => prev.map(g => g.slug === groupSlug
      ? { ...g, subcategories: g.subcategories.map((s, i) => i === idx ? { ...s, label: editSubLabel.trim() } : s) }
      : g
    ))
    setEditSubIdx(null)
    showToast('Sub-category renamed')
  }

  const totalActive = groups.filter(g => g.active).length
  const totalSubs = groups.reduce((n, g) => n + g.subcategories.filter(s => s.active).length, 0)

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Categories</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>{totalActive} of {groups.length} categories active · {totalSubs} sub-categories active</p>
        </div>
        <div style={{ background: 'rgba(225,179,130,.15)', border: '1px solid rgba(225,179,130,.5)', borderRadius: 8, padding: '8px 14px', fontSize: 12, color: C.teal }}>
          Changes apply to all listings and search
        </div>
      </div>

      {/* Category list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {groups.map(group => {
          const Icon = getGroupIcon(group.slug)
          const isOpen = expanded === group.slug
          const activeSubs = group.subcategories.filter(s => s.active).length

          return (
            <div key={group.slug} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', opacity: group.active ? 1 : 0.6 }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: isOpen ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(18,52,59,.08)', flexShrink: 0 }}>
                  <Icon size={18} strokeWidth={1.8} color={C.teal} />
                </span>

                {editingGroup === group.slug ? (
                  <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                    <input autoFocus value={editGroupLabel} onChange={e => setEditGroupLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveGroupLabel(group.slug) }} style={{ flex: 1, border: `1px solid ${C.teal}`, borderRadius: 6, padding: '5px 10px', fontSize: 14, fontWeight: 700, outline: 'none' }} />
                    <button onClick={() => saveGroupLabel(group.slug)} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Save</button>
                    <button onClick={() => setEditingGroup(null)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 10px', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: group.active ? C.teal : C.muted }}>{group.label}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{activeSubs} sub-categories active · slug: <code style={{ fontSize: 10 }}>{group.slug}</code></div>
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
                  {editingGroup !== group.slug && (
                    <button onClick={() => { setEditingGroup(group.slug); setEditGroupLabel(group.label) }} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: C.muted, fontWeight: 600 }}>Rename</button>
                  )}
                  <Toggle checked={group.active} onChange={() => toggleGroup(group.slug)} />
                  <button onClick={() => setExpanded(s => s === group.slug ? null : group.slug)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.muted, display: 'flex' }}>
                    <IcChevron open={isOpen} />
                  </button>
                </div>
              </div>

              {/* Sub-categories */}
              {isOpen && (
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>Sub-categories</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                    {group.subcategories.map((sub, idx) => {
                      const SubIcon = getSubIcon(sub.label)
                      const isEditingSub = editSubIdx?.groupSlug === group.slug && editSubIdx?.idx === idx
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: sub.active ? C.bg : '#fff', border: `1px solid ${C.border}`, borderRadius: 8, opacity: sub.active ? 1 : 0.5 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, background: 'rgba(18,52,59,.06)', flexShrink: 0 }}>
                            <SubIcon size={14} strokeWidth={1.8} color={C.teal} />
                          </span>

                          {isEditingSub ? (
                            <div style={{ display: 'flex', gap: 6, flex: 1 }}>
                              <input autoFocus value={editSubLabel} onChange={e => setEditSubLabel(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveSubLabel() }} style={{ flex: 1, border: `1px solid ${C.teal}`, borderRadius: 5, padding: '4px 8px', fontSize: 13, outline: 'none' }} />
                              <button onClick={saveSubLabel} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 5, padding: '4px 10px', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Save</button>
                              <button onClick={() => setEditSubIdx(null)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 5, padding: '4px 8px', cursor: 'pointer', fontSize: 12 }}>✕</button>
                            </div>
                          ) : (
                            <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: '#334155' }}>{sub.label}</span>
                          )}

                          {!isEditingSub && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                              <button onClick={() => { setEditSubIdx({ groupSlug: group.slug, idx }); setEditSubLabel(sub.label) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 11, fontWeight: 600 }}>Rename</button>
                              <Toggle checked={sub.active} onChange={() => toggleSub(group.slug, idx)} />
                              <button onClick={() => deleteSub(group.slug, idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: 11, fontWeight: 600 }}>Remove</button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* Add new sub-category */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={newSubInput[group.slug] ?? ''}
                      onChange={e => setNewSubInput(prev => ({ ...prev, [group.slug]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') addSub(group.slug) }}
                      placeholder="Add new sub-category…"
                      style={{ flex: 1, border: `1px dashed ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', background: C.bg }}
                    />
                    <button onClick={() => addSub(group.slug)} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      + Add
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new category */}
      <div style={{ marginTop: 20, background: '#fff', border: `1.5px dashed ${C.border}`, borderRadius: 12, padding: '20px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Need a new top-level category?</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>Contact the development team to add a new category group — it requires a new icon and slug in code.</div>
        <a href="mailto:dev@mykkr.in" style={{ display: 'inline-block', background: C.teal, color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700 }}>Request new category</a>
      </div>
    </div>
  )
}
