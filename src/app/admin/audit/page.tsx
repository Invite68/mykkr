'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface AuditRow {
  id: number; actor_uid: string; actor_name?: string; actor_role: string
  action: string; target_type?: string; target_id?: string
  old_value?: string; new_value?: string; ip_address?: string; created_at: string
}

export default function AdminAudit() {
  const [logs, setLogs]     = useState<AuditRow[]>([])
  const [total, setTotal]   = useState(0)
  const [page, setPage]     = useState(1)
  const [action, setAction] = useState('')
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const params = new URLSearchParams({ page: String(page), limit: '100' })
    if (action) params.set('action', action)
    const res  = await fetch(`/api/admin/audit?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json() as { logs: AuditRow[]; total: number }
    setLogs(json.logs ?? [])
    setTotal(json.total ?? 0)
    setLoading(false)
  }, [page, action])

  useEffect(() => { void load() }, [load])

  return (
    <div>
      <h1 style={{ marginBottom: 8 }}>Audit Log</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 13 }}>
        All admin actions are recorded here. Append-only — cannot be edited or deleted.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="input" placeholder="Filter by action…" value={action}
          onChange={e => { setAction(e.target.value); setPage(1) }} style={{ width: 220 }} />
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{total} log entries</p>

      {loading ? <p>Loading…</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map(l => (
            <div key={l.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
              padding: '12px 16px', cursor: 'pointer',
            }} onClick={() => setExpanded(expanded === l.id ? null : l.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{l.action}</span>
                  {l.target_type && (
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.target_type}: {l.target_id?.slice(0, 12)}</span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {l.actor_name ?? l.actor_uid.slice(0, 12)}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {new Date(l.created_at).toLocaleString('en-IN')}
                </span>
              </div>
              {expanded === l.id && (
                <div style={{ marginTop: 12, fontSize: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {l.ip_address && <div><strong>IP:</strong> {l.ip_address}</div>}
                  {l.old_value && (
                    <div>
                      <strong>Before:</strong>
                      <pre style={{ margin: '4px 0 0', padding: 8, background: 'var(--bg)', borderRadius: 4, fontSize: 11, overflowX: 'auto' }}>
                        {JSON.stringify(JSON.parse(l.old_value), null, 2)}
                      </pre>
                    </div>
                  )}
                  {l.new_value && (
                    <div>
                      <strong>After:</strong>
                      <pre style={{ margin: '4px 0 0', padding: 8, background: 'var(--bg)', borderRadius: 4, fontSize: 11, overflowX: 'auto' }}>
                        {JSON.stringify(JSON.parse(l.new_value), null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={{ alignSelf: 'center', fontSize: 13 }}>Page {page} of {Math.ceil(total / 100) || 1}</span>
        <button className="btn btn-secondary" disabled={page * 100 >= total} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  )
}
