'use client'
import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type SubTab = 'plans' | 'discounts' | 'history'
type Plan = { id: string; name: string; audience: 'business' | 'customer'; price: number; gst: number; trial: number; features: string[]; active: boolean }

const initPlans: Plan[] = [
  { id: 'p1', name: 'Business Standard', audience: 'business', price: 99, gst: 18, trial: 0, features: ['Unlimited listings', 'Full profile access', 'Orders dashboard', 'Analytics', 'In-app chat'], active: true },
  { id: 'p2', name: 'Customer Access', audience: 'customer', price: 9.99, gst: 18, trial: 7, features: ['Browse all businesses', 'Book services', 'Order goods', 'In-app chat', 'Order history'], active: true },
]

type Discount = { id: string; name: string; code: string; type: 'percent' | 'flat'; value: number; target: 'all' | 'business' | 'customer' | string; expires?: string; active: boolean; uses: number }

const initDiscounts: Discount[] = [
  { id: 'd1', name: 'Diwali Festival 2026', code: 'DIWALI26', type: 'percent', value: 20, target: 'all', expires: '05 Nov 2026', active: true, uses: 47 },
  { id: 'd2', name: 'New Business Welcome', code: 'NEWBIZ', type: 'flat', value: 50, target: 'business', expires: '31 Dec 2026', active: true, uses: 12 },
  { id: 'd3', name: 'Student Offer', code: 'STUDENT', type: 'percent', value: 50, target: 'customer', active: false, uses: 8 },
  { id: 'd4', name: 'Food Category Launch', code: 'FOOD20', type: 'percent', value: 20, target: 'Food & Beverages', expires: '30 Nov 2026', active: true, uses: 31 },
]

type HistoryRow = { date: string; action: string; by: string; detail: string }

const HISTORY: HistoryRow[] = [
  { date: '25 Oct 2026', action: 'Price change', by: 'admin@mykkr.in', detail: 'Customer plan: ₹14.99 → ₹9.99/month' },
  { date: '15 Oct 2026', action: 'Discount created', by: 'admin@mykkr.in', detail: 'Diwali26 — 20% off all plans until 5 Nov' },
  { date: '01 Oct 2026', action: 'Trial updated', by: 'admin@mykkr.in', detail: 'Customer free trial: 3 days → 7 days' },
  { date: '15 Sep 2026', action: 'Discount ended', by: 'System', detail: 'Independence Day discount IDAY76 expired' },
  { date: '01 Sep 2026', action: 'GST rate updated', by: 'admin@mykkr.in', detail: 'Platform subscription GST rate: 12% → 18%' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: checked ? C.green : '#d1d5db', position: 'relative', flexShrink: 0 }}>
    <span style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
  </button>
}

export default function AdminSubscriptions() {
  const [tab, setTab] = useState<SubTab>('plans')
  const [plans, setPlans] = useState(initPlans)
  const [discounts, setDiscounts] = useState(initDiscounts)
  const [toast, setToast] = useState('')
  const [editPlan, setEditPlan] = useState<string | null>(null)
  const [showAddDiscount, setShowAddDiscount] = useState(false)
  const [newD, setNewD] = useState({ name: '', code: '', type: 'percent' as 'percent' | 'flat', value: 10, target: 'all', expires: '' })

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function savePrice(id: string, price: number) {
    setPlans(p => p.map(x => x.id === id ? { ...x, price } : x))
    setEditPlan(null)
    showToast('Price updated')
  }

  function addDiscount() {
    if (!newD.name.trim() || !newD.code.trim()) return showToast('Name and code required')
    setDiscounts(d => [...d, { id: `d${Date.now()}`, ...newD, active: true, uses: 0, expires: newD.expires || undefined }])
    setNewD({ name: '', code: '', type: 'percent', value: 10, target: 'all', expires: '' })
    setShowAddDiscount(false)
    showToast(`Discount "${newD.name}" created`)
  }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Subscriptions &amp; Pricing</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage plans, run discounts, festive sales, and view pricing history</p>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Business Subscribers', val: 31, color: C.teal, sub: '₹3,069 MRR' },
          { label: 'Customer Subscribers', val: 124, color: '#0369a1', sub: '₹1,239 MRR' },
          { label: 'Active Discounts', val: discounts.filter(d=>d.active).length, color: C.green, sub: '' },
          { label: 'Total MRR', val: '₹4,308', color: C.green, sub: 'ex. GST' },
        ].map(t => (
          <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.color }}>{t.val}</div>
            {t.sub && <div style={{ fontSize: 11, color: C.muted }}>{t.sub}</div>}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['plans', 'discounts', 'history'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: tab===t ? 'none' : `1px solid ${C.border}`, background: tab===t ? C.teal : C.surface, color: tab===t ? '#fff' : C.muted }}>
            {t === 'plans' ? 'Plans & Pricing' : t === 'discounts' ? 'Discounts & Sales' : 'Change History'}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: plan.audience === 'business' ? 'rgba(18,52,59,.04)' : 'rgba(3,105,161,.04)' }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 15, color: C.teal }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>For {plan.audience === 'business' ? 'Business Owners' : 'Customers'}</div>
                </div>
                <Toggle checked={plan.active} onChange={() => { setPlans(p => p.map(x => x.id === plan.id ? { ...x, active: !x.active } : x)); showToast(`Plan ${plan.active ? 'deactivated' : 'activated'}`) }} />
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ marginBottom: 16 }}>
                  {editPlan === plan.id ? (
                    <EditPrice plan={plan} onSave={savePrice} onCancel={() => setEditPlan(null)} />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 34, fontWeight: 900, color: C.teal }}>₹{plan.price}</span>
                      <span style={{ fontSize: 14, color: C.muted }}>+{plan.gst}% GST / month</span>
                    </div>
                  )}
                  {plan.trial > 0 && <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>{plan.trial}-day free trial for new users</div>}
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>All payments direct via Razorpay</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 8 }}>Includes</div>
                  {plan.features.map(f => (
                    <div key={f} style={{ fontSize: 13, color: '#334155', padding: '3px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: C.green, fontSize: 14 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                {editPlan !== plan.id && <button onClick={() => setEditPlan(plan.id)} style={{ background: 'rgba(18,52,59,.07)', border: 'none', color: C.teal, borderRadius: 7, padding: '7px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Edit Pricing</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'discounts' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
            <button onClick={() => setShowAddDiscount(!showAddDiscount)} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ New Discount</button>
          </div>

          {showAddDiscount && (
            <div style={{ background: C.surface, border: `1.5px dashed ${C.teal}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1', fontSize: 13, fontWeight: 800, color: C.teal }}>Create Discount / Sale</div>
              {[{ label: 'Discount Name', key: 'name', placeholder: 'e.g. Holi Sale 2027' }, { label: 'Promo Code', key: 'code', placeholder: 'e.g. HOLI27' }].map(f => (
                <div key={f.key}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>{f.label}</div>
                  <input value={(newD as any)[f.key]} onChange={e => setNewD(n => ({ ...n, [f.key]: e.target.value }))} placeholder={f.placeholder} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Type &amp; Value</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={newD.type} onChange={e => setNewD(n => ({ ...n, type: e.target.value as any }))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', fontSize: 13, background: '#fff' }}>
                    <option value="percent">%</option>
                    <option value="flat">₹ flat</option>
                  </select>
                  <input type="number" value={newD.value} onChange={e => setNewD(n => ({ ...n, value: Number(e.target.value) }))} style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', fontSize: 13, fontWeight: 700, outline: 'none' }} />
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Applies To</div>
                <select value={newD.target} onChange={e => setNewD(n => ({ ...n, target: e.target.value }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff' }}>
                  <option value="all">All subscribers</option>
                  <option value="business">Business only</option>
                  <option value="customer">Customers only</option>
                  <option value="Food & Beverages">Category: Food &amp; Beverages</option>
                  <option value="Groceries & Daily Essentials">Category: Groceries</option>
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Expiry Date (optional)</div>
                <input type="date" value={newD.expires} onChange={e => setNewD(n => ({ ...n, expires: e.target.value }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
                <button onClick={addDiscount} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Create</button>
                <button onClick={() => setShowAddDiscount(false)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 100px 90px 80px 90px', gap: 8, padding: '9px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
              <span>Discount</span><span>Code</span><span>Value</span><span>Applies to</span><span>Expires</span><span>Uses</span><span>Active</span>
            </div>
            {discounts.map(d => (
              <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 100px 100px 90px 80px 90px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b' }}>{d.name}</div>
                <code style={{ fontSize: 12, fontWeight: 800, color: C.teal, background: 'rgba(18,52,59,.08)', borderRadius: 5, padding: '3px 7px' }}>{d.code}</code>
                <span style={{ fontWeight: 800, color: C.green, fontSize: 13 }}>{d.type === 'percent' ? `${d.value}%` : `₹${d.value}`} off</span>
                <span style={{ fontSize: 11, color: C.muted }}>{d.target === 'all' ? 'Everyone' : d.target === 'business' ? 'Business' : d.target === 'customer' ? 'Customer' : d.target}</span>
                <span style={{ fontSize: 11, color: d.expires ? C.amber : C.muted }}>{d.expires || '—'}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.teal }}>{d.uses}</span>
                <Toggle checked={d.active} onChange={() => { setDiscounts(ds => ds.map(x => x.id === d.id ? { ...x, active: !x.active } : x)); showToast(`Discount ${d.active ? 'deactivated' : 'activated'}`) }} />
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'history' && (
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '110px 140px 160px 1fr', gap: 8, padding: '9px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
            <span>Date</span><span>Action</span><span>By</span><span>Detail</span>
          </div>
          {HISTORY.map((h, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '110px 140px 160px 1fr', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', fontSize: 12 }}>
              <span style={{ color: C.muted, fontSize: 11 }}>{h.date}</span>
              <span style={{ fontWeight: 700, color: C.teal }}>{h.action}</span>
              <span style={{ color: C.muted, fontSize: 11 }}>{h.by}</span>
              <span style={{ color: '#334155' }}>{h.detail}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EditPrice({ plan, onSave, onCancel }: { plan: Plan; onSave: (id: string, p: number) => void; onCancel: () => void }) {
  const [price, setPrice] = useState(plan.price)
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: C.muted }}>₹</span>
      <input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} style={{ width: 100, border: `1.5px solid ${C.teal}`, borderRadius: 7, padding: '7px 10px', fontSize: 20, fontWeight: 900, color: C.teal, outline: 'none' }} />
      <span style={{ fontSize: 13, color: C.muted }}>+{plan.gst}% GST/month</span>
      <button onClick={() => onSave(plan.id, price)} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Save</button>
      <button onClick={onCancel} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 6, padding: '6px 10px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
    </div>
  )
}
