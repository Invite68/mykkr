'use client'
import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type VehicleType = { id: string; name: string; icon: string; baseFare: number; perKm: number; loadBased: boolean; active: boolean; category: string }
type FixedRoute = { id: string; from: string; to: string; vehicle: string; price: number; active: boolean }
type FareHistory = { date: string; change: string; by: string; old: string; new_: string }

const initVehicles: VehicleType[] = [
  { id: 'v1', name: 'Auto Rickshaw', icon: 'auto', baseFare: 20, perKm: 8, loadBased: false, active: true, category: 'Passenger' },
  { id: 'v2', name: 'Cab / Sedan', icon: 'car', baseFare: 30, perKm: 12, loadBased: false, active: true, category: 'Passenger' },
  { id: 'v3', name: 'SUV / XL', icon: 'suv', baseFare: 45, perKm: 16, loadBased: false, active: true, category: 'Passenger' },
  { id: 'v4', name: 'Bike / 2-Wheeler', icon: 'bike', baseFare: 15, perKm: 6, loadBased: false, active: true, category: 'Delivery' },
  { id: 'v5', name: 'Mini Truck (500kg)', icon: 'truck', baseFare: 80, perKm: 18, loadBased: true, active: true, category: 'Goods' },
  { id: 'v6', name: 'Tempo (1 ton)', icon: 'tempo', baseFare: 120, perKm: 22, loadBased: true, active: true, category: 'Goods' },
  { id: 'v7', name: 'E-Rickshaw', icon: 'e-ric', baseFare: 15, perKm: 5, loadBased: false, active: false, category: 'Passenger' },
]

const initFixed: FixedRoute[] = [
  { id: 'f1', from: 'KKR Bus Stand', to: 'Brahma Sarovar', vehicle: 'Auto Rickshaw', price: 50, active: true },
  { id: 'f2', from: 'KKR Railway Station', to: 'Kurukshetra University', vehicle: 'Cab / Sedan', price: 120, active: true },
  { id: 'f3', from: 'KKR Bus Stand', to: 'Pipli', vehicle: 'Cab / Sedan', price: 200, active: false },
]

const HISTORY: FareHistory[] = [
  { date: '25 Oct 2026', change: 'Cab per km rate', by: 'admin@mykkr.in', old: '₹11/km', new_: '₹12/km' },
  { date: '10 Oct 2026', change: 'Mini Truck base fare', by: 'admin@mykkr.in', old: '₹70', new_: '₹80' },
  { date: '01 Sep 2026', change: 'New vehicle: E-Rickshaw added', by: 'admin@mykkr.in', old: '–', new_: 'Base ₹15, ₹5/km' },
]

function NumInp({ value, onChange, prefix, suffix }: { value: number; onChange: (v: number) => void; prefix?: string; suffix?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      {prefix && <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>{prefix}</span>}
      <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} style={{ width: 80, border: `1px solid ${C.border}`, borderRadius: 6, padding: '5px 8px', fontSize: 13, fontWeight: 700, outline: 'none', color: C.teal }} />
      {suffix && <span style={{ fontSize: 12, color: C.muted }}>{suffix}</span>}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: checked ? C.green : '#d1d5db', position: 'relative', transition: 'background .15s', flexShrink: 0 }}>
    <span style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
  </button>
}

export default function AdminFares() {
  const [tab, setTab] = useState<'vehicles' | 'fixed' | 'history'>('vehicles')
  const [vehicles, setVehicles] = useState(initVehicles)
  const [fixed, setFixed] = useState(initFixed)
  const [toast, setToast] = useState('')
  const [editingV, setEditingV] = useState<string | null>(null)
  const [showAddV, setShowAddV] = useState(false)
  const [newV, setNewV] = useState({ name: '', baseFare: 30, perKm: 10, category: 'Passenger' })
  const [showAddF, setShowAddF] = useState(false)
  const [newF, setNewF] = useState({ from: '', to: '', vehicle: 'Cab / Sedan', price: 100 })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function updateV(id: string, patch: Partial<VehicleType>) {
    setVehicles(v => v.map(x => x.id === id ? { ...x, ...patch } : x))
  }

  function addVehicle() {
    if (!newV.name.trim()) return showToast('Vehicle name required')
    setVehicles(v => [...v, { id: `v${Date.now()}`, icon: 'car', loadBased: false, active: true, ...newV }])
    setNewV({ name: '', baseFare: 30, perKm: 10, category: 'Passenger' })
    setShowAddV(false)
    showToast(`Vehicle "${newV.name}" added`)
  }

  function removeV(id: string) {
    if (!confirm('Remove this vehicle type?')) return
    setVehicles(v => v.filter(x => x.id !== id))
    showToast('Vehicle removed')
  }

  function addFixed() {
    if (!newF.from.trim() || !newF.to.trim()) return showToast('Fill both locations')
    setFixed(f => [...f, { id: `f${Date.now()}`, active: true, ...newF }])
    setNewF({ from: '', to: '', vehicle: 'Cab / Sedan', price: 100 })
    setShowAddF(false)
    showToast('Fixed route added')
  }

  const cats = ['Passenger', 'Delivery', 'Goods']

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Fares &amp; Pricing</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage vehicle types, per-km rates and fixed point-to-point fares</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['vehicles', 'fixed', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: tab===t ? 'none' : `1px solid ${C.border}`, background: tab===t ? C.teal : C.surface, color: tab===t ? '#fff' : C.muted }}>
            {t === 'vehicles' ? 'Vehicle Types & Rates' : t === 'fixed' ? 'Fixed Routes' : 'Change History'}
          </button>
        ))}
      </div>

      {tab === 'vehicles' && (
        <div>
          {cats.map(cat => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.teal, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 10 }}>{cat}</div>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 120px 110px 80px 100px', gap: 8, padding: '9px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
                  <span>Vehicle</span><span>Base Fare</span><span>Per KM Rate</span><span>Load Based</span><span>Active</span><span>Actions</span>
                </div>
                {vehicles.filter(v => v.category === cat).map(v => (
                  <div key={v.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 120px 110px 80px 100px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: C.teal }}>{v.name}</div>
                    {editingV === v.id ? (
                      <>
                        <NumInp value={v.baseFare} onChange={val => updateV(v.id, { baseFare: val })} prefix="₹" />
                        <NumInp value={v.perKm} onChange={val => updateV(v.id, { perKm: val })} prefix="₹" suffix="/km" />
                        <Toggle checked={v.loadBased} onChange={() => updateV(v.id, { loadBased: !v.loadBased })} />
                        <Toggle checked={v.active} onChange={() => updateV(v.id, { active: !v.active })} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => { setEditingV(null); showToast('Fare saved') }} style={{ background: C.green, border: 'none', color: '#fff', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Save</button>
                          <button onClick={() => setEditingV(null)} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted, padding: '5px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>₹{v.baseFare}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>₹{v.perKm}/km</span>
                        <span style={{ fontSize: 12, color: v.loadBased ? C.green : C.muted }}>{v.loadBased ? 'Yes' : 'No'}</span>
                        <Toggle checked={v.active} onChange={() => { updateV(v.id, { active: !v.active }); showToast(v.active ? 'Vehicle deactivated' : 'Vehicle activated') }} />
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setEditingV(v.id)} style={{ background: 'rgba(18,52,59,.07)', border: 'none', color: C.teal, padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                          <button onClick={() => removeV(v.id)} style={{ background: 'rgba(220,38,38,.08)', border: 'none', color: C.red, padding: '5px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Remove</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {showAddV ? (
            <div style={{ background: C.surface, border: `1.5px dashed ${C.teal}`, borderRadius: 12, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Name</div>
                <input value={newV.name} onChange={e => setNewV(n => ({ ...n, name: e.target.value }))} placeholder="e.g. Cargo Bike" style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', width: 160 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Base Fare (₹)</div>
                <input type="number" value={newV.baseFare} onChange={e => setNewV(n => ({ ...n, baseFare: Number(e.target.value) }))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', width: 90 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Per KM (₹)</div>
                <input type="number" value={newV.perKm} onChange={e => setNewV(n => ({ ...n, perKm: Number(e.target.value) }))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', width: 90 }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Category</div>
                <select value={newV.category} onChange={e => setNewV(n => ({ ...n, category: e.target.value }))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={addVehicle} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add Vehicle</button>
              <button onClick={() => setShowAddV(false)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowAddV(true)} style={{ marginTop: 8, background: 'rgba(18,52,59,.06)', border: `1.5px dashed ${C.teal}`, color: C.teal, borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%' }}>+ Add New Vehicle Type</button>
          )}
        </div>
      )}

      {tab === 'fixed' && (
        <div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 100px 80px 80px', gap: 8, padding: '10px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
              <span>From</span><span>To</span><span>Vehicle</span><span>Fixed Price</span><span>Active</span><span>Remove</span>
            </div>
            {fixed.map(f => (
              <div key={f.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 140px 100px 80px 80px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{f.from}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#334155' }}>{f.to}</span>
                <span style={{ fontSize: 12, color: C.muted }}>{f.vehicle}</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: C.teal }}>₹{f.price}</span>
                <Toggle checked={f.active} onChange={() => { setFixed(fx => fx.map(x => x.id === f.id ? { ...x, active: !x.active } : x)); showToast(f.active ? 'Route deactivated' : 'Route activated') }} />
                <button onClick={() => { if (!confirm('Remove this fixed route?')) return; setFixed(fx => fx.filter(x => x.id !== f.id)); showToast('Route removed') }} style={{ background: 'rgba(220,38,38,.08)', border: 'none', color: C.red, padding: '5px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
              </div>
            ))}
          </div>

          {showAddF ? (
            <div style={{ background: C.surface, border: `1.5px dashed ${C.teal}`, borderRadius: 12, padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {[{ label: 'From location', key: 'from', placeholder: 'e.g. KKR Bus Stand' }, { label: 'To location', key: 'to', placeholder: 'e.g. Pehowa' }].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{f.label}</div>
                  <input value={(newF as any)[f.key]} onChange={e => setNewF(n => ({ ...n, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', width: 180 }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Vehicle</div>
                <select value={newF.vehicle} onChange={e => setNewF(n => ({ ...n, vehicle: e.target.value }))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
                  {vehicles.filter(v => v.active).map(v => <option key={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Fixed Price (₹)</div>
                <input type="number" value={newF.price} onChange={e => setNewF(n => ({ ...n, price: Number(e.target.value) }))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', width: 90 }} />
              </div>
              <button onClick={addFixed} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add Route</button>
              <button onClick={() => setShowAddF(false)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowAddF(true)} style={{ background: 'rgba(18,52,59,.06)', border: `1.5px dashed ${C.teal}`, color: C.teal, borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', width: '100%' }}>+ Add Fixed Route</button>
          )}
        </div>
      )}

      {tab === 'history' && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: C.muted, background: 'rgba(225,179,130,.1)', borderLeft: `4px solid ${C.gold}` }}>
            Change history is read-only. All fare edits are recorded automatically.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 160px 100px 100px', gap: 8, padding: '10px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
            <span>Date</span><span>Change</span><span>By</span><span>Old Value</span><span>New Value</span>
          </div>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 160px 100px 100px', gap: 8, padding: '12px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', fontSize: 13 }}>
              <span style={{ fontSize: 11, color: C.muted }}>{h.date}</span>
              <span style={{ fontWeight: 600, color: '#334155' }}>{h.change}</span>
              <span style={{ fontSize: 11, color: C.muted }}>{h.by}</span>
              <span style={{ color: C.red, textDecoration: 'line-through', fontSize: 12 }}>{h.old}</span>
              <span style={{ color: C.green, fontWeight: 700, fontSize: 12 }}>{h.new_}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
