'use client'

/**
 * Admin — Drivers Management
 * Approve, verify, suspend, track driver accounts
 */

import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

type DriverStatus = 'active' | 'pending' | 'suspended' | 'offline'

interface Driver {
  id: string; name: string; phone: string; vehicle: string; vehicleNo: string
  status: DriverStatus; verified: boolean; rating: number; jobs: number
  joinedDays: number; lastSeen: string; aadhaarSubmitted: boolean
}

const DEMO_DRIVERS: Driver[] = [
  { id: 'd001', name: 'Ramesh Kumar',    phone: '+91 90012 55678', vehicle: 'Car',   vehicleNo: 'HR 07 AB 1234', status: 'active',    verified: true,  rating: 4.8, jobs: 142, joinedDays: 88, lastSeen: '30m ago', aadhaarSubmitted: true },
  { id: 'd002', name: 'Suresh Yadav',    phone: '+91 88010 12345', vehicle: 'Bike',  vehicleNo: 'HR 07 CD 5678', status: 'offline',   verified: true,  rating: 4.6, jobs: 89,  joinedDays: 55, lastSeen: '2d ago',  aadhaarSubmitted: true },
  { id: 'd003', name: 'Ravi Singh',      phone: '+91 99123 45678', vehicle: 'Car',   vehicleNo: 'HR 08 EF 9012', status: 'active',    verified: true,  rating: 4.9, jobs: 201, joinedDays: 120, lastSeen: '1h ago', aadhaarSubmitted: true },
  { id: 'd004', name: 'Deepak Sharma',   phone: '+91 70011 22233', vehicle: 'Bike',  vehicleNo: 'HR 07 GH 3456', status: 'pending',   verified: false, rating: 0,   jobs: 0,   joinedDays: 3,  lastSeen: '3d ago', aadhaarSubmitted: true },
  { id: 'd005', name: 'Ajay Verma',      phone: '+91 98001 23456', vehicle: 'Auto',  vehicleNo: 'HR 07 IJ 7890', status: 'pending',   verified: false, rating: 0,   jobs: 0,   joinedDays: 1,  lastSeen: '1d ago', aadhaarSubmitted: false },
  { id: 'd006', name: 'Manoj Thakur',    phone: '+91 85501 34567', vehicle: 'Car',   vehicleNo: 'HR 09 KL 1234', status: 'suspended', verified: false, rating: 3.1, jobs: 22,  joinedDays: 42, lastSeen: '1w ago', aadhaarSubmitted: true },
  { id: 'd007', name: 'Pradeep Kumar',   phone: '+91 76601 45678', vehicle: 'Bike',  vehicleNo: 'HR 07 MN 5678', status: 'active',    verified: true,  rating: 4.7, jobs: 67,  joinedDays: 66, lastSeen: '20m ago', aadhaarSubmitted: true },
  { id: 'd008', name: 'Sanjay Gupta',    phone: '+91 99901 56789', vehicle: 'Auto',  vehicleNo: 'HR 07 OP 9012', status: 'offline',   verified: true,  rating: 4.4, jobs: 55,  joinedDays: 77, lastSeen: '3h ago', aadhaarSubmitted: true },
]

const STATUS_CONFIG: Record<DriverStatus, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: C.green, bg: '#f0fdf4' },
  pending:   { label: 'Pending',   color: C.amber, bg: '#fffbeb' },
  suspended: { label: 'Suspended', color: C.red,   bg: '#fef2f2' },
  offline:   { label: 'Offline',   color: C.muted, bg: C.bg },
}

function StatusBadge({ status }: { status: DriverStatus }) {
  const s = STATUS_CONFIG[status]
  return <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, border: `1px solid ${s.color}33`, borderRadius: 99, padding: '2px 8px' }}>{s.label}</span>
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ fontSize: 11, fontWeight: 600, color, background: `${color}11`, border: `1px solid ${color}44`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>{label}</button>
}

export default function AdminDrivers() {
  const [drivers, setDrivers]   = useState<Driver[]>(DEMO_DRIVERS)
  const [filter, setFilter]     = useState<DriverStatus | 'all'>('all')
  const [q, setQ]               = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [toast, setToast]       = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function approve(id: string) {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'active' as DriverStatus, verified: true } : d))
    showToast('Driver approved and activated')
  }
  function suspend(id: string) {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, status: 'suspended' as DriverStatus } : d))
    showToast('Driver suspended')
  }
  function deleteDriver(id: string) {
    if (!confirm('Remove this driver account?')) return
    setDrivers(prev => prev.filter(d => d.id !== id))
    showToast('Driver removed')
  }

  const filtered = drivers.filter(d => {
    if (filter !== 'all' && d.status !== filter) return false
    if (q && !d.name.toLowerCase().includes(q.toLowerCase()) && !d.vehicleNo.toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  const counts = { active: drivers.filter(d => d.status === 'active').length, pending: drivers.filter(d => d.status === 'pending').length, suspended: drivers.filter(d => d.status === 'suspended').length }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Drivers</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>{drivers.length} total · {counts.active} active · {counts.pending} pending approval</p>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 12, marginBottom: 20 }}>
        {([
          { label: 'Active',   value: counts.active,    color: C.green, f: 'active' as DriverStatus },
          { label: 'Pending',  value: counts.pending,   color: C.amber, f: 'pending' as DriverStatus },
          { label: 'Suspended',value: counts.suspended, color: C.red,   f: 'suspended' as DriverStatus },
          { label: 'Total',    value: drivers.length,   color: C.teal,  f: 'all' as DriverStatus | 'all' },
        ] as { label: string; value: number; color: string; f: DriverStatus | 'all' }[]).map(({ label, value, color, f }) => (
          <button key={label} onClick={() => setFilter(f)} style={{ background: '#fff', border: `1px solid ${filter === f ? color : C.border}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', textAlign: 'left' }}>
            <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1.1 }}>{value}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or vehicle no…" style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, width: 220, outline: 'none' }} />
        <select value={filter} onChange={e => setFilter(e.target.value as DriverStatus | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="offline">Offline</option>
          <option value="suspended">Suspended</option>
        </select>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 70px 80px 90px 140px', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5 }}>
          <span>Driver</span><span>Vehicle</span><span>Status</span><span>Rating</span><span>Jobs</span><span>Verified</span><span>Actions</span>
        </div>
        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No drivers match your filters</div>}
        {filtered.map(d => (
          <div key={d.id}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 80px 70px 80px 90px 140px', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
              <div>
                <button onClick={() => setExpandedId(s => s === d.id ? null : d.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.phone} · {d.vehicleNo}</div>
                </button>
              </div>
              <span style={{ fontSize: 12, color: '#334155', fontWeight: 600 }}>{d.vehicle}</span>
              <StatusBadge status={d.status} />
              <span style={{ fontSize: 13, color: d.rating >= 4.5 ? C.green : d.rating >= 3 ? C.amber : d.rating === 0 ? C.muted : C.red, fontWeight: 700 }}>
                {d.rating === 0 ? '—' : d.rating.toFixed(1)}
              </span>
              <span style={{ fontSize: 13, color: '#334155' }}>{d.jobs}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: d.verified ? C.green : C.amber }}>
                {d.verified ? 'Verified' : d.aadhaarSubmitted ? 'Pending' : 'No docs'}
              </span>
              <div style={{ display: 'flex', gap: 5 }}>
                {d.status === 'pending' && <ActionBtn label="Approve" color={C.green} onClick={() => approve(d.id)} />}
                {(d.status === 'active' || d.status === 'offline') && <ActionBtn label="Suspend" color={C.red} onClick={() => suspend(d.id)} />}
                {d.status === 'suspended' && <ActionBtn label="Activate" color={C.green} onClick={() => approve(d.id)} />}
              </div>
            </div>

            {expandedId === d.id && (
              <div style={{ padding: '12px 20px', background: '#fafafa', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, marginBottom: 6 }}>Driver Details</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.8 }}>
                    <div>ID: <code style={{ fontSize: 10 }}>{d.id}</code></div>
                    <div>Joined: <strong>{d.joinedDays} days ago</strong></div>
                    <div>Last seen: <strong>{d.lastSeen}</strong></div>
                    <div>Aadhaar: <strong style={{ color: d.aadhaarSubmitted ? C.green : C.red }}>{d.aadhaarSubmitted ? 'Submitted' : 'Not submitted'}</strong></div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingTop: 20 }}>
                  <ActionBtn label="Send Message" color={C.teal} onClick={() => showToast('Message sent (demo)')} />
                  <ActionBtn label="View Jobs History" color={C.teal} onClick={() => showToast('Jobs history (demo)')} />
                  <ActionBtn label="Delete Account" color={C.red} onClick={() => deleteDriver(d.id)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
