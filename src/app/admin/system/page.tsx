'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface Settings {
  businessSubPriceInr:    number
  customerSubPriceInr:    number
  trialDays:              number
  maxPhotosPerListing:    number
  maintenanceMode:        boolean
  newRegistrationsOpen:   boolean
  driverRegistrationsOpen: boolean
}

interface Health {
  db: string; uptime: number; nodeEnv: string; version: string
}

export default function AdminSystem() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [health, setHealth]     = useState<Health | null>(null)
  const [draft, setDraft]       = useState<Partial<Settings>>({})
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')

  async function load() {
    setLoading(true)
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/system', { headers: { Authorization: `Bearer ${token}` } })
    const json  = await res.json() as { settings: Settings; health: Health }
    setSettings(json.settings)
    setHealth(json.health)
    setDraft({})
    setLoading(false)
  }

  useEffect(() => { void load() }, [])

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  async function save() {
    if (!Object.keys(draft).length) { setMsg('Nothing changed'); return }
    setMsg('')
    const auth  = getAuth(firebaseApp)
    const token = await auth.currentUser?.getIdToken()
    const res   = await fetch('/api/admin/system', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(draft),
    })
    const json = await res.json() as { settings?: Settings; error?: string }
    if (res.ok) {
      setSettings(json.settings ?? null)
      setDraft({})
      setMsg('Settings saved')
    } else {
      setMsg(json.error ?? 'Error saving')
    }
  }

  const cur = { ...(settings ?? {}), ...draft } as Settings

  if (loading) return <p>Loading…</p>
  if (!settings || !health) return <p>No data</p>

  return (
    <div style={{ maxWidth: 720 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>System Settings</h1>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      {/* Health */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>System Health</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13 }}>
          <div><strong>Database:</strong> <span style={{ color: health.db === 'ok' ? 'green' : 'red' }}>{health.db}</span></div>
          <div><strong>Environment:</strong> {health.nodeEnv}</div>
          <div><strong>Uptime:</strong> {Math.floor(health.uptime / 60)}m {Math.floor(health.uptime % 60)}s</div>
          <div><strong>Version:</strong> {health.version}</div>
        </div>
      </div>

      {/* Platform toggles */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Platform Controls</h2>

        <Toggle label="Maintenance Mode" sub="Prevents all new logins. Existing sessions unaffected."
          value={cur.maintenanceMode} onChange={v => set('maintenanceMode', v)} danger />
        <Toggle label="New Registrations Open" sub="Allow new businesses, customers, and drivers to sign up."
          value={cur.newRegistrationsOpen} onChange={v => set('newRegistrationsOpen', v)} />
        <Toggle label="Driver Registrations Open" sub="Allow new drivers to apply."
          value={cur.driverRegistrationsOpen} onChange={v => set('driverRegistrationsOpen', v)} />
      </div>

      {/* Pricing */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Subscription Pricing</h2>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
          These are display/reference values. Actual charges are controlled in Razorpay dashboard.
          Change these to reflect what Razorpay is charging.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <NumberField label="Business Plan (₹/month)" value={cur.businessSubPriceInr}
            onChange={v => set('businessSubPriceInr', v)} />
          <NumberField label="Customer Plan (₹/month)" value={cur.customerSubPriceInr}
            onChange={v => set('customerSubPriceInr', v)} step={0.01} />
          <NumberField label="Free Trial Days" value={cur.trialDays}
            onChange={v => set('trialDays', v)} min={0} max={30} />
          <NumberField label="Max Photos per Listing" value={cur.maxPhotosPerListing}
            onChange={v => set('maxPhotosPerListing', v)} min={1} max={20} />
        </div>
      </div>

      {msg && <p style={{ color: msg === 'Settings saved' ? 'green' : 'red', marginBottom: 12 }}>{msg}</p>}

      <button className="btn btn-primary" style={{ minWidth: 160 }} onClick={() => void save()}
        disabled={!Object.keys(draft).length}>
        Save Changes
      </button>
      {Object.keys(draft).length > 0 && (
        <button className="btn btn-secondary" style={{ marginLeft: 12 }}
          onClick={() => { setDraft({}); setMsg('') }}>Discard</button>
      )}
    </div>
  )
}

function Toggle({ label, sub, value, onChange, danger }: {
  label: string; sub: string; value: boolean
  onChange: (v: boolean) => void; danger?: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
      <div>
        <div style={{ fontWeight: 500, fontSize: 14, color: danger && value ? 'red' : 'var(--text)' }}>{label}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
          background: value ? (danger ? 'red' : 'var(--primary)') : 'var(--border)',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginLeft: 16,
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: value ? 25 : 3, width: 20, height: 20,
          background: '#fff', borderRadius: '50%', transition: 'left 0.2s',
        }} />
      </button>
    </div>
  )
}

function NumberField({ label, value, onChange, step = 1, min = 0, max = 999999 }: {
  label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>{label}</label>
      <input type="number" className="input" value={value} step={step} min={min} max={max}
        onChange={e => onChange(Number(e.target.value))} style={{ width: '100%' }} />
    </div>
  )
}
