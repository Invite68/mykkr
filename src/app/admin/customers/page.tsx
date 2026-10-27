'use client'
import { useState, useMemo } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type CStatus = 'active' | 'inactive' | 'banned'
type CSub = 'paid' | 'trial' | 'expired' | 'free'

interface Customer {
  id: string; name: string; phone: string; email?: string; status: CStatus
  sub: CSub; subDaysLeft?: number; joined: string; lastActive: string
  bookings: number; orders: number; spent: number; flagged: boolean
}

const CUSTOMERS: Customer[] = [
  { id: 'CU001', name: 'Priya Sharma', phone: '98765-10001', email: 'priya@email.com', status: 'active', sub: 'trial', subDaysLeft: 4, joined: '24 Oct 2026', lastActive: '27 Oct 2026', bookings: 2, orders: 5, spent: 847, flagged: false },
  { id: 'CU002', name: 'Amit Kumar', phone: '98765-10002', status: 'active', sub: 'paid', joined: '10 Sep 2026', lastActive: '26 Oct 2026', bookings: 14, orders: 31, spent: 4210, flagged: false },
  { id: 'CU003', name: 'Sunita Devi', phone: '98765-10003', status: 'active', sub: 'paid', joined: '05 Aug 2026', lastActive: '25 Oct 2026', bookings: 7, orders: 18, spent: 2390, flagged: false },
  { id: 'CU004', name: 'Arun Kumar', phone: '98765-10004', status: 'active', sub: 'paid', joined: '20 Jul 2026', lastActive: '27 Oct 2026', bookings: 22, orders: 47, spent: 6830, flagged: false },
  { id: 'CU005', name: 'Mohan Lal', phone: '98765-10005', status: 'banned', sub: 'expired', joined: '15 Jun 2026', lastActive: '20 Oct 2026', bookings: 3, orders: 7, spent: 320, flagged: true },
  { id: 'CU006', name: 'Kavita Singh', phone: '98765-10006', status: 'active', sub: 'trial', subDaysLeft: 6, joined: '22 Oct 2026', lastActive: '26 Oct 2026', bookings: 0, orders: 3, spent: 180, flagged: false },
  { id: 'CU007', name: 'Ravi Gupta', phone: '98765-10007', status: 'active', sub: 'paid', joined: '01 Jun 2026', lastActive: '24 Oct 2026', bookings: 11, orders: 25, spent: 3940, flagged: false },
  { id: 'CU008', name: 'Neha Verma', phone: '98765-10008', status: 'inactive', sub: 'expired', joined: '10 May 2026', lastActive: '10 Sep 2026', bookings: 2, orders: 8, spent: 640, flagged: false },
  { id: 'CU009', name: 'Suresh Patel', phone: '98765-10009', status: 'active', sub: 'paid', joined: '15 Apr 2026', lastActive: '27 Oct 2026', bookings: 30, orders: 64, spent: 9120, flagged: false },
  { id: 'CU010', name: 'Ananya Joshi', phone: '98765-10010', status: 'active', sub: 'trial', subDaysLeft: 2, joined: '26 Oct 2026', lastActive: '27 Oct 2026', bookings: 0, orders: 1, spent: 95, flagged: false },
]

const ST: Record<CStatus, {label:string;color:string}> = {
  active:   { label: 'Active',    color: C.green },
  inactive: { label: 'Inactive',  color: C.muted },
  banned:   { label: 'Banned',    color: C.red },
}
const SS: Record<CSub, {label:string;color:string}> = {
  paid:    { label: 'Paid',    color: C.green },
  trial:   { label: 'Trial',   color: C.amber },
  expired: { label: 'Expired', color: C.red },
  free:    { label: 'Free',    color: C.muted },
}

function Badge({ cfg }: { cfg: {label:string;color:string} }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}14`, border: `1px solid ${cfg.color}30`, borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap' }}>{cfg.label}</span>
}

export default function AdminCustomers() {
  const [tab, setTab] = useState<'list' | 'analytics'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<CStatus | 'all'>('all')
  const [subFilter, setSubFilter] = useState<CSub | 'all'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [data, setData] = useState(CUSTOMERS)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  const filtered = useMemo(() => data.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (subFilter !== 'all' && c.sub !== subFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q) && !c.id.toLowerCase().includes(q) && !c.phone.includes(q)) return false
    }
    return true
  }), [data, statusFilter, subFilter, search])

  function act(id: string, status: CStatus) { setData(d => d.map(c => c.id === id ? { ...c, status } : c)); showToast(`Status updated: ${ST[status].label}`) }
  function grantSub(id: string) { setData(d => d.map(c => c.id === id ? { ...c, sub: 'paid' } : c)); showToast('Subscription granted') }
  function revokeSub(id: string) { setData(d => d.map(c => c.id === id ? { ...c, sub: 'expired' } : c)); showToast('Subscription revoked') }
  function deleteC(id: string) { if (!confirm('Delete this customer account?')) return; setData(d => d.filter(c => c.id !== id)); showToast('Account deleted') }

  const counts = { all: data.length, active: data.filter(c => c.status==='active').length, inactive: data.filter(c => c.status==='inactive').length, banned: data.filter(c => c.status==='banned').length, paid: data.filter(c => c.sub==='paid').length, trial: data.filter(c => c.sub==='trial').length, expired: data.filter(c => c.sub==='expired').length }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Customers</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage customer accounts, subscriptions and activities</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setTab('list')} style={{ padding: '7px 16px', borderRadius: 8, border: tab==='list' ? 'none' : `1px solid ${C.border}`, background: tab==='list' ? C.teal : C.surface, color: tab==='list' ? '#fff' : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>List</button>
          <button onClick={() => setTab('analytics')} style={{ padding: '7px 16px', borderRadius: 8, border: tab==='analytics' ? 'none' : `1px solid ${C.border}`, background: tab==='analytics' ? C.teal : C.surface, color: tab==='analytics' ? '#fff' : C.muted, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Analytics</button>
        </div>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: counts.all, color: C.teal },
          { label: 'Active', value: counts.active, color: C.green },
          { label: 'Paid Sub', value: counts.paid, color: C.green },
          { label: 'On Trial', value: counts.trial, color: C.amber },
          { label: 'Expired', value: counts.expired, color: C.red },
          { label: 'Banned', value: counts.banned, color: C.red },
        ].map(t => (
          <div key={t.label} style={{ flex: 1, minWidth: 80, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.color }}>{t.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: .4 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {tab === 'list' && (
        <>
          {/* Filter bar */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, ID or phone…" style={{ flex: 1, minWidth: 200, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none' }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as CStatus | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              <option value="all">All Status</option>
              {(Object.entries(ST) as [CStatus, any][]).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <select value={subFilter} onChange={e => setSubFilter(e.target.value as CSub | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              <option value="all">All Plans</option>
              {(Object.entries(SS) as [CSub, any][]).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <span style={{ fontSize: 12, color: C.muted }}>{filtered.length} customers</span>
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 90px 80px 90px', gap: 8, padding: '10px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
              <span>ID</span><span>Customer</span><span>Status</span><span>Plan</span><span>Orders</span><span>Actions</span>
            </div>
            {filtered.map(c => (
              <div key={c.id}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 90px 80px 90px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', background: c.flagged ? 'rgba(220,38,38,.03)' : 'transparent' }}>
                  <code style={{ fontSize: 11, color: C.muted, fontWeight: 700 }}>{c.id}</code>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: C.teal }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{c.phone} · Joined {c.joined}</div>
                  </div>
                  <Badge cfg={ST[c.status]} />
                  <div>
                    <Badge cfg={SS[c.sub]} />
                    {c.sub === 'trial' && c.subDaysLeft !== undefined && <div style={{ fontSize: 10, color: C.amber, marginTop: 2 }}>{c.subDaysLeft}d left</div>}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{c.orders}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>₹{c.spent.toLocaleString()}</div>
                  </div>
                  <button onClick={() => setExpanded(expanded === c.id ? null : c.id)} style={{ fontSize: 12, fontWeight: 700, color: C.teal, background: 'rgba(18,52,59,.07)', border: 'none', borderRadius: 6, padding: '5px 10px', cursor: 'pointer' }}>
                    {expanded === c.id ? 'Close' : 'Manage'}
                  </button>
                </div>
                {expanded === c.id && (
                  <div style={{ background: '#f8fafc', borderBottom: `1px solid ${C.border}`, padding: '14px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {c.status !== 'active'   && <button onClick={() => act(c.id,'active')}   style={bs(C.green)}>Activate</button>}
                    {c.status !== 'inactive' && <button onClick={() => act(c.id,'inactive')} style={bs(C.muted)}>Deactivate</button>}
                    {c.status !== 'banned'   && <button onClick={() => act(c.id,'banned')}   style={bs(C.red)}>Ban Account</button>}
                    {c.status === 'banned'   && <button onClick={() => act(c.id,'active')}   style={bs(C.green)}>Unban</button>}
                    <button onClick={() => grantSub(c.id)} style={bs(C.teal)}>Grant Subscription</button>
                    <button onClick={() => revokeSub(c.id)} style={bs('#475569')}>Revoke Subscription</button>
                    <button onClick={() => showToast('Notification sent (demo)')} style={bs('#0369a1')}>Send Notification</button>
                    <button onClick={() => deleteC(c.id)} style={bs(C.red)}>Delete Account</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gap: 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.teal, marginBottom: 14 }}>Subscription Distribution</div>
            {[{ label: 'Paid subscribers', value: counts.paid, pct: Math.round(counts.paid/counts.all*100), color: C.green },
              { label: 'Free trial', value: counts.trial, pct: Math.round(counts.trial/counts.all*100), color: C.amber },
              { label: 'Expired/lapsed', value: counts.expired, pct: Math.round(counts.expired/counts.all*100), color: C.red },
            ].map(r => (
              <div key={r.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{r.label}</span>
                  <span style={{ color: C.muted }}>{r.value} ({r.pct}%)</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${r.pct}%`, background: r.color, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.teal, marginBottom: 4 }}>Top Spending Customers</div>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 14 }}>By total order value across all businesses</div>
            {[...data].sort((a,b) => b.spent - a.spent).slice(0,6).map((c, i) => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontWeight: 900, color: i < 3 ? C.gold : C.muted, width: 20, textAlign: 'center', fontSize: 14 }}>#{i+1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{c.orders} orders</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.teal }}>₹{c.spent.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function bs(bg: string) {
  return { background: bg, border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 7, fontWeight: 700, fontSize: 12, cursor: 'pointer' } as React.CSSProperties
}
