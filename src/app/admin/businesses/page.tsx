'use client'

/**
 * Admin — Businesses Management
 * Full CRUD: activate / deactivate / verify KYC / suspend / delete
 * Filter by status, category, search by name
 */

import { useState } from 'react'
import Link from 'next/link'
import { BUSINESSES } from '@/data/businesses'
import { CATEGORY_GROUPS } from '@/data/categories'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

type BizStatus = 'active' | 'inactive' | 'suspended' | 'pending'

interface AdminBiz {
  slug: string; name: string; cat: string; sub: string; area: string
  rating: number; reviews: number; verified: boolean
  status: BizStatus; subscribed: boolean; phone?: string
  joinedDays: number
}

/* Seed demo data from BUSINESSES + add status/subscription fields */
const DEMO_BUSINESSES: AdminBiz[] = BUSINESSES.map((b, i) => ({
  slug: b.slug, name: b.name, cat: b.cat, sub: b.sub, area: b.area,
  rating: b.rating, reviews: b.reviews, verified: b.verified,
  phone: b.phone,
  status: (i % 7 === 3 ? 'pending' : i % 9 === 1 ? 'inactive' : i % 11 === 5 ? 'suspended' : 'active') as BizStatus,
  subscribed: i % 5 !== 0,
  joinedDays: Math.floor(Math.random() * 180) + 1,
}))

const STATUS_CONFIG: Record<BizStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: C.green, bg: '#f0fdf4' },
  inactive:  { label: 'Inactive',  color: C.muted, bg: C.bg },
  suspended: { label: 'Suspended', color: C.red,   bg: '#fef2f2' },
  pending:   { label: 'Pending KYC', color: C.amber, bg: '#fffbeb' },
}

function StatusBadge({ status }: { status: BizStatus }) {
  const s = STATUS_CONFIG[status]
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 99, padding: '2px 8px' }}>{s.label}</span>
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, fontWeight: 600, color, background: `${color}11`, border: `1px solid ${color}44`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}

const CAT_LABELS: Record<string, string> = {}
CATEGORY_GROUPS.forEach(g => { CAT_LABELS[g.slug] = g.label })

export default function AdminBusinesses() {
  const [bizList, setBizList] = useState<AdminBiz[]>(DEMO_BUSINESSES)
  const [filter, setFilter]   = useState<BizStatus | 'all'>('all')
  const [catFilter, setCatFilter] = useState('all')
  const [subFilter, setSubFilter] = useState<'all' | 'yes' | 'no'>('all')
  const [q, setQ]             = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [toast, setToast]     = useState('')
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function updateStatus(slugs: string[], newStatus: BizStatus) {
    setBizList(prev => prev.map(b => slugs.includes(b.slug) ? { ...b, status: newStatus } : b))
    setSelected(new Set())
    showToast(`${slugs.length} business${slugs.length > 1 ? 'es' : ''} marked as ${newStatus}`)
  }

  function toggleVerify(slug: string) {
    setBizList(prev => prev.map(b => b.slug === slug ? { ...b, verified: !b.verified, status: !b.verified ? 'active' : b.status } : b))
    showToast('Verification status updated')
  }

  function deleteBiz(slug: string) {
    if (!confirm('Permanently delete this business? This cannot be undone.')) return
    setBizList(prev => prev.filter(b => b.slug !== slug))
    showToast('Business removed')
  }

  function toggleSub(slug: string) {
    setBizList(prev => prev.map(b => b.slug === slug ? { ...b, subscribed: !b.subscribed } : b))
    showToast('Subscription status updated')
  }

  const filtered = bizList.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    if (catFilter !== 'all' && b.cat !== catFilter) return false
    if (subFilter === 'yes' && !b.subscribed) return false
    if (subFilter === 'no' && b.subscribed) return false
    if (q && !b.name.toLowerCase().includes(q.toLowerCase()) && !b.area.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const allSelected = filtered.length > 0 && filtered.every(b => selected.has(b.slug))

  function toggleSelectAll() {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map(b => b.slug)))
    }
  }

  const selArr = [...selected]

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Businesses</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>{bizList.length} total · {bizList.filter(b => b.status === 'active').length} active · {bizList.filter(b => b.status === 'pending').length} pending KYC</p>
        </div>
        <Link href="/admin/businesses/new" className="btn btn-primary" style={{ fontSize: 13, padding: '9px 16px', background: C.teal, color: '#fff', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
          + Add Business
        </Link>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search name or area…"
          style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, width: 200, outline: 'none' }}
        />
        <select value={filter} onChange={e => setFilter(e.target.value as BizStatus | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending KYC</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Categories</option>
          {CATEGORY_GROUPS.map(g => <option key={g.slug} value={g.slug}>{g.label}</option>)}
        </select>
        <select value={subFilter} onChange={e => setSubFilter(e.target.value as 'all' | 'yes' | 'no')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Subscriptions</option>
          <option value="yes">Subscribed</option>
          <option value="no">Not Subscribed</option>
        </select>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Bulk actions */}
      {selArr.length > 0 && (
        <div style={{ background: C.teal, color: '#fff', borderRadius: 8, padding: '10px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{selArr.length} selected</span>
          <button onClick={() => updateStatus(selArr, 'active')} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Activate</button>
          <button onClick={() => updateStatus(selArr, 'inactive')} style={{ background: 'rgba(255,255,255,.2)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Deactivate</button>
          <button onClick={() => updateStatus(selArr, 'suspended')} style={{ background: 'rgba(220,38,38,.3)', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Suspend</button>
          <button onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.7)', cursor: 'pointer', marginLeft: 'auto', fontSize: 13 }}>Clear</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {/* Table head */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 90px 80px 80px 160px', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5 }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
          </label>
          <span>Business</span>
          <span>Category</span>
          <span>Status</span>
          <span>Sub</span>
          <span>Rating</span>
          <span>Actions</span>
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 14 }}>No businesses match your filters</div>
        )}

        {filtered.map((b) => (
          <div key={b.slug}>
            <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 100px 90px 80px 80px 160px', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: selected.has(b.slug) ? 'rgba(18,52,59,.03)' : '#fff' }}>
              <label style={{ cursor: 'pointer' }}>
                <input type="checkbox" checked={selected.has(b.slug)} onChange={() => {
                  setSelected(s => { const n = new Set(s); n.has(b.slug) ? n.delete(b.slug) : n.add(b.slug); return n })
                }} />
              </label>

              <div>
                <button onClick={() => setExpandedSlug(s => s === b.slug ? null : b.slug)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{b.area} {b.verified && <span style={{ color: C.green, fontWeight: 700 }}> · Verified</span>}</div>
                </button>
              </div>

              <div style={{ fontSize: 11, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{CAT_LABELS[b.cat] ?? b.cat}</div>

              <StatusBadge status={b.status} />

              <div>
                {b.subscribed
                  ? <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>₹99/mo</span>
                  : <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>None</span>}
              </div>

              <div style={{ fontSize: 12, color: '#334155' }}>{b.rating.toFixed(1)} <span style={{ color: C.muted }}>({b.reviews})</span></div>

              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {b.status !== 'active' && <ActionBtn label="Activate" color={C.green} onClick={() => updateStatus([b.slug], 'active')} />}
                {b.status === 'active' && <ActionBtn label="Deactivate" color={C.muted} onClick={() => updateStatus([b.slug], 'inactive')} />}
                {b.status !== 'suspended' && <ActionBtn label="Suspend" color={C.red} onClick={() => updateStatus([b.slug], 'suspended')} />}
              </div>
            </div>

            {/* Expanded detail row */}
            {expandedSlug === b.slug && (
              <div style={{ padding: '14px 20px 14px 56px', background: '#fafafa', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>Details</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
                    <div>Sub-category: <strong>{b.sub}</strong></div>
                    {b.phone && <div>Phone: <strong>{b.phone}</strong></div>}
                    <div>Joined: <strong>{b.joinedDays} days ago</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignSelf: 'flex-start', paddingTop: 20 }}>
                  <ActionBtn label={b.verified ? 'Remove Verification' : 'Mark Verified (KYC)'} color={b.verified ? C.muted : C.green} onClick={() => toggleVerify(b.slug)} />
                  <ActionBtn label={b.subscribed ? 'Cancel Subscription' : 'Grant Subscription'} color={C.amber} onClick={() => toggleSub(b.slug)} />
                  <Link href={`/business/${b.slug}`} target="_blank" style={{ fontSize: 11, fontWeight: 600, color: C.teal, background: `${C.teal}11`, border: `1px solid ${C.teal}44`, borderRadius: 6, padding: '4px 10px', textDecoration: 'none' }}>View Public Page</Link>
                  <ActionBtn label="Delete" color={C.red} onClick={() => deleteBiz(b.slug)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {(['active', 'pending', 'inactive', 'suspended'] as BizStatus[]).map(s => {
          const count = bizList.filter(b => b.status === s).length
          const cfg = STATUS_CONFIG[s]
          return <div key={s} style={{ fontSize: 13, color: cfg.color, fontWeight: 600 }}>{cfg.label}: {count}</div>
        })}
      </div>
    </div>
  )
}
