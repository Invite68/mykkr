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
  { id: 'BZ011', name: 'Fresh Greens Farm', owner: 'Sanjay Verma', phone: '98765-00011', category: 'Groceries', subcat: 'Fruits & Vegetables', status: 'under_review', kyc: 'pending', sub: 'trial', promoted: false, joined: '25 Oct 2026', lastActive: '25 Oct 2026', listings: 6, orders: 2, rating: 4.0, flagReason: 'Possible inappropriate image uploaded' },
  { id: 'BZ012', name: 'Style Hub Fashion', owner: 'Neeta Sharma', phone: '98765-00012', category: 'Fashion', subcat: 'Fashion', status: 'active', kyc: 'verified', sub: 'paid', subPrice: 99, promoted: false, joined: '08 Sep 2026', lastActive: '26 Oct 2026', listings: 31, orders: 87, rating: 4.1 },
]

const STATUS_CFG: Record<Status, { label: string; color: string }> = {
  active:       { label: 'Active',        color: C.green },
  inactive:     { label: 'Inactive',      color: C.muted },
  pending:      { label: 'Pending',       color: C.amber },
  blocked:      { label: 'Blocked',       color: C.red },
  flagged:      { label: 'Flagged',       color: C.red },
  under_review: { label: 'Under Review',  color: '#7c3aed' },
}
const KYC_CFG: Record<KYC, { label: string; color: string }> = {
  verified:      { label: 'KYC Verified',     color: C.green },
  pending:       { label: 'KYC Pending',      color: C.amber },
  not_submitted: { label: 'KYC Not Sent',     color: C.muted },
  rejected:      { label: 'KYC Rejected',     color: C.red },
}
const SUB_CFG: Record<SubPlan, { label: string; color: string }> = {
  paid:    { label: 'Paid',    color: C.green },
  trial:   { label: 'Trial',   color: C.amber },
  expired: { label: 'Expired', color: C.red },
  free:    { label: 'Free',    color: C.muted },
}

const CATS = ['All Categories', 'Groceries', 'Food', 'Fashion', 'Hospitality', 'Services', 'Real Estate', 'Transport']

function Badge({ cfg }: { cfg: { label: string; color: string } }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}15`, border: `1px solid ${cfg.color}35`, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap', display: 'inline-block' }}>{cfg.label}</span>
}

function btnStyle(bg: string, color = '#fff'): React.CSSProperties {
  return { background: bg, border: 'none', color, padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }
}

export default function AdminBusinesses() {
  const [tab, setTab] = useState<'list' | 'analytics'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'all'>('all')
  const [catFilter, setCatFilter] = useState('All Categories')
  const [kycFilter, setKycFilter] = useState<KYC | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [data, setData] = useState(BUSINESSES)

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

  function setStatus(id: string, s: Status) { setData(d => d.map(b => b.id === id ? { ...b, status: s } : b)); showToast(`Status: ${STATUS_CFG[s].label}`) }
  function setKyc(id: string, k: KYC) { setData(d => d.map(b => b.id === id ? { ...b, kyc: k } : b)); showToast(`KYC: ${KYC_CFG[k].label}`) }
  function togglePromote(id: string) {
    const biz = data.find(b => b.id === id)!
    setData(d => d.map(b => b.id === id ? { ...b, promoted: !b.promoted } : b))
    showToast(biz.promoted ? 'Promotion removed' : 'Promoted to top')
  }
  function deleteBiz(id: string) { if (!confirm('Delete this business? Cannot be undone.')) return; setData(d => d.filter(b => b.id !== id)); showToast('Business deleted') }

  const counts = { all: data.length, active: data.filter(b=>b.status==='active').length, pending: data.filter(b=>b.status==='pending').length, blocked: data.filter(b=>b.status==='blocked').length, under_review: data.filter(b=>b.status==='under_review').length, inactive: data.filter(b=>b.status==='inactive').length }

  const months = ['Apr','May','Jun','Jul','Aug','Sep','Oct']
  const newBiz = [4, 7, 5, 9, 6, 8, 11]
  const maxBiz = Math.max(...newBiz)

  return (
    <div style={{ paddingBottom: 40 }}>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 24px rgba(0,0,0,.25)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: C.teal, letterSpacing: -0.5 }}>Businesses</h1>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Manage accounts, KYC, subscriptions and listings</p>
      </div>

      {/* Stat tiles — 3 per row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total', value: counts.all, color: C.teal },
          { label: 'Active', value: counts.active, color: C.green },
          { label: 'Pending', value: counts.pending, color: C.amber },
          { label: 'Review', value: counts.under_review, color: '#7c3aed' },
          { label: 'Blocked', value: counts.blocked, color: C.red },
          { label: 'Inactive', value: counts.inactive, color: C.muted },
        ].map(t => (
          <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([['list','Business List'], ['analytics','Analytics']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)} style={{ padding: '8px 18px', borderRadius: 8, border: tab === t ? 'none' : `1px solid ${C.border}`, background: tab === t ? C.teal : C.surface, color: tab === t ? '#fff' : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{label}</button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
            {(['all', 'active', 'pending', 'under_review', 'blocked', 'inactive'] as const).map(s => {
              const count = s === 'all' ? counts.all : counts[s] ?? 0
              const color = s === 'all' ? C.teal : STATUS_CFG[s]?.color ?? C.teal
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', flexShrink: 0, background: statusFilter === s ? color : '#e2e8f0', color: statusFilter === s ? '#fff' : C.muted, transition: 'all .15s' }}>
                  {s === 'all' ? 'All' : STATUS_CFG[s]?.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Search + filters */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, marginBottom: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID, phone or owner…" style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ flex: 1, minWidth: 130, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                {CATS.map(c => <option key={c}>{c}</option>)}
              </select>
              <select value={kycFilter} onChange={e => setKycFilter(e.target.value as KYC | 'all')} style={{ flex: 1, minWidth: 130, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                <option value="all">All KYC</option>
                {(Object.entries(KYC_CFG) as [KYC, {label: string; color: string}][]).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{filtered.length} business{filtered.length !== 1 ? 'es' : ''} found</div>
          </div>

          {/* Card list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 14 }}>No businesses match your filters</div>}
            {filtered.map(b => (
              <div key={b.id} style={{ background: C.surface, border: `1px solid ${b.flagReason ? C.red+'45' : C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px' }}>
                  {/* Top row: name + manage */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    {/* Business icon */}
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: `${C.teal}15`, border: `1px solid ${C.teal}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: C.teal }}>{b.name}</span>
                        {b.promoted && <span style={{ fontSize: 9, fontWeight: 800, color: C.gold, background: C.gold+'20', border: `1px solid ${C.gold}`, borderRadius: 99, padding: '1px 6px' }}>TOP</span>}
                        {b.flagReason && <span style={{ fontSize: 9, fontWeight: 800, color: C.red, background: C.red+'12', border: `1px solid ${C.red}40`, borderRadius: 99, padding: '1px 6px' }}>FLAGGED</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.muted }}>{b.owner} &nbsp;·&nbsp; {b.subcat}</div>
                      <code style={{ fontSize: 10, color: C.muted, background: C.bg, padding: '1px 6px', borderRadius: 4, fontWeight: 700, marginTop: 2, display: 'inline-block' }}>{b.id}</code>
                    </div>
                    <button onClick={() => setExpanded(expanded === b.id ? null : b.id)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: expanded === b.id ? '#fff' : C.teal, background: expanded === b.id ? C.teal : `${C.teal}10`, border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
                      {expanded === b.id ? 'Close' : 'Manage'}
                    </button>
                  </div>

                  {/* Flag reason */}
                  {b.flagReason && <div style={{ fontSize: 12, color: C.red, background: C.red+'08', border: `1px solid ${C.red}20`, borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>{b.flagReason}</div>}

                  {/* Badges */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    <Badge cfg={STATUS_CFG[b.status]} />
                    <Badge cfg={KYC_CFG[b.kyc]} />
                    <Badge cfg={SUB_CFG[b.sub]} />
                    {b.subPrice && <span style={{ fontSize: 11, color: C.muted, alignSelf: 'center' }}>₹{b.subPrice}/mo</span>}
                  </div>

                  {/* Stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                    {[
                      { label: 'Listings', value: b.listings },
                      { label: 'Orders', value: b.orders },
                      { label: 'Rating', value: b.rating > 0 ? `${b.rating}★` : 'N/A' },
                      { label: 'Joined', value: b.joined.split(' ')[2] ? `${b.joined.split(' ')[1]} ${b.joined.split(' ')[2]}` : b.joined },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#334155' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Manage panel */}
                {expanded === b.id && (
                  <div style={{ background: '#f8fafc', borderTop: `1px solid ${C.border}`, padding: '14px 16px' }}>
                    {/* Detail info */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: C.muted }}>Phone: <strong style={{ color: C.teal }}>{b.phone}</strong></div>
                      <div style={{ fontSize: 12, color: C.muted }}>GSTIN: <strong style={{ color: '#334155' }}>{b.gstin ?? 'Not provided'}</strong></div>
                      <div style={{ fontSize: 12, color: C.muted }}>Last active: <strong>{b.lastActive}</strong></div>
                      <div style={{ fontSize: 12, color: C.muted }}>Category: <strong>{b.category}</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {b.status !== 'active'       && <button onClick={() => setStatus(b.id,'active')}       style={btnStyle(C.green)}>Activate</button>}
                      {b.status !== 'inactive'     && <button onClick={() => setStatus(b.id,'inactive')}     style={btnStyle(C.muted)}>Deactivate</button>}
                      {b.status !== 'blocked'      && <button onClick={() => setStatus(b.id,'blocked')}      style={btnStyle(C.red)}>Block</button>}
                      {b.status !== 'under_review' && <button onClick={() => setStatus(b.id,'under_review')} style={btnStyle('#7c3aed')}>Flag Review</button>}
                      {b.kyc !== 'verified'        && <button onClick={() => setKyc(b.id,'verified')}        style={btnStyle(C.green)}>Verify KYC</button>}
                      {b.kyc !== 'rejected'        && <button onClick={() => setKyc(b.id,'rejected')}        style={btnStyle(C.amber)}>Reject KYC</button>}
                      <button onClick={() => togglePromote(b.id)} style={btnStyle(C.gold, '#1a1a1a')}>{b.promoted ? 'Remove Promo' : 'Promote Top'}</button>
                      <button onClick={() => { setData(d => d.map(x => x.id === b.id ? { ...x, sub: 'paid', subPrice: 99 } : x)); showToast('Subscription granted') }} style={btnStyle(C.teal)}>Grant Sub</button>
                      <button onClick={() => { setData(d => d.map(x => x.id === b.id ? { ...x, sub: 'expired' } : x)); showToast('Subscription cancelled') }} style={btnStyle('#475569')}>Cancel Sub</button>
                      <button onClick={() => deleteBiz(b.id)} style={btnStyle(C.red)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.teal, marginBottom: 4 }}>New Business Registrations</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>Monthly new signups, Apr – Oct 2026</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 140 }}>
              {months.map((m, i) => (
                <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 11, color: C.teal, fontWeight: 700 }}>{newBiz[i]}</div>
                  <div style={{ width: '100%', background: C.teal, borderRadius: '4px 4px 0 0', height: Math.round((newBiz[i] / maxBiz) * 100), transition: 'height .3s' }} />
                  <div style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>{m}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.teal, marginBottom: 16 }}>Business Status Breakdown</div>
            {([['Active', counts.active, C.green], ['Pending Approval', counts.pending, C.amber], ['Under Review', counts.under_review, '#7c3aed'], ['Blocked', counts.blocked, C.red], ['Inactive', counts.inactive, C.muted]] as [string, number, string][]).map(([label, count, color]) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
                  <span style={{ color: C.muted, fontWeight: 600 }}>{count} ({Math.round(count/counts.all*100)}%)</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${Math.round(count/counts.all*100)}%`, background: color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
