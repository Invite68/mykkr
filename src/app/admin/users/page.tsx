'use client'

/**
 * Admin — Users & Roles Management
 * View all users across all 4 roles, activate/deactivate/change role/ban
 */

import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

type Role = 'business' | 'customer' | 'driver' | 'admin'
type UserStatus = 'active' | 'inactive' | 'banned'

interface AdminUser {
  id: string; name: string; phone: string; role: Role; status: UserStatus
  subscribed: boolean; subPlan?: string; joinedDays: number; lastSeen: string
}

const DEMO_USERS: AdminUser[] = [
  { id: 'u001', name: 'Sharma Kirana (Business)', phone: '+91 98765 43210', role: 'business', status: 'active', subscribed: true, subPlan: '₹99/mo', joinedDays: 120, lastSeen: '2h ago' },
  { id: 'u002', name: 'Priya Sharma', phone: '+91 98100 11234', role: 'customer', status: 'active', subscribed: true, subPlan: '₹9.99/mo', joinedDays: 45, lastSeen: '1h ago' },
  { id: 'u003', name: 'Ramesh Kumar (Driver)', phone: '+91 90012 55678', role: 'driver', status: 'active', subscribed: false, joinedDays: 88, lastSeen: '30m ago' },
  { id: 'u004', name: 'Amit Verma', phone: '+91 77011 22345', role: 'customer', status: 'active', subscribed: false, joinedDays: 7, lastSeen: '10m ago' },
  { id: 'u005', name: 'Rajput Electronics', phone: '+91 98200 44321', role: 'business', status: 'inactive', subscribed: false, joinedDays: 30, lastSeen: '5d ago' },
  { id: 'u006', name: 'Sunita Devi', phone: '+91 70012 98765', role: 'customer', status: 'active', subscribed: true, subPlan: '₹9.99/mo', joinedDays: 62, lastSeen: '3h ago' },
  { id: 'u007', name: 'Suresh Yadav (Driver)', phone: '+91 88010 12345', role: 'driver', status: 'inactive', subscribed: false, joinedDays: 14, lastSeen: '2d ago' },
  { id: 'u008', name: 'Golden Bakery', phone: '+91 96543 21011', role: 'business', status: 'active', subscribed: true, subPlan: '₹99/mo', joinedDays: 55, lastSeen: '4h ago' },
  { id: 'u009', name: 'KKR Grand Banquet', phone: '+91 92222 33444', role: 'business', status: 'active', subscribed: true, subPlan: '₹99/mo', joinedDays: 95, lastSeen: '1d ago' },
  { id: 'u010', name: 'Mohan Lal', phone: '+91 87654 32100', role: 'customer', status: 'banned', subscribed: false, joinedDays: 22, lastSeen: '1w ago' },
  { id: 'u011', name: 'Ravi Singh (Driver)', phone: '+91 99123 45678', role: 'driver', status: 'active', subscribed: false, joinedDays: 33, lastSeen: '1h ago' },
  { id: 'u012', name: 'Platform Admin', phone: '+91 00000 00001', role: 'admin', status: 'active', subscribed: false, joinedDays: 365, lastSeen: 'now' },
]

const ROLE_CONFIG: Record<Role, { label: string; color: string; bg: string }> = {
  business: { label: 'Business', color: C.teal,  bg: 'rgba(18,52,59,.08)' },
  customer: { label: 'Customer', color: '#0369a1', bg: '#f0f9ff' },
  driver:   { label: 'Driver',   color: C.amber,  bg: '#fffbeb' },
  admin:    { label: 'Admin',    color: '#7c3aed', bg: '#f5f3ff' },
}
const STATUS_CONFIG: Record<UserStatus, { label: string; color: string }> = {
  active:   { label: 'Active',   color: C.green },
  inactive: { label: 'Inactive', color: C.muted },
  banned:   { label: 'Banned',   color: C.red   },
}

function RoleBadge({ role }: { role: Role }) {
  const r = ROLE_CONFIG[role]
  return <span style={{ fontSize: 11, fontWeight: 700, color: r.color, background: r.bg, borderRadius: 99, padding: '2px 8px' }}>{r.label}</span>
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ fontSize: 11, fontWeight: 600, color, background: `${color}11`, border: `1px solid ${color}44`, borderRadius: 6, padding: '4px 10px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
      {label}
    </button>
  )
}

export default function AdminUsers() {
  const [users, setUsers]     = useState<AdminUser[]>(DEMO_USERS)
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all')
  const [q, setQ]             = useState('')
  const [toast, setToast]     = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function updateStatus(id: string, status: UserStatus) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
    showToast(`User status updated to ${status}`)
  }

  function changeRole(id: string, role: Role) {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
    showToast('Role changed')
  }

  function deleteUser(id: string) {
    if (!confirm('Delete this user account? All their data will be removed.')) return
    setUsers(prev => prev.filter(u => u.id !== id))
    showToast('User deleted')
  }

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (statusFilter !== 'all' && u.status !== statusFilter) return false
    if (q && !u.name.toLowerCase().includes(q.toLowerCase()) && !u.phone.includes(q)) return false
    return true
  })

  const counts = { business: users.filter(u => u.role === 'business').length, customer: users.filter(u => u.role === 'customer').length, driver: users.filter(u => u.role === 'driver').length, admin: users.filter(u => u.role === 'admin').length }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Users & Roles</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>{users.length} total accounts</p>
      </div>

      {/* Role summary pills */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {(['all', 'business', 'customer', 'driver', 'admin'] as const).map(r => {
          const active = roleFilter === r
          const label = r === 'all' ? 'All' : ROLE_CONFIG[r].label
          const cnt = r === 'all' ? users.length : counts[r]
          return (
            <button key={r} onClick={() => setRoleFilter(r)} style={{ fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 99, cursor: 'pointer', border: active ? 'none' : `1px solid ${C.border}`, background: active ? C.teal : '#fff', color: active ? '#fff' : C.muted, transition: 'all .12s' }}>
              {label} ({cnt})
            </button>
          )
        })}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search name or phone…" style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, width: 220, outline: 'none' }} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as UserStatus | 'all')} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="banned">Banned</option>
        </select>
        <span style={{ color: C.muted, fontSize: 12, marginLeft: 'auto' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 90px 110px', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5 }}>
          <span>User</span><span>Role</span><span>Status</span><span>Joined</span><span>Actions</span>
        </div>

        {filtered.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>No users match your filters</div>}

        {filtered.map(u => (
          <div key={u.id}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 90px 110px', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
              <div>
                <button onClick={() => setExpandedId(s => s === u.id ? null : u.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{u.phone} · Last seen {u.lastSeen}</div>
                </button>
              </div>
              <RoleBadge role={u.role} />
              <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_CONFIG[u.status].color }}>{STATUS_CONFIG[u.status].label}</span>
              <span style={{ fontSize: 12, color: C.muted }}>{u.joinedDays}d ago</span>
              <div style={{ display: 'flex', gap: 5 }}>
                {u.status !== 'active' && <ActionBtn label="Activate" color={C.green} onClick={() => updateStatus(u.id, 'active')} />}
                {u.status === 'active' && u.role !== 'admin' && <ActionBtn label="Deactivate" color={C.muted} onClick={() => updateStatus(u.id, 'inactive')} />}
                {u.status !== 'banned' && u.role !== 'admin' && <ActionBtn label="Ban" color={C.red} onClick={() => updateStatus(u.id, 'banned')} />}
              </div>
            </div>

            {expandedId === u.id && (
              <div style={{ padding: '14px 20px', background: '#fafafa', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, fontWeight: 600 }}>Account Details</div>
                  <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.8 }}>
                    <div>ID: <code style={{ fontSize: 11, background: C.bg, padding: '1px 5px', borderRadius: 4 }}>{u.id}</code></div>
                    <div>Phone: <strong>{u.phone}</strong></div>
                    {u.subscribed && <div>Subscription: <strong style={{ color: C.green }}>{u.subPlan}</strong></div>}
                    {!u.subscribed && <div style={{ color: C.muted }}>No active subscription</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: '100%', marginBottom: 2 }}>Change Role</div>
                  {(['business', 'customer', 'driver'] as Role[]).filter(r => r !== u.role).map(r => (
                    <ActionBtn key={r} label={`→ ${ROLE_CONFIG[r].label}`} color={ROLE_CONFIG[r].color} onClick={() => changeRole(u.id, r)} />
                  ))}
                  {u.role !== 'admin' && <ActionBtn label="Make Admin" color="#7c3aed" onClick={() => changeRole(u.id, 'admin')} />}
                  <div style={{ width: '100%' }} />
                  {u.subscribed && <ActionBtn label="Cancel Subscription" color={C.red} onClick={() => showToast('Subscription cancelled (demo)')} />}
                  {!u.subscribed && <ActionBtn label="Grant Subscription" color={C.green} onClick={() => showToast('Subscription granted (demo)')} />}
                  <ActionBtn label="Send Notification" color={C.teal} onClick={() => showToast('Notification sent (demo)')} />
                  {u.role !== 'admin' && <ActionBtn label="Delete Account" color={C.red} onClick={() => deleteUser(u.id)} />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
