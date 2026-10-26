/**
 * Business Portal — Analytics
 * Job history, performance, customer demographics, revenue tracking.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics — My KKR Business Portal',
  robots: 'noindex,nofollow',
}

// ── Sample data ───────────────────────────────────────────────────────────────

const MONTHLY = [
  { month: 'May',  orders: 18, bookings: 4, revenue: 9800  },
  { month: 'Jun',  orders: 22, bookings: 6, revenue: 13400 },
  { month: 'Jul',  orders: 29, bookings: 5, revenue: 16700 },
  { month: 'Aug',  orders: 34, bookings: 9, revenue: 21200 },
  { month: 'Sep',  orders: 38, bookings: 7, revenue: 23500 },
  { month: 'Oct',  orders: 42, bookings: 8, revenue: 26100 },
]

const TOP_PRODUCTS = [
  { name: 'Basmati Rice 5 kg',   orders: 34, revenue: '₹13,090' },
  { name: 'Amul Full Cream Milk',orders: 28, revenue: '₹1,736'  },
  { name: 'Grocery delivery',    orders: 22, revenue: '₹2,200'  },
  { name: 'Sugar 1 kg',          orders: 19, revenue: '₹817'    },
  { name: 'Stationery bundles',  orders: 12, revenue: '₹2,520'  },
]

const REVIEWS = [
  { customer: 'Priya M.', rating: 5, text: 'Always fresh, fast delivery. Best kirana store in Thanesar!',  date: '22 Oct' },
  { customer: 'Sanjay K.', rating: 4, text: 'Good quality. Sometimes out of stock for branded items.',      date: '18 Oct' },
  { customer: 'Ritu S.',  rating: 5, text: 'Ramesh bhai is very helpful. Home delivery is very punctual.', date: '14 Oct' },
]

// ── Tiny bar chart (pure CSS/HTML, no emoji) ──────────────────────────────────

function BarChart({ data }: { data: typeof MONTHLY }) {
  const max = Math.max(...data.map(d => d.orders + d.bookings))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120, marginTop: 10 }}>
      {data.map((d) => {
        const total = d.orders + d.bookings
        const h = Math.round((total / max) * 100)
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>{total}</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', borderRadius: 4, overflow: 'hidden', height: `${h}%` }}>
              <div style={{ flex: d.bookings, background: '#7c3aed60' }} />
              <div style={{ flex: d.orders,   background: '#f97316' }} />
            </div>
            <div style={{ fontSize: 10, color: '#475569' }}>{d.month}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const thisMonth = MONTHLY[MONTHLY.length - 1]
  const lastMonth = MONTHLY[MONTHLY.length - 2]
  const orderDelta = ((thisMonth.orders - lastMonth.orders) / lastMonth.orders * 100).toFixed(0)

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>Business Analytics</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: '#f1f5f9', margin: 0 }}>Performance Overview</h1>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total orders (Oct)',    value: String(thisMonth.orders), sub: `+${orderDelta}% vs Sep`, up: true   },
          { label: 'Bookings (Oct)',         value: String(thisMonth.bookings),sub: 'services booked',       up: true   },
          { label: 'Total revenue to you',  value: `₹${thisMonth.revenue.toLocaleString('en-IN')}`, sub: 'Oct · 0% to My KKR', up: true },
          { label: 'Profile views (Oct)',    value: '1,284',                  sub: '+18% vs Sep',           up: true   },
        ].map(({ label, value, sub, up }) => (
          <div key={label} style={{ background: '#1a2535', borderRadius: 10, padding: '14px 12px', border: '1.5px solid #1e3a50' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 4 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={up ? '#16a34a' : '#dc2626'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {up ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>}
              </svg>
              <span style={{ fontSize: 11, color: up ? '#4ade80' : '#f87171', fontWeight: 700 }}>{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Orders & bookings chart */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e3a50' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Orders &amp; bookings by month</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: '#f97316', borderRadius: 2, display: 'inline-block' }} />Orders
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, background: '#7c3aed60', borderRadius: 2, display: 'inline-block' }} />Bookings
            </span>
          </div>
        </div>
        <BarChart data={MONTHLY} />
        <div style={{ fontSize: 11, color: '#334155', marginTop: 10 }}>Sample data — connects to real orders after sign-in is wired.</div>
      </div>

      {/* Top products */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e3a50' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>Top products &amp; services this month</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {TOP_PRODUCTS.map((p, i) => (
            <div key={p.name} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '9px 10px', borderRadius: 8,
              borderBottom: i < TOP_PRODUCTS.length - 1 ? '1px solid #1e2d3a' : 'none',
            }}>
              <span style={{ width: 22, height: 22, borderRadius: 6, background: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#f97316', flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, fontSize: 13, color: '#e2e8f0' }}>{p.name}</div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#f1f5f9' }}>{p.revenue}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{p.orders} orders</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements / inquiries breakdown */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, marginBottom: 20, border: '1.5px solid #1e3a50' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0', marginBottom: 12 }}>Customer requirements &amp; inquiries (Oct)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'New inquiries received', value: '14' },
            { label: 'Converted to orders',    value: '9', note: '64% conversion' },
            { label: 'Avg. response time',     value: '38 min', note: 'target: under 1 hr' },
          ].map(({ label, value, note }) => (
            <div key={label} style={{ background: '#111827', borderRadius: 8, padding: '12px 10px', border: '1px solid #1e3a50', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f97316' }}>{value}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{label}</div>
              {note && <div style={{ fontSize: 10, color: '#475569', marginTop: 2 }}>{note}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Customer reviews */}
      <div style={{ background: '#1a2535', borderRadius: 12, padding: 16, border: '1.5px solid #1e3a50' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#e2e8f0' }}>Recent reviews</div>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#f97316' }}>4.7</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {REVIEWS.map((r) => (
            <div key={r.customer} style={{ padding: '10px 12px', background: '#111827', borderRadius: 8, border: '1px solid #1e3a50' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0' }}>{r.customer}</span>
                  <span style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
                    {[1,2,3,4,5].map(n => (
                      <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={n <= r.rating ? '#f97316' : 'none'} stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    ))}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#475569' }}>{r.date}</span>
              </div>
              <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>&ldquo;{r.text}&rdquo;</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: '#334155', marginTop: 10 }}>
          Reviews are from verified customers who placed real orders. They cannot be removed by the business.
        </div>
      </div>
    </>
  )
}
