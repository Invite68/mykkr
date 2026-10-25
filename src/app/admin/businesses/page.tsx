'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface BizRow {
  id: string; business_name: string; category: string; city: string
  gstin?: string; verified_at?: string; is_active: boolean
  sub_status?: string; created_at: string; slug: string
}

export default function AdminBusinesses() {
  const [items, setItems]    = useState<BizRow[]>([])
  const [total, setTotal]    = useState(0)
  const [page, setPage]      = useState(1)
  const [verified, setVerified] = useState('')
  const [q, setQ]            = useState('')
  const [loading, setLoading]  = useState(false)
  const [msg, setMsg]        = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (verified) params.set('verified', verified)
    if (q)        params.set('q', q)
    const res  = await fetch(`/api/admin/businesses?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json() as { businesses: BizRow[]; total: number }
    setItems(json.businesses ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [page, verified, q])

  useEffect(() => { void load() }, [load])

  async function doAction(businessId: string, action: string) {
    setMsg('')
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/businesses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ businessId, action }),
    })
    const json = await res.json() as { error?: string }
    setMsg(res.ok ? 'Done' : (json.error ?? 'Error'))
    if (res.ok) void load()
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Businesses</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Search name / city…" value={q}
          onChange={e => { setQ(e.target.value); setPage(1) }} style={{ width: 220 }} />
        <select className="input" value={verified} onChange={e => { setVerified(e.target.value); setPage(1) }}>
          <option value="">All</option>
          <option value="true">Verified (GSTIN)</option>
          <option value="false">Unverified</option>
        </select>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      {msg && <p style={{ color: msg === 'Done' ? 'green' : 'red', marginBottom: 12 }}>{msg}</p>}
      <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{total} businesses</p>

      {loading ? <p>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                {['Business', 'Category', 'City', 'GSTIN', 'Subscription', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)', opacity: b.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ fontWeight: 500 }}>{b.business_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(b.created_at).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{b.category}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{b.city}</td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    {b.gstin
                      ? <span style={{ color: 'green', display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>{b.gstin}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    {b.sub_status ?? '—'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: b.is_active ? 'green' : 'red', fontWeight: 600 }}>
                      {b.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!b.verified_at && (
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => void doAction(b.id, 'verify')}>Verify</button>
                      )}
                      {b.is_active
                        ? <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => void doAction(b.id, 'suspend')}>Suspend</button>
                        : <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
                            onClick={() => void doAction(b.id, 'unsuspend')}>Unsuspend</button>
                      }
                      <a href={`/biz/${b.slug}`} target="_blank" rel="noopener noreferrer"
                        className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}>View →</a>
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
