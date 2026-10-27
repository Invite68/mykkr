'use client'

/**
 * Admin — Revenue Analytics
 * Monthly revenue breakdown from subscriptions
 */

import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f8fafc' }

const MONTHLY = [
  { month: 'Apr 2026', biz: 1386, cust: 89.91,  total: 1475.91 },
  { month: 'May 2026', biz: 1584, cust: 109.89,  total: 1693.89 },
  { month: 'Jun 2026', biz: 1782, cust: 129.87,  total: 1911.87 },
  { month: 'Jul 2026', biz: 2079, cust: 149.85,  total: 2228.85 },
  { month: 'Aug 2026', biz: 2277, cust: 169.83,  total: 2446.83 },
  { month: 'Sep 2026', biz: 2574, cust: 209.79,  total: 2783.79 },
  { month: 'Oct 2026', biz: 2871, cust: 219.78,  total: 3090.78 },
  { month: 'Nov 2026', biz: 3069, cust: 229.77,  total: 3298.77, projected: true },
]

const PAYMENTS = [
  { id: 'pay_001', date: '27 Oct 2026', user: 'Sharma Kirana Store',  type: 'Business', amount: 99,   status: 'success' },
  { id: 'pay_002', date: '26 Oct 2026', user: 'Priya Sharma',         type: 'Customer', amount: 9.99, status: 'success' },
  { id: 'pay_003', date: '26 Oct 2026', user: 'Golden Bakery',        type: 'Business', amount: 99,   status: 'success' },
  { id: 'pay_004', date: '25 Oct 2026', user: 'Sunita Devi',          type: 'Customer', amount: 9.99, status: 'success' },
  { id: 'pay_005', date: '25 Oct 2026', user: 'Singh Electricals',    type: 'Business', amount: 99,   status: 'success' },
  { id: 'pay_006', date: '24 Oct 2026', user: 'Rajput Electronics',   type: 'Business', amount: 99,   status: 'failed' },
  { id: 'pay_007', date: '23 Oct 2026', user: 'KKR Grand Banquet',    type: 'Business', amount: 99,   status: 'success' },
  { id: 'pay_008', date: '22 Oct 2026', user: 'Arun Kumar',           type: 'Customer', amount: 9.99, status: 'success' },
]

const maxBar = Math.max(...MONTHLY.map(m => m.total))

export default function AdminRevenue() {
  const [tab, setTab] = useState<'overview' | 'payments'>('overview')

  const thisMonth = MONTHLY[MONTHLY.length - 2]
  const lastMonth = MONTHLY[MONTHLY.length - 3]
  const growth = ((thisMonth.total - lastMonth.total) / lastMonth.total * 100).toFixed(1)
  const allTime = MONTHLY.slice(0, -1).reduce((n, m) => n + m.total, 0)

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.teal }}>Revenue</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Subscription revenue only — platform does not take commission on transactions</p>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
        <div style={{ background: C.teal, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.65)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>This Month</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>₹{thisMonth.total.toFixed(0)}</div>
          <div style={{ fontSize: 12, color: C.gold, marginTop: 3 }}>+{growth}% vs last month</div>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>All-time Revenue</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.teal, lineHeight: 1.1 }}>₹{allTime.toFixed(0)}</div>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Biz Subscriptions</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.teal, lineHeight: 1.1 }}>₹{thisMonth.biz}</div>
          <div style={{ fontSize: 12, color: C.muted }}>@₹99/mo each</div>
        </div>
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: .5 }}>Cust Subscriptions</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: C.teal, lineHeight: 1.1 }}>₹{thisMonth.cust.toFixed(0)}</div>
          <div style={{ fontSize: 12, color: C.muted }}>@₹9.99/mo each</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {(['overview', 'payments'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ fontSize: 13, fontWeight: 700, padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: tab === t ? 'none' : `1px solid ${C.border}`, background: tab === t ? C.teal : '#fff', color: tab === t ? '#fff' : C.muted }}>
            {t === 'overview' ? 'Monthly Overview' : 'Payment Log'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 16 }}>Monthly Revenue (Apr – Nov 2026)</div>

          {/* Bar chart */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 160, marginBottom: 8 }}>
            {MONTHLY.map(m => {
              const h = Math.round((m.total / maxBar) * 140)
              return (
                <div key={m.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, color: C.muted, fontWeight: 600 }}>₹{Math.round(m.total)}</div>
                  <div style={{ width: '100%', height: h, background: m.projected ? 'rgba(18,52,59,.25)' : C.teal, borderRadius: '4px 4px 0 0', position: 'relative' }}>
                    {m.projected && <div style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 8, color: C.muted, whiteSpace: 'nowrap' }}>Proj.</div>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {MONTHLY.map(m => (
              <div key={m.month} style={{ flex: 1, fontSize: 9, color: C.muted, textAlign: 'center', fontWeight: 600 }}>{m.month.split(' ')[0]}</div>
            ))}
          </div>

          {/* Table */}
          <div style={{ marginTop: 20, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5, marginBottom: 8 }}>
              <span>Month</span><span>Business</span><span>Customer</span><span>Total</span>
            </div>
            {[...MONTHLY].reverse().map(m => (
              <div key={m.month} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, padding: '8px 0', borderBottom: `1px solid ${C.border}`, fontSize: 13, color: m.projected ? C.muted : '#334155' }}>
                <span style={{ fontWeight: 600 }}>{m.month} {m.projected && <span style={{ fontSize: 10, color: C.amber }}>(proj.)</span>}</span>
                <span>₹{m.biz}</span>
                <span>₹{m.cust.toFixed(2)}</span>
                <span style={{ fontWeight: 700, color: m.projected ? C.muted : C.teal }}>₹{m.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 90px 90px', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .5 }}>
            <span>Payment ID</span><span>User</span><span>Plan</span><span>Amount</span><span>Status</span>
          </div>
          {PAYMENTS.map(p => (
            <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 100px 90px 90px', gap: 8, padding: '12px 16px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
              <code style={{ fontSize: 11, color: C.muted }}>{p.id}</code>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{p.user}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{p.date}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.type === 'Business' ? C.teal : '#0369a1' }}>{p.type}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>₹{p.amount}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: p.status === 'success' ? C.green : C.red }}>
                {p.status === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
