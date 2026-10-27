'use client'
import { useState, useMemo } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type Status = 'active' | 'inactive' | 'pending' | 'blocked' | 'flagged' | 'under_review'
type KYC = 'verified' | 'pending' | 'not_submitted' | 'rejected'
type SubPlan = 'paid' | 'trial' | 'expired' | 'free'

interface Biz {
  id: string; name: string; owner: string; phone: string; category: string; subcat: string
  status: Status; kyc: KYC; sub: SubPlan; subPrice?: number; promoted: boolean
  joined: string; lastActive: string; listings: number; orders: number; rating: number
  gstin?: string; flagReason?: string
}

const BUSINESSES: Biz[] = [
  { id: 'BZ001', name: 'Sharma Kirana Store', owner: 'Rajesh Sharma', phone: '98765-00001', category: 'Groceries', subcat: 'Groceries', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 99, promoted: true, joined: '12 Jan 2026', lastActive: '27 Oct 2026', listings: 48, orders: 312, rating: 4.6 },
  { id: 'BZ002', name: 'Sunrise Hotel KKR', owner: 'Vikram Singh', phone: '98765-00002', category: 'Hospitality', subcat: 'Hotels & Guest Houses', status: 'active', kyc: 'pending', sub: 'paid', subPrice: 99, promoted: false, joined: '15 Feb 2026', lastActive: '26 Oct 2026', listings: 3, orders: 89, rating: 4.2, gstin: '06ABCDE1234F1Z5' },
  { id: 'BZ003', name: 'Golden Bakery', owner: 'Anita Gupta', phone: '98765-00003', category: 'Food', subcat: 'Sweets & Ice Creams', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 99, promoted: false, joined: '01 Mar 2026', lastActive: '27 Oct 2026', listings: 22, orders: 201, rating: 4.8 },
  { id: 'BZ004', name: 'Singh Electricals', owner: 'Harinder Singh', phone: '98765-00004', category: 'Services', subcat: 'Electrician', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 99, promoted: false, joined: '10 Mar 2026', lastActive: '25 Oct 2026', listings: 5, orders: 67, rating: 4.3 },
  { id: 'BZ005', name: 'KKR Grand Banquet', owner: 'Deepak Kapoor', phone: '98765-00005', category: 'Hospitality', subcat: 'Marriage & Event Venues', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 75, promoted: true, joined: '20 Apr 2026', lastActive: '26 Oct 2026', listings: 2, orders: 14, rating: 4.7 },
  { id: 'BZ006', name: 'Rajput Electronics', owner: 'Sunil Rajput', phone: '98765-00006', category: 'Groceries', subcat: 'Stationery', status: 'blocked', kyc: 'rejected', sub: 'expired', promoted: false, joined: '05 May 2026', lastActive: '20 Oct 2026', listings: 0, orders: 34, rating: 2.1, flagReason: 'Duplicate listings, fraudulent reviews' },
  { id: 'BZ007', name: 'Deep Clean Pro', owner: 'Ritu Mehra', phone: '98765-00007', category: 'Services', subcat: 'Cleaning Services', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 99, promoted: false, joined: '12 Jun 2026', lastActive: '27 Oct 2026', listings: 8, orders: 103, rating: 4.5 },
  { id: 'BZ008', name: 'Vidya Stationers', owner: 'Mahesh Yadav', phone: '98765-00008', category: 'Groceries', subcat: 'Stationery', status: 'inactive', kyc: 'verified', sub: 'expired', promoted: false, joined: '18 Jun 2026', lastActive: '14 Oct 2026', listings: 15, orders: 42, rating: 3.9 },
  { id: 'BZ009', name: 'KKR Laundry Hub', owner: 'Pooja Arora', phone: '98765-00009', category: 'Services', subcat: 'Cleaning Services', status: 'pending', kyc: 'not_submitted', sub: 'trial', promoted: false, joined: '27 Oct 2026', lastActive: '27 Oct 2026', listings: 1, orders: 0, rating: 0 },
  { id: 'BZ010', name: 'Pawan Plumbers', owner: 'Pawan Kumar', phone: '98765-00010', category: 'Services', subcat: 'Plumber', status: 'pending', kyc: 'pending', sub: 'trial', promoted: false, joined: '23 Oct 2026', lastActive: '24 Oct 2026', listings: 2, orders: 0, rating: 0 },
  { id: 'BZ011', name: 'Fresh Greens Farm', owner: 'Sanjay Verma', phone: '98765-00011', category: 'Groceries', subcat: 'Fruits & Vegetables', status: 'under_review', kyc: 'pending', sub: 'trial', promoted: false, joined: '25 Oct 2026', lastActive: '25 Oct 2026', listings: 6, orders: 2, rating: 4.0, flagReason: 'Content review: possible inappropriate image uploaded' },
  { id: 'BZ012', name: 'Style Hub Fashion', owner: 'Neeta Sharma', phone: '98765-00012', category: 'Fashion', subcat: 'Fashion', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 99, promoted: false, joined: '08 Sep 2026', lastActive: '26 Oct 2026', listings: 31, orders: 87, rating: 4.1 },
]

const STATUS_CFG: Record<Status, { label: string; color: string }> = {
  active:       { label: 'Active',        color: C.green },
  inactive:     { label: 'Inactive',      color: C.muted },
  pending:      { label: 'Pending',       color: C.amber },
  blocked:      { label: 'Blocked',       color: C.red },
  flagged:      { label: 'Flagged',       color: '#dc2626' },
  under_review: { label: 'Under Review',  color: '#7c3aed' },
}
const KYC_CFG: Record<KYC, { label: string; color: string }> = {
  verified:      { label: 'Verified',       color: C.green },
  pending:       { label: 'Pending',        color: C.amber },
  not_submitted: { label: 'Not Submitted',  color: C.muted },
  rejected:      { label: 'Rejected',       color: C.red },
}
const SUB_CFG: Record<SubPlan, { label: string; color: string }> = {
  paid:    { label: 'Paid',    color: C.green },
  trial:   { label: 'Trial',   color: C.amber },
  expired: { label: 'Expired', color: C.red },
  free:    { label: 'Free',    color: C.muted },
}

const CATS = ['All Categories', 'Groceries', 'Food', 'Fashion', 'Hospitality', 'Services', 'Real Estate', 'Transport']

function Badge({ cfg }: { cfg: { label: string; color: string } }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`, borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap' }}>{cfg.label}</span>
}

function StatTile({ label, value, color }: { label: string; value: number; color: string }) {
  return <div style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', textAlign: 'center', minWidth: 80 }}>
    <div style={{ fontSize: 22, fontWeight: 900, color }}>{value}</div>
    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .4 }}>{label}</div>
  </div>
}

export default function AdminBusinesses() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const initStatus = (params?.get('status') as Status | null) ?? 'all'

  const [tab, setTab] = useState<'list' | 'analytics'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>(initStatus as Status | 'all')
  const [catFilter, setCatFilter] = useState('All Categories')
  const [kycFilter, setKycFilter] = useState<KYC | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [data, setData] = useState(BUSINESSES)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3200) }

  const filtered = useMemo(() => data.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false
    if (catFilter !== 'All Categories' && b.category !== catFilter) return false
    if (kycFilter !== 'all' && b.kyc !== kycFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!b.name.toLowerCase().includes(q) && !b.id.toLowerCase().includes(q) && !b.phone.includes(q) && !b.owner.toLowerCase().includes(q)) return false
    }
    return true
  }), [data, statusFilter, catFilter, kycFilter, search])

  function setStatus(id: string, s: Status) {
    setData(d => d.map(b => b.id === id ? { ...b, status: s } : b))
    showToast(`Status updated to ${STATUS_CFG[s].label}`)
  }
  function setKyc(id: string, k: KYC) {
    setData(d => d.map(b => b.id === id ? { ...b, kyc: k } : b))
    showToast(`KYC status updated to ${KYC_CFG[k].label}`)
  }
  function togglePromote(id: string) {
    setData(d => d.map(b => b.id === id ? { ...b, promoted: !b.promoted } : b))
    const biz = data.find(b => b.id === id)!
    showToast(biz.promoted ? 'Promotion removed' : 'Business promoted to top')
  }
  function deleteBiz(id: string) {
    if (!confirm('Permanently delete this business account? This cannot be undone.')) return
    setData(d => d.filter(b => b.id !== id))
    showToast('Business deleted')
  }

  const counts = { all: data.length, active: data.filter(b=>b.status==='active').length, pending: data.filter(b=>b.status==='pending').length, blocked: data.filter(b=>b.status==='blocked').length, under_review: data.filter(b=>b.status==='under_review').length, inactive: data.filter(b=>b.status==='inactive').length, flagged: data.filter(b=>b.status==='flagged').length }

  // Monthly chart data (demo)
  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct']
  const newBiz = [4, 7, 5, 9, 6, 8, 11]
  const maxBiz = Math.max(...newBiz)

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Businesses</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage all business accounts, KYC, subscriptions and listings</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('list')} style={{ padding: '7px 16px', borderRadius: 8, border: tab==='list' ? 'none' : `1px solid ${C.border}`, background: tab==='list' ? C.teal : C.surface, color: tab==='list' ? '#fff' : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>List</button>
          <button onClick={() => setTab('analytics')} style={{ padding: '7px 16px', borderRadius: 8, border: tab==='analytics' ? 'none' : `1px solid ${C.border}`, background: tab==='analytics' ? C.teal : C.surface, color: tab==='analytics' ? '#fff' : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Analytics</button>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <StatTile label="Total" value={counts.all} color={C.teal} />
        <StatTile label="Active" value={counts.active} color={C.green} />
        <StatTile label="Pending" value={counts.pending} color={C.amber} />
        <StatTile label="Review" value={counts.under_review} color="#7c3aed" />
        <StatTile label="Blocked" value={counts.blocked} color={C.red} />
        <StatTile label="Inactive" value={counts.inactive} color={C.muted} />
      </div>

      {tab === 'list' && (
        <>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {(['all', 'active', 'pending', 'under_review', 'blocked', 'inactive', 'flagged'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: statusFilter === s ? (s === 'all' ? C.teal : STATUS_CFG[s as Status]?.color ?? C.teal) : '#e2e8f0',
                color: statusFilter === s ? '#fff' : C.muted,
              }}>
                {s === 'all' ? 'All' : STATUS_CFG[s as Status]?.label} {s === 'all' ? `(${counts.all})` : `(${counts[s] ?? 0})`}
              </button>
            ))}
          </div>

          {/* Search + filters */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, phone or owner…" style={{ flex: 1, minWidth: 200, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none' }} />
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={kycFilter} onChange={e => setKycFilter(e.target.value as KYC | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              <option value="all">All KYC</option>
              {(Object.entries(KYC_CFG) as [KYC, {label: string; color: string}][]).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span style={{ fontSize: 12, color: C.muted }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Table */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '24px 80px 1fr 110px 90px 80px 80px 80px', gap: 8, padding: '10px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
              <span><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(b=>b.id)) : new Set())} /></span>
              <span>ID</span><span>Business</span><span>Status / KYC</span><span>Plan</span><span>Listings</span><span>Orders</span><span>Actions</span>
            </div>
            {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted, fontSize: 13 }}>No businesses match your filters</div>}
            {filtered.map(b => (
              <div key={b.id}>
                {/* Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '24px 80px 1fr 110px 90px 80px 80px 80px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: b.flagReason ? 'rgba(220,38,38,.03)' : 'transparent' }}>
                  <input type="checkbox" checked={selected.has(b.id)} onChange={e => { const s = new Set(selected); e.target.checked ? s.add(b.id) : s.delete(b.id); setSelected(s) }} />
                  <code style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{b.id}</code>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: C.teal, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {b.name}
                      {b.promoted && <span style={{ fontSize: 9, fontWeight: 800, color: C.gold, background: 'rgba(225,179,130,.2)', border: `1px solid ${C.gold}`, borderRadius: 99, padding: '1px 6px', textTransform: 'uppercase' }}>Top</span>}
                      {b.flagReason && <span style={{ fontSize: 9, fontWeight: 800, color: C.red, background: 'rgba(220,38,38,.1)', border: `1px solid ${C.red}40`, borderRadius: 99, padding: '1px 6px', textTransform: 'uppercase' }}>Flagged</span>}
                    </div>
                    <div style={{ fontSize: 11, color: C.muted }}>{b.owner} · {b.subcat} · Joined {b.joined}</div>
                    {b.flagReason && <div style={{ fontSize: 11, color: C.red, marginTop: 2 }}>{b.flagReason}</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Badge cfg={STATUS_CFG[b.status]} />
                    <Badge cfg={KYC_CFG[b.kyc]} />
                  </div>
                  <div>
                    <Badge cfg={SUB_CFG[b.sub]} />
                    {b.subPrice && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>₹{b.subPrice}/mo</div>}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{b.listings}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{b.orders}</span>
                  <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} style={{ fontSize: 12, fontWeight: 700, color: C.teal, background: 'rgba(18,52,59,.07)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {expanded === b.id ? 'Close' : 'Manage'}
                  </button>
                </div>

                {/* Expanded panel */}
                {expanded === b.id && (
                  <div style={{ background: '#f8fafc', borderBottom: `1px solid ${C.border}`, padding: '16px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 10, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: C.muted }}>Phone: <strong style={{ color: C.teal }}>{b.phone}</strong></div>
                      <div style={{ fontSize: 12, color: C.muted }}>GSTIN: <strong style={{ color: '#334155' }}>{b.gstin ?? 'Not provided'}</strong></div>
                      <div style={{ fontSize: 12, color: C.muted }}>Last active: <strong>{b.lastActive}</strong></div>
                      <div style={{ fontSize: 12, color: C.muted }}>Rating: <strong>{b.rating > 0 ? `${b.rating}/5` : 'No reviews'}</strong></div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {/* Status actions */}
                      {b.status !== 'active'   && <button onClick={() => setStatus(b.id,'active')}   style={btnStyle(C.green)}>Set Active</button>}
                      {b.status !== 'inactive' && <button onClick={() => setStatus(b.id,'inactive')} style={btnStyle(C.muted)}>Deactivate</button>}
                      {b.status !== 'blocked'  && <button onClick={() => setStatus(b.id,'blocked')}  style={btnStyle(C.red)}>Block</button>}
                      {b.status !== 'under_review' && <button onClick={() => setStatus(b.id,'under_review')} style={btnStyle('#7c3aed')}>Flag for Review</button>}

                      {/* KYC actions */}
                      {b.kyc !== 'verified'  && <button onClick={() => setKyc(b.id,'verified')}  style={btnStyle(C.green)}>Verify KYC</button>}
                      {b.kyc !== 'rejected'  && <button onClick={() => setKyc(b.id,'rejected')}  style={btnStyle(C.amber)}>Reject KYC</button>}

                      {/* Promotion */}
                      <button onClick={() => togglePromote(b.id)} style={btnStyle(C.gold, '#000')}>
                        {b.promoted ? 'Remove Promotion' : 'Promote to Top'}
                      </button>

                      {/* Subscription */}
                      <button onClick={() => { setData(d => d.map(x => x.id === b.id ? { ...x, sub: 'paid', subPrice: 99 } : x)); showToast('Subscription granted') }} style={btnStyle(C.teal)}>Grant Sub</button>
                      <button onClick={() => { setData(d => d.map(x => x.id === b.id ? { ...x, sub: 'expired' } : x)); showToast('Subscription cancelled') }} style={btnStyle('#475569')}>Cancel Sub</button>

                      {/* Set custom price */}
                      <button onClick={() => { const p = prompt('Set custom price (₹/month):', String(b.subPrice ?? 99)); if (p && !isNaN(Number(p))) { setData(d => d.map(x => x.id === b.id ? { ...x, subPrice: Number(p) } : x)); showToast(`Price set to ₹${p}/month`) } }} style={btnStyle('#0e7490')}>Set Custom Price</button>

                      {/* View profile */}
                      <a href={`/business/${b.id}`} target="_blank" rel="noreferrer" style={{ ...btnStyle('#475569'), textDecoration: 'none', display: 'inline-block' }}>View Profile</a>

                      {/* Delete */}
                      <button onClick={() => deleteBiz(b.id)} style={btnStyle(C.red)}>Delete Account</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bulk actions */}
          {selected.size > 0 && (
            <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: C.teal, color: '#fff', padding: '10px 20px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, zIndex: 998, boxShadow: '0 8px 32px rgba(0,0,0,.25)' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{selected.size} selected</span>
              <button onClick={() => { setData(d => d.map(b => selected.has(b.id) ? { ...b, status: 'active' } : b)); showToast(`${selected.size} businesses activated`); setSelected(new Set()) }} style={{ background: C.green, border: 'none', color: '#fff', padding: '5px 14px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Activate</button>
              <button onClick={() => { setData(d => d.map(b => selected.has(b.id) ? { ...b, status: 'inactive' } : b)); showToast(`${selected.size} deactivated`); setSelected(new Set()) }} style={{ background: '#475569', border: 'none', color: '#fff', padding: '5px 14px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Deactivate</button>
              <button onClick={() => { setData(d => d.map(b => selected.has(b.id) ? { ...b, status: 'blocked' } : b)); showToast(`${selected.size} blocked`); setSelected(new Set()) }} style={{ background: C.red, border: 'none', color: '#fff', padding: '5px 14px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Block All</button>
              <button onClick={() => setSelected(new Set())} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', padding: '5px 12px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Clear</button>
            </div>
          )}
        </>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {/* New businesses by month */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.teal, marginBottom: 4 }}>New Business Registrations</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Monthly new signups, Apr – Oct 2026</div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', height: 140 }}>
              {months.map((m, i) => (
                <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{newBiz[i]}</div>
                  <div style={{ width: '100%', background: C.teal, borderRadius: '4px 4px 0 0', height: Math.round((newBiz[i] / maxBiz) * 110) }} />
                  <div style={{ fontSize: 10, color: C.muted }}>{m}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Category distribution */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.teal, marginBottom: 14 }}>Businesses by Category</div>
            {[
              { cat: 'Services', count: 3, pct: 25 },
              { cat: 'Groceries', count: 4, pct: 33 },
              { cat: 'Food', count: 1, pct: 8 },
              { cat: 'Hospitality', count: 2, pct: 17 },
              { cat: 'Fashion', count: 1, pct: 8 },
              { cat: 'Other', count: 1, pct: 9 },
            ].map(r => (
              <div key={r.cat} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{r.cat}</span>
                  <span style={{ color: C.muted }}>{r.count} ({r.pct}%)</span>
                </div>
                <div style={{ height: 6, background: '#e2e8f0', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: C.teal, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Status breakdown table */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontWeight: 800, fontSize: 14, color: C.teal }}>Status Breakdown</div>
            {(Object.entries(STATUS_CFG) as [Status, {label:string;color:string}][]).map(([s, cfg]) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', padding: '10px 18px', borderBottom: `1px solid ${C.border}`, gap: 12 }}>
                <Badge cfg={cfg} />
                <span style={{ fontWeight: 700, fontSize: 16, color: cfg.color, minWidth: 32 }}>{counts[s] ?? 0}</span>
                <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${Math.round(((counts[s] ?? 0) / counts.all) * 100)}%`, background: cfg.color, borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, color: C.muted, minWidth: 36, textAlign: 'right' }}>{Math.round(((counts[s] ?? 0) / counts.all) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function btnStyle(bg: string, color = '#fff') {
  return { background: bg, border: 'none', color, padding: '6px 14px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'opacity .1s' } as React.CSSProperties
}
