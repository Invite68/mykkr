'use client'

/**
 * Admin — Subscriptions Management
 * View all active/expired/trial subscriptions across businesses and customers
 */

import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

type SubStatus = 'active' | 'trial' | 'expired' | 'cancelled'
type SubPlan = 'business' | 'customer'

interface Subscription {
  id: string; userName: string; userRole: SubPlan; status: SubStatus
  plan: string; amount: number; startDate: string; nextBilling: string
  daysLeft: number; paymentId: string
}

const DEMO_SUBS: Subscription[] = [
  { id: 's001', userName: 'Sharma Kirana Store',   userRole: 'business', status: 'active',    plan: '₹99/mo',     amount: 99,   startDate: '01 Oct 2026', nextBilling: '01 Nov 2026', daysLeft: 15, paymentId: 'pay_Nxk123abc' },
  { id: 's002', userName: 'Priya Sharma',           userRole: 'customer', status: 'active',    plan: '₹9.99/mo',   amount: 9.99, startDate: '15 Oct 2026', nextBilling: '15 Nov 2026', daysLeft: 29, paymentId: 'pay_Nxk456def' },
  { id: 's003', userName: 'Golden Bakery',          userRole: 'business', status: 'active',    plan: '₹99/mo',     amount: 99,   startDate: '05 Oct 2026', nextBilling: '05 Nov 2026', daysLeft: 19, paymentId: 'pay_Nxk789ghi' },
  { id: 's004', userName: 'Amit Verma',             userRole: 'customer', status: 'trial',     plan: '7-day free', amount: 0,    startDate: '24 Oct 2026', nextBilling: '31 Oct 2026', daysLeft: 4,  paymentId: 'trial' },
  { id: 's005', userName: 'KKR Grand Banquet',      userRole: 'business', status: 'active',    plan: '₹99/mo',     amount: 99,   startDate: '10 Sep 2026', nextBilling: '10 Nov 2026', daysLeft: 24, paymentId: 'pay_NxkJKLmno' },
  { id: 's006', userName: 'Sunita Devi',            userRole: 'customer', status: 'active',    plan: '₹9.99/mo',   amount: 9.99, startDate: '01 Oct 2026', nextBilling: '01 Nov 2026', daysLeft: 15, paymentId: 'pay_NxkPQRstu' },
  { id: 's007', userName: 'Vidya Stationers',       userRole: 'business', status: 'expired',   plan: '₹99/mo',     amount: 99,   startDate: '01 Sep 2026', nextBilling: 'Expired',     daysLeft: 0,  paymentId: 'pay_NxkVWXyz0' },
  { id: 's008', userName: 'Rajput Electronics',     userRole: 'business', status: 'cancelled', plan: '₹99/mo',     amount: 99,   startDate: '15 Aug 2026', nextBilling: 'Cancelled',   daysLeft: 0,  paymentId: 'pay_Nxk1234AB' },
  { id: 's009', userName: 'Mohan Lal',              userRole: 'customer', status: 'trial',     plan: '7-day free', amount: 0,    startDate: '23 Oct 2026', nextBilling: '30 Oct 2026', daysLeft: 3,  paymentId: 'trial' },
  { id: 's010', userName: 'Singh Electricals',      userRole: 'business', status: 'active',    plan: '₹99/mo',     amount: 99,   startDate: '01 Oct 2026', nextBilling: '01 Nov 2026', daysLeft: 15, paymentId: 'pay_Nxk5678CD' },
]

const STATUS_CONFIG: Record<SubStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: C.green, bg: '#f0fdf4' },
  trial:     { label: 'Trial',     color: C.amber, bg: '#fffbeb' },
  expired:   { label: 'Expired',   color: C.red,   bg: '#fef2f2' },
  cancelled: { label: 'Cancelled', color: C.muted, bg: C.bg },
}

function StatusBadge({ status }: { status: SubStatus }) {
  const s = STATUS_CONFIG[status]
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 99, padding: '2px 8px' }}>{s.label}</span>
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ fontSize: 11, fontWeight: 600, color, background: `${color}11`, border: `1px solid ${color}44`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>{label}</button>
}

export default function AdminSubscriptions() {
  const [subs, setSubs]         = useState<Subscription[]>(DEMO_SUBS)
  const [planFilter, setPlan]   = useState<SubPlan | 'all'>('all')
  const [statusFilter, setStatus] = useState<SubStatus | 'all'>('all')
  const [q, setQ]               = useState('')
  const [toast, setToast]       = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function cancelSub(id: string) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'cancelled' as SubStatus, nextBilling: 'Cancelled', daysLeft: 0 } : s))
    showToast('Subscription cancelled')
  }
  function grantSub(id: string, role: SubPlan) {
    setSubs(prev => prev.map(s => s.id === id ? { ...s, status: 'active' as SubStatus, amount: role === 'business' ? 99 : 9.99, plan: role === 'business' ? '₹99/mo' : '₹9.99/mo', nextBilling: '27 Nov 2026', daysLeft: 30 } : s))
    showToast('Subscription granted (demo)')
  }

  const filtered = subs.filter(s => {
    if (planFilter !== 'all' && s.userRole !== planFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (q && !s.userName.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const totalMRR = subs.filter(s => s.status === 'active' && s.amount > 0).reduce((n, s) => n + s.amount, 0)
  const counts = { active: subs.filter(s => s.status === 'active').length, trial: subs.filter(s => s.status === 'trial').length, expired: subs.filter(s => s.status === 'expired').length }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Subscriptions</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>{subs.length} total · MRR: ₹{totalMRR.toFixed(2)}</p>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px,1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active',  value: counts.active,  color: C.green, filter: 'active' as SubStatus },
          { label: 'On Trial', value: counts.trial,  color: C.amber, filter: 'trial' as SubStatus },
          { label: 'Expired', value: counts.expired, color: C.red,   filter: 'expired' as SubStatus },
        ].map(({ label, value, color, filter }) => (
          <button key={label} onClick={() => setStatus(f => f === filter ? 'all' : filter)} style={{ background: '#fff', border: `1px solid ${statusFilter === filter ? color : C.border}`, borderRadius: 12, padding: '16px 18px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
          </button>
        ))}
        <div style={{ background: C.teal, borderRadius: 12, padding: '16px 18px', textAlign: 'left' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Est. MRR</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.gold, lineHeight: 1.1 }}>₹{totalMRR.toFixed(0)}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search user name…" style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, width: 200, outline: 'none' }} />
        <select value={planFilter} onChange={e => setPlan(e.target.value as SubPlan | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Plans</option>
          <option value="business">Business (₹99/mo)</option>
          <option value="customer">Customer (₹9.99/mo)</option>
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value as SubStatus | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 100px 110px 110px 110px 130px', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5 }}>
          <span>User</span><span>Plan</span><span>Amount</span><span>Status</span><span>Started</span><span>Next Billing</span><span>Actions</span>
        </div>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No subscriptions match filters</div>}
        {filtered.map(s => (
          <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 100px 110px 110px 110px 130px', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{s.userName}</div>
              <div style={{ fontSize: 11, color: C.muted }}>ID: {s.id} · Razorpay: {s.paymentId}</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: s.userRole === 'business' ? C.teal : '#0369a1', background: s.userRole === 'business' ? 'rgba(18,52,59,.08)' : '#f0f9ff', borderRadius: 99, padding: '2px 8px' }}>
              {s.userRole === 'business' ? 'Business' : 'Customer'}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: s.amount === 0 ? C.muted : '#334155' }}>{s.amount === 0 ? 'Free' : `₹${s.amount}`}</span>
            <StatusBadge status={s.status} />
            <span style={{ fontSize: 12, color: C.muted }}>{s.startDate}</span>
            <div>
              <div style={{ fontSize: 12, color: s.daysLeft > 0 && s.daysLeft <= 7 ? C.red : '#334155' }}>{s.nextBilling}</div>
              {s.daysLeft > 0 && <div style={{ fontSize: 10, color: C.muted }}>{s.daysLeft}d left</div>}
            </div>
            <div style={{ display: 'flex', gap: 5 }}>
              {(s.status === 'expired' || s.status === 'cancelled') && <ActionBtn label="Grant" color={C.green} onClick={() => grantSub(s.id, s.userRole)} />}
              {(s.status === 'active' || s.status === 'trial') && <ActionBtn label="Cancel" color={C.red} onClick={() => cancelSub(s.id)} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
