'use client'
import { useState, useMemo } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff', purple: '#7c3aed', blue: '#0369a1' }

type ActivityType = 'business' | 'customer' | 'delivery' | 'payment' | 'content' | 'system' | 'kyc' | 'auth'

type Activity = {
  id: string; time: string; type: ActivityType; title: string; detail: string
  actor?: string; actorId?: string; severity: 'info' | 'warning' | 'critical'
}

const TYPE_COLOR: Record<ActivityType, string> = {
  business: C.teal, customer: C.blue, delivery: C.purple, payment: C.green,
  content: C.amber, system: C.muted, kyc: '#0f766e', auth: C.red
}

const TYPE_LABEL: Record<ActivityType, string> = {
  business: 'Business', customer: 'Customer', delivery: 'Delivery', payment: 'Payment',
  content: 'Content', system: 'System', kyc: 'KYC', auth: 'Auth'
}

const SEV_COLOR: Record<string, string> = { info: C.teal, warning: C.amber, critical: C.red }

const ALL_ACTIVITY: Activity[] = [
  { id: 'a001', time: '2 min ago', type: 'business', title: 'New business registered', detail: 'KKR Laundry Hub submitted profile — awaiting admin review', actor: 'Ranjit Sharma', actorId: 'B-0089', severity: 'info' },
  { id: 'a002', time: '5 min ago', type: 'payment', title: 'Subscription payment received', detail: '₹99 monthly plan paid by Sharma Kirana Store via Razorpay', actor: 'Sharma Kirana', actorId: 'B-0012', severity: 'info' },
  { id: 'a003', time: '8 min ago', type: 'delivery', title: 'Delivery job completed', detail: 'Job #J-2047 — Ramesh Kumar delivered to Brahma Colony (3.2 km, ₹45)', actor: 'Ramesh Kumar', actorId: 'D-001', severity: 'info' },
  { id: 'a004', time: '12 min ago', type: 'content', title: 'Flagged listing reported', detail: 'Product listing flagged by user for inappropriate image — auto-hidden pending review', actor: 'System', severity: 'warning' },
  { id: 'a005', time: '18 min ago', type: 'kyc', title: 'KYC submitted for review', detail: 'Sunrise Hotel KKR submitted Aadhaar + GSTIN documents for verification', actor: 'Sunrise Hotel', actorId: 'B-0034', severity: 'info' },
  { id: 'a006', time: '25 min ago', type: 'customer', title: 'New customer signup', detail: 'Priya Sharma joined and started 7-day free trial', actor: 'Priya Sharma', actorId: 'C-0124', severity: 'info' },
  { id: 'a007', time: '32 min ago', type: 'auth', title: 'Admin login', detail: 'Admin logged in from IP 192.168.1.45 (Kurukshetra)', actor: 'admin@mykkr.in', severity: 'info' },
  { id: 'a008', time: '45 min ago', type: 'business', title: 'Business account suspended', detail: 'Account B-0067 suspended by admin — reason: duplicate fake listings', actor: 'admin@mykkr.in', severity: 'warning' },
  { id: 'a009', time: '1 hr ago', type: 'payment', title: 'Subscription payment failed', detail: 'Auto-renewal for Gupta Hardware (B-0023) failed — card declined', actor: 'Gupta Hardware', actorId: 'B-0023', severity: 'warning' },
  { id: 'a010', time: '1.5 hr ago', type: 'delivery', title: 'Driver approved', detail: 'Suresh Yadav (D-002) passed KYC verification and activated as driver', actor: 'admin@mykkr.in', severity: 'info' },
  { id: 'a011', time: '2 hr ago', type: 'content', title: 'Inappropriate content removed', detail: 'Listing L-3421 removed by automated content filter — explicit image detected', actor: 'System', severity: 'critical' },
  { id: 'a012', time: '2.5 hr ago', type: 'system', title: 'Search index rebuilt', detail: 'Category search index refreshed — 312 new listings indexed', actor: 'System', severity: 'info' },
  { id: 'a013', time: '3 hr ago', type: 'customer', title: 'Customer account banned', detail: 'C-0089 (Mohan Lal) permanently banned for fraudulent booking activity', actor: 'admin@mykkr.in', severity: 'critical' },
  { id: 'a014', time: '4 hr ago', type: 'payment', title: 'Refund processed', detail: 'Subscription refund of ₹99 processed to Ravi Gupta (C-0034)', actor: 'admin@mykkr.in', severity: 'info' },
  { id: 'a015', time: '5 hr ago', type: 'business', title: 'Business promoted to top', detail: 'KKR Sweet Shop (B-0008) promoted to featured listing by admin', actor: 'admin@mykkr.in', severity: 'info' },
  { id: 'a016', time: '6 hr ago', type: 'kyc', title: 'KYC rejected', detail: 'B-0071 (City Travels) KYC rejected — documents unclear/expired', actor: 'admin@mykkr.in', severity: 'warning' },
  { id: 'a017', time: '8 hr ago', type: 'system', title: 'Maintenance mode ended', detail: 'Planned maintenance completed — platform back online after 22-min downtime', actor: 'System', severity: 'info' },
  { id: 'a018', time: '10 hr ago', type: 'delivery', title: 'Fare rates updated', detail: 'Per-km rate for Cab/Sedan updated from ₹11 to ₹12 by admin', actor: 'admin@mykkr.in', severity: 'info' },
]

const TYPES: (ActivityType | 'all')[] = ['all', 'business', 'customer', 'delivery', 'payment', 'content', 'system', 'kyc', 'auth']
const SEVS: ('all' | 'info' | 'warning' | 'critical')[] = ['all', 'info', 'warning', 'critical']

export default function AdminActivity() {
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all')
  const [sevFilter, setSevFilter] = useState<'all' | 'info' | 'warning' | 'critical'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return ALL_ACTIVITY.filter(a => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false
      if (sevFilter !== 'all' && a.severity !== sevFilter) return false
      const q = search.toLowerCase()
      return !q || a.title.toLowerCase().includes(q) || a.detail.toLowerCase().includes(q) || (a.actor || '').toLowerCase().includes(q)
    })
  }, [typeFilter, sevFilter, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: ALL_ACTIVITY.length }
    TYPES.filter(t => t !== 'all').forEach(t => { c[t] = ALL_ACTIVITY.filter(a => a.type === t).length })
    return c
  }, [])

  function exportCSV() {
    const rows = ['Time,Type,Severity,Title,Detail,Actor']
    filtered.forEach(a => rows.push(`"${a.time}","${a.type}","${a.severity}","${a.title}","${a.detail}","${a.actor || ''}""`))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a'); el.href = url; el.download = 'activity_log.csv'; el.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Activity Feed</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Real-time platform events — filter by type, severity, or search</p>
        </div>
        <button onClick={exportCSV} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.teal, borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Export CSV</button>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px,1fr))', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'Total Events', val: ALL_ACTIVITY.length, color: C.teal },
          { label: 'Warnings', val: ALL_ACTIVITY.filter(a => a.severity === 'warning').length, color: C.amber },
          { label: 'Critical', val: ALL_ACTIVITY.filter(a => a.severity === 'critical').length, color: C.red },
          { label: 'Payments', val: counts['payment'], color: C.green },
          { label: 'KYC', val: counts['kyc'], color: '#0f766e' },
          { label: 'Deliveries', val: counts['delivery'], color: C.purple },
        ].map(t => (
          <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 3 }}>{t.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.color }}>{t.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${typeFilter===t ? (t==='all' ? C.teal : TYPE_COLOR[t as ActivityType]) : C.border}`, background: typeFilter===t ? (t==='all' ? C.teal : TYPE_COLOR[t as ActivityType]) : C.surface, color: typeFilter===t ? '#fff' : C.muted }}>
            {t === 'all' ? 'All' : TYPE_LABEL[t as ActivityType]} {t !== 'all' && `(${counts[t]})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {SEVS.map(s => {
          const color = s === 'all' ? C.muted : SEV_COLOR[s]
          return (
            <button key={s} onClick={() => setSevFilter(s)} style={{ padding: '4px 12px', borderRadius: 99, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${sevFilter===s ? color : C.border}`, background: sevFilter===s ? color : C.surface, color: sevFilter===s ? '#fff' : C.muted }}>
              {s.charAt(0).toUpperCase()+s.slice(1)} {s === 'all' && `(${ALL_ACTIVITY.length})`}
            </button>
          )
        })}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events..." style={{ marginLeft: 'auto', border: `1px solid ${C.border}`, borderRadius: 8, padding: '5px 12px', fontSize: 12, outline: 'none', width: 220 }} />
      </div>

      {/* Feed */}
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>No events match the current filters.</div>}
        {filtered.map((a, i) => {
          const tc = TYPE_COLOR[a.type]
          const sc = SEV_COLOR[a.severity]
          return (
            <div key={a.id} style={{ display: 'grid', gridTemplateColumns: '90px 90px 90px 1fr 120px', gap: 10, padding: '11px 14px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'center', background: a.severity === 'critical' ? 'rgba(220,38,38,.03)' : a.severity === 'warning' ? 'rgba(180,83,9,.02)' : 'transparent' }}>
              <span style={{ fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{a.time}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: tc, background: `${tc}15`, border: `1px solid ${tc}30`, borderRadius: 99, padding: '2px 8px', textAlign: 'center' }}>{TYPE_LABEL[a.type]}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: sc, background: `${sc}15`, border: `1px solid ${sc}30`, borderRadius: 99, padding: '2px 8px', textAlign: 'center' }}>{a.severity}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5, color: '#1e293b', marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.4 }}>{a.detail}</div>
              </div>
              <div style={{ fontSize: 11, color: C.muted, textAlign: 'right' }}>
                {a.actor && <div style={{ fontWeight: 600, color: '#334155' }}>{a.actor}</div>}
                {a.actorId && <div style={{ fontFamily: 'monospace', color: C.muted }}>{a.actorId}</div>}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: C.muted, textAlign: 'right' }}>
        Showing {filtered.length} of {ALL_ACTIVITY.length} events
      </div>
    </div>
  )
}
