'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface UserRow {
  id: string; firebase_uid: string; role: string; display_name: string
  is_active: boolean; created_at: string; business_name?: string
  customer_name?: string; driver_name?: string
  sub_status?: string; sub_plan?: string
}

export default function AdminUsers() {
  const [users, setUsers]   = useState<UserRow[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [role, setRole]     = useState('')
  const [q, setQ]           = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (role) params.set('role', role)
    if (q)    params.set('q', q)
    const res  = await fetch(`/api/admin/users?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json() as { users: UserRow[]; total: number }
    setUsers(json.users ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [page, role, q])

  useEffect(() => { void load() }, [load])

  async function doAction(userId: string, action: string, newRole?: string) {
    setMsg('')
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId, action, newRole }),
    })
    const json = await res.json() as { user?: UserRow; error?: string }
    if (!res.ok) { setMsg(json.error ?? 'Error'); return }
    setMsg('✅ Done')
    void load()
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Users</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Search name…" value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }} style={{ width: 200 }} />
        <select className="input" value={role} onChange={e => { setRole(e.target.value); setPage(1) }}>
          <option value="">All roles</option>
          <option value="business">Business</option>
          <option value="customer">Customer</option>
          <option value="driver">Driver</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'red', marginBottom: 12 }}>{msg}</p>}
      <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{total} users</p>

      {loading ? <p>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                {['Name / Business', 'Role', 'Status', 'Subscription', 'Joined', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', opacity: u.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500 }}>{u.business_name ?? u.customer_name ?? u.driver_name ?? u.display_name ?? '—'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.firebase_uid.slice(0, 12)}…</div>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <RoleBadge role={u.role} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: u.is_active ? 'green' : 'red', fontWeight: 600 }}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    {u.sub_plan ? `${u.sub_plan} / ${u.sub_status}` : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {new Date(u.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {u.is_active
                        ? <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => void doAction(u.id, 'deactivate')}>Suspend</button>
                        : <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => void doAction(u.id, 'activate')}>Activate</button>
                      }
                      {u.role !== 'admin' && (
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => void doAction(u.id, 'set_role', 'admin')}>Make Admin</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={{ alignSelf: 'center', fontSize: 13 }}>Page {page} of {Math.ceil(total / 50) || 1}</span>
        <button className="btn btn-secondary" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const COLORS: Record<string, string> = {
    admin: '#7c3aed', business: '#0070f3', customer: '#059669', driver: '#d97706',
  }
  return (
    <span style={{
      background: COLORS[role] ?? '#888', color: '#fff',
      borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600,
    }}>{role}</span>
  )
}
