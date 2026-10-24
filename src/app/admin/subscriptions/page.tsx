'use client'

import { useEffect, useState, useCallback } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface SubRow {
  id: string; user_id: string; plan: string; status: string
  current_period_end?: string; trial_ends_at?: string
  razorpay_sub_id?: string; created_at: string
  business_name?: string; customer_name?: string
  total_paid_paise: number
}

const fmt = (p: number) => '₹' + (p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })

const STATUS_COLOR: Record<string, string> = {
  active: 'green', trialing: '#0070f3', past_due: 'orange', cancelled: 'red', expired: '#888',
}

export default function AdminSubscriptions() {
  const [items, setItems]   = useState<SubRow[]>([])
  const [total, setTotal]   = useState(0)
  const [revenue, setRevenue] = useState(0)
  const [page, setPage]     = useState(1)
  const [status, setStatus] = useState('')
  const [plan, setPlan]     = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')
  const [extDays, setExtDays] = useState(30)

  const load = useCallback(async () => {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const params = new URLSearchParams({ page: String(page), limit: '50' })
    if (status) params.set('status', status)
    if (plan)   params.set('plan', plan)
    const res  = await fetch(`/api/admin/subscriptions?${params}`, { headers: { Authorization: `Bearer ${token}` } })
    const json = await res.json() as { subscriptions: SubRow[]; total: number; totalRevenuePaise: number }
    setItems(json.subscriptions ?? [])
    setTotal(json.total ?? 0)
    setRevenue(json.totalRevenuePaise ?? 0)
    setLoading(false)
  }, [page, status, plan])

  useEffect(() => { void load() }, [load])

  async function doAction(subscriptionId: string, action: string, days?: number) {
    setMsg('')
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ subscriptionId, action, days }),
    })
    const json = await res.json() as { error?: string }
    setMsg(res.ok ? '✅ Done' : (json.error ?? 'Error'))
    if (res.ok) void load()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Subscriptions</h1>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 20px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Revenue Collected</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{fmt(revenue)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <select className="input" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past due</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
        <select className="input" value={plan} onChange={e => { setPlan(e.target.value); setPage(1) }}>
          <option value="">All plans</option>
          <option value="business">Business (₹99/mo)</option>
          <option value="customer">Customer (₹9.99/mo)</option>
        </select>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'red', marginBottom: 12 }}>{msg}</p>}
      <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{total} subscriptions</p>

      {loading ? <p>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                {['User', 'Plan', 'Status', 'Period End', 'Paid', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                    {s.business_name ?? s.customer_name ?? '—'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    {s.plan === 'business' ? '🏪 Business ₹99' : '👤 Customer ₹9.99'}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ color: STATUS_COLOR[s.status] ?? '#888', fontWeight: 600 }}>{s.status}</span>
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>
                    {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td style={{ padding: '10px 12px', fontSize: 12 }}>{fmt(s.total_paid_paise)}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      {s.status !== 'active' && (
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => void doAction(s.id, 'reactivate')}>Activate</button>
                      )}
                      {(s.status === 'active' || s.status === 'trialing') && (
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => void doAction(s.id, 'pause')}>Pause</button>
                      )}
                      {s.status !== 'cancelled' && (
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px', color: 'red' }}
                          onClick={() => { if (confirm('Cancel subscription?')) void doAction(s.id, 'cancel') }}>Cancel</button>
                      )}
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input type="number" value={extDays} onChange={e => setExtDays(Number(e.target.value))}
                          style={{ width: 52, padding: '4px', fontSize: 11, border: '1px solid var(--border)', borderRadius: 4 }} min={1} max={365} />
                        <button className="btn btn-secondary" style={{ fontSize: 11, padding: '4px 8px' }}
                          onClick={() => void doAction(s.id, 'extend', extDays)}>+days</button>
                      </div>
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
