'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface FareRate {
  id: number; vehicle_type: string; mode: string
  base_fare_paise: number; per_km_paise: number
  per_min_paise: number; surge_multiplier_x100: number
  is_active: boolean; updated_at: string
}

export default function AdminFareRates() {
  const [rates, setRates]   = useState<FareRate[]>([])
  const [editing, setEditing] = useState<Record<number, Partial<FareRate>>>({})
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]       = useState('')

  async function load() {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/fare-rates', { headers: { Authorization: `Bearer ${token}` } })
    const json  = await res.json() as { fareRates: FareRate[] }
    setRates(json.fareRates ?? [])
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  function edit(id: number, field: string, value: unknown) {
    setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function save(rate: FareRate) {
    setMsg('')
    const changes = editing[rate.id] ?? {}
    if (!Object.keys(changes).length) return
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/fare-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: rate.id, ...changes }),
    })
    const json = await res.json() as { error?: string }
    setMsg(res.ok ? '✅ Saved' : (json.error ?? 'Error'))
    if (res.ok) { setEditing(prev => { const n = { ...prev }; delete n[rate.id]; return n }); void load() }
  }

  const val = (rate: FareRate, field: keyof FareRate) =>
    (editing[rate.id]?.[field] ?? rate[field]) as number

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0 }}>Fare Rates</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4, fontSize: 13 }}>
            Server-side rates — customers cannot manipulate these. All values in paise (₹1 = 100 paise).
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      {msg && <p style={{ color: msg.startsWith('✅') ? 'green' : 'red', marginBottom: 16 }}>{msg}</p>}

      {loading ? <p>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                {['Vehicle', 'Mode', 'Base Fare (paise)', 'Per KM (paise)', 'Per Min (paise)', 'Surge ×100', 'Active', 'Save'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rates.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)', opacity: r.is_active ? 1 : 0.5 }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600 }}>{r.vehicle_type}</td>
                  <td style={{ padding: '10px 12px' }}>{r.mode}</td>
                  {(['base_fare_paise', 'per_km_paise', 'per_min_paise', 'surge_multiplier_x100'] as const).map(field => (
                    <td key={field} style={{ padding: '8px 12px' }}>
                      <input type="number" min={0} value={val(r, field)}
                        onChange={e => edit(r.id, field, Number(e.target.value))}
                        style={{ width: 80, padding: '4px 8px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 13 }} />
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        ₹{(val(r, field) / 100).toFixed(2)}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={!!(editing[r.id]?.is_active ?? r.is_active)}
                      onChange={e => edit(r.id, 'is_active', e.target.checked)} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 12px' }}
                      disabled={!editing[r.id] || !Object.keys(editing[r.id] ?? {}).length}
                      onClick={() => void save(r)}>Save</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 24, padding: 16, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
        <strong>How fares work:</strong> When a customer requests a ride, the client estimates a fare.
        The server recalculates using these rates and validates the client fare within ±20%.
        If the client fare is manipulated, the server rejects it. Driver and customer see the server-validated fare only.
      </div>
    </div>
  )
}
