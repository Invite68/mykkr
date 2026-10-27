'use client'

/**
 * Admin — Audit Log
 * Read-only chronological event log of all admin actions
 */

import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

type EventType = 'biz_created' | 'biz_verified' | 'biz_suspended' | 'user_banned' | 'sub_granted' | 'sub_cancelled' | 'driver_approved' | 'cat_changed' | 'payment' | 'login'

interface AuditEvent {
  id: string; time: string; type: EventType; actor: string
  target: string; detail: string; ip: string
}

const TYPE_CONFIG: Record<EventType, { label: string; color: string }> = {
  biz_created:    { label: 'Biz Registered',   color: C.green },
  biz_verified:   { label: 'Biz Verified',      color: C.green },
  biz_suspended:  { label: 'Biz Suspended',     color: C.red   },
  user_banned:    { label: 'User Banned',        color: C.red   },
  sub_granted:    { label: 'Sub Granted',        color: C.green },
  sub_cancelled:  { label: 'Sub Cancelled',      color: C.amber },
  driver_approved:{ label: 'Driver Approved',    color: C.green },
  cat_changed:    { label: 'Category Changed',   color: C.amber },
  payment:        { label: 'Payment',            color: C.teal  },
  login:          { label: 'Admin Login',        color: C.muted },
}

const EVENTS: AuditEvent[] = [
  { id: 'evt001', time: '27 Oct 2026 · 14:32', type: 'biz_created',     actor: 'system',     target: 'KKR Laundry Hub',       detail: 'Business self-registered via app',                    ip: '49.47.x.x' },
  { id: 'evt002', time: '27 Oct 2026 · 12:11', type: 'payment',         actor: 'razorpay',   target: 'Sharma Kirana Store',   detail: 'Subscription payment ₹99 — pay_Nxk123abc',           ip: 'webhook' },
  { id: 'evt003', time: '27 Oct 2026 · 11:05', type: 'biz_verified',    actor: 'admin@mykkr.in', target: 'Sunrise Hotel KKR', detail: 'KYC verified — GSTIN: 06ABCDE1234F1Z5',             ip: '103.x.x.x' },
  { id: 'evt004', time: '26 Oct 2026 · 18:44', type: 'driver_approved', actor: 'admin@mykkr.in', target: 'Ravi Singh',        detail: 'Driver account approved — vehicle HR 08 EF 9012',    ip: '103.x.x.x' },
  { id: 'evt005', time: '26 Oct 2026 · 17:30', type: 'sub_cancelled',   actor: 'admin@mykkr.in', target: 'Vidya Stationers', detail: 'Business subscription cancelled — non-payment',      ip: '103.x.x.x' },
  { id: 'evt006', time: '26 Oct 2026 · 16:00', type: 'login',           actor: 'admin@mykkr.in', target: 'admin panel',       detail: 'Admin login from Chrome on Windows',                  ip: '103.x.x.x' },
  { id: 'evt007', time: '25 Oct 2026 · 14:22', type: 'biz_suspended',   actor: 'admin@mykkr.in', target: 'Rajput Electronics', detail: 'Suspended — duplicate listings reported',           ip: '103.x.x.x' },
  { id: 'evt008', time: '25 Oct 2026 · 09:10', type: 'user_banned',     actor: 'admin@mykkr.in', target: 'Mohan Lal',         detail: 'Customer banned — fraudulent booking reports',       ip: '103.x.x.x' },
  { id: 'evt009', time: '24 Oct 2026 · 15:55', type: 'cat_changed',     actor: 'admin@mykkr.in', target: 'Home Services',     detail: 'Sub-category "AC Repair" deactivated',               ip: '103.x.x.x' },
  { id: 'evt010', time: '24 Oct 2026 · 11:33', type: 'sub_granted',     actor: 'admin@mykkr.in', target: 'Deep Clean Pro',    detail: 'Free subscription granted for 30 days (promotion)',  ip: '103.x.x.x' },
  { id: 'evt011', time: '23 Oct 2026 · 10:00', type: 'biz_created',     actor: 'system',         target: 'Pawan Plumbers',    detail: 'Business self-registered via app',                    ip: '49.48.x.x' },
  { id: 'evt012', time: '22 Oct 2026 · 16:45', type: 'payment',         actor: 'razorpay',       target: 'Golden Bakery',     detail: 'Subscription payment ₹99 — pay_Nxk789ghi',           ip: 'webhook' },
]

export default function AdminAudit() {
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all')
  const [q, setQ] = useState('')

  const filtered = EVENTS.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false
    if (q && !e.target.toLowerCase().includes(q.toLowerCase()) && !e.detail.toLowerCase().includes(q.toLowerCase()) && !e.actor.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Audit Log</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Read-only record of all system and admin actions</p>
      </div>

      <div style={{ background: 'rgba(225,179,130,.12)', border: '1px solid rgba(225,179,130,.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.teal }}>
        Audit log is read-only. All actions performed by admin or the system are recorded here automatically.
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search target or detail…" style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, width: 220, outline: 'none' }} />
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as EventType | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Event Types</option>
          {(Object.entries(TYPE_CONFIG) as [EventType, { label: string; color: string }][]).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 'auto' }}>{filtered.length} events</span>
      </div>

      {/* Log */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 130px 1fr 1fr 90px', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5 }}>
          <span>Time</span><span>Event</span><span>Actor → Target</span><span>Detail</span><span>IP</span>
        </div>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No events match your filters</div>}
        {filtered.map(e => {
          const cfg = TYPE_CONFIG[e.type]
          return (
            <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '160px 130px 1fr 1fr 90px', gap: 8, padding: '11px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: C.muted, fontSize: 11 }}>{e.time}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: cfg.color, background: `${cfg.color}11`, border: `1px solid ${cfg.color}33`, borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap' }}>{cfg.label}</span>
              <div>
                <span style={{ color: C.muted }}>{e.actor}</span>
                <span style={{ color: C.muted }}> → </span>
                <span style={{ fontWeight: 700, color: '#334155' }}>{e.target}</span>
              </div>
              <span style={{ color: '#475569', fontSize: 12 }}>{e.detail}</span>
              <span style={{ color: C.muted, fontSize: 11, fontFamily: 'monospace' }}>{e.ip}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
