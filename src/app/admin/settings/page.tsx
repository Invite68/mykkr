'use client'

/**
 * Admin — Platform Settings
 * Subscription prices, fare rates, platform config, disclaimers
 */

import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

function SettingRow({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: '16px 0', borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 180 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {label && <span style={{ fontSize: 13, color: checked ? C.green : C.muted, fontWeight: 600 }}>{label}</span>}
      <button onClick={onChange} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: checked ? C.green : '#d1d5db', position: 'relative', transition: 'background .15s', flexShrink: 0 }} aria-pressed={checked}>
        <span style={{ position: 'absolute', top: 4, left: checked ? 20 : 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
      </button>
    </div>
  )
}

function NumInput({ value, onChange, prefix, suffix, min, max, step }: { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; min?: number; max?: number; step?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {prefix && <span style={{ fontSize: 13, color: C.muted, fontWeight: 700 }}>{prefix}</span>}
      <input type="number" value={value} min={min} max={max} step={step ?? 1}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: 90, border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 10px', fontSize: 14, fontWeight: 700, outline: 'none', color: C.teal }} />
      {suffix && <span style={{ fontSize: 13, color: C.muted }}>{suffix}</span>}
    </div>
  )
}

export default function AdminSettings() {
  const [bizPrice, setBizPrice]         = useState(99)
  const [custPrice, setCustPrice]       = useState(9.99)
  const [trialDays, setTrialDays]       = useState(7)
  const [baseFare, setBaseFare]         = useState(30)
  const [perKm, setPerKm]              = useState(12)
  const [platformFee, setPlatformFee]  = useState(0)
  const [newBizKyc, setNewBizKyc]      = useState(false)
  const [custSubReq, setCustSubReq]    = useState(false)
  const [maintenanceMode, setMaintenance] = useState(false)
  const [geoState, setGeoState]        = useState('Haryana')
  const [toast, setToast]              = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }
  function save() { showToast('Settings saved (demo — no backend connected)') }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Settings</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Platform-wide configuration — changes affect all users</p>
      </div>

      {/* Subscription Pricing */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 4 }}>Subscription Pricing</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Monthly subscription fees charged by the platform via Razorpay</div>

        <SettingRow label="Business subscription price" sub="Paid monthly by all businesses for unlimited listings">
          <NumInput value={bizPrice} onChange={setBizPrice} prefix="₹" suffix="/month" min={1} step={1} />
        </SettingRow>
        <SettingRow label="Customer subscription price" sub="Paid monthly for unlimited browsing and booking">
          <NumInput value={custPrice} onChange={setCustPrice} prefix="₹" suffix="/month" min={0.99} step={0.01} />
        </SettingRow>
        <SettingRow label="Customer free trial" sub="Days of free access before subscription required">
          <NumInput value={trialDays} onChange={setTrialDays} suffix="days" min={0} max={30} />
        </SettingRow>
      </div>

      {/* Fare Rates */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 4 }}>Delivery Fare Rates</div>
        <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>Used to calculate estimated delivery cost shown to customers. Actual payment is between customer and driver.</div>

        <SettingRow label="Base fare" sub="Flat charge for any delivery pickup">
          <NumInput value={baseFare} onChange={setBaseFare} prefix="₹" min={0} />
        </SettingRow>
        <SettingRow label="Per km rate" sub="Added per km of distance">
          <NumInput value={perKm} onChange={setPerKm} prefix="₹" suffix="/km" min={1} />
        </SettingRow>
        <SettingRow label="Platform commission" sub="% of delivery fare taken by platform (currently zero)">
          <NumInput value={platformFee} onChange={setPlatformFee} suffix="%" min={0} max={30} />
        </SettingRow>
      </div>

      {/* Access & Onboarding */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.teal, marginBottom: 4 }}>Access & Onboarding</div>

        <SettingRow label="KYC required for new businesses" sub="New businesses must submit Aadhaar/GSTIN before going live">
          <Toggle checked={newBizKyc} onChange={() => setNewBizKyc(v => !v)} label={newBizKyc ? 'Required' : 'Optional'} />
        </SettingRow>
        <SettingRow label="Customer subscription required" sub="Customers must subscribe to browse listings (otherwise free)">
          <Toggle checked={custSubReq} onChange={() => setCustSubReq(v => !v)} label={custSubReq ? 'Required' : 'Free browse'} />
        </SettingRow>
        <SettingRow label="Geo-restriction" sub="State the platform is currently active in">
          <select value={geoState} onChange={e => setGeoState(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 12px', fontSize: 13, background: '#fff', cursor: 'pointer', color: C.teal, fontWeight: 700 }}>
            <option>Haryana</option>
            <option>Delhi NCR</option>
            <option>Punjab</option>
            <option>Rajasthan</option>
            <option>All India</option>
          </select>
        </SettingRow>
      </div>

      {/* Danger zone */}
      <div style={{ background: '#fff', border: `1.5px solid ${C.red}22`, borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.red, marginBottom: 4 }}>Danger Zone</div>

        <SettingRow label="Maintenance mode" sub="Takes the app offline for all users. Use during deployments.">
          <Toggle checked={maintenanceMode} onChange={() => { if (!maintenanceMode && !confirm('Enable maintenance mode? All users will see an offline page.')) return; setMaintenance(v => !v) }} label={maintenanceMode ? 'Maintenance ON' : 'Live'} />
        </SettingRow>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={save} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
          Save Settings
        </button>
        <button onClick={() => showToast('Changes discarded')} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Discard
        </button>
      </div>
    </div>
  )
}
