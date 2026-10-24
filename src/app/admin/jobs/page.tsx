'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface JobRow {
  id: string; status: string; pickup_address: string; drop_address: string
  vehicle_type: string; fare_accepted_paise?: number
  rider_name?: string; driver_name?: string; created_at: string
}

const STATUS_COLOR: Record<string, string> = {
  open: '#0070f3', accepted: 'orange', picked_up: '#7c3aed',
  completed: 'green', cancelled_by_rider: 'red', cancelled_by_driver: 'red',
}

const fmt = (p?: number) => p != null ? '₹' + (p / 100).toFixed(0) : '—'

export default function AdminJobs() {
  const [items, setItems]   = useState<JobRow[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (status) params.set('status', status)
    const res  = await fetch(`/api/admin/jobs?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json() as { jobs: JobRow[]; total: number }
    setItems(json.jobs ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [page, status])

  useEffect(() => { void load() }, [load])

  async function doAction(jobId: string, action: string) {
    setMsg('')
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ jobId, action }),
    })
    const json = await res.json() as { error?: string }
    setMsg(res.ok ? '✅ Done' : (json.error ?? 'Error'))
    if (res.ok) void load()
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Jobs / Rides</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="input" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="accepted">Accepted</option>
          <option value="picked_up">Picked up</option>
          <option value="completed">Completed</option>
          <option value="cancelled_by_rider">Cancelled (rider)</option>
          <option value="cancelled_by_driver">Cancelled (driver)</option>
        </select>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'red', marginBottom: 12 }}>{msg}</p>}
      <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{total} jobs</p>

      {loading ? <p>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                {['ID', 'Pickup → Drop', 'Vehicle', 'Fare', 'Rider', 'Driver', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--text-muted)' }}>{j.id.slice(0, 8)}…</td>
                  <td style={{ padding: '10px 12px', maxWidth: 200 }}>
                    <div style={{ fontSize: 12 }}>📍 {j.pickup_address?.slice(0, 40)}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>🏁 {j.drop_address?.slice(0, 40)}</div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{j.vehicle_type}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{fmt(j.fare_accepted_paise)}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{j.rider_name ?? '—'}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{j.driver_name ?? 'Unassigned'}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: STATUS_COLOR[j.status] ?? '#888', fontWeight: 600, fontSize: 12 }}>{j.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {j.status !== 'completed' && (
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => void doAction(j.id, 'complete')}>Complete</button>
                      )}
                      {!j.status.includes('cancel') && (
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px', color: 'red' }}
                          onClick={() => { if (confirm('Cancel this job?')) void doAction(j.id, 'cancel') }}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={{ alignSelf: 'center', fontSize: 13 }}>Page {page} of {Math.ceil(total / 50) || 1}</span>
        <button className="btn btn-secondary" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  )
}
