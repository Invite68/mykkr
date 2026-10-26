/**
 * Business Portal — Analytics
 * Brand: teal (#12343b) × gold (#e1b382) × white
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Analytics — My KKR Business Portal',
  robots: 'noindex,nofollow',
}

const C = {
  panel:   '#132b32',
  panelB:  '#1e3d47',
  card:    '#0e2028',
  gold:    '#e1b382',
  goldBg:  'rgba(225,179,130,0.10)',
  goldB:   'rgba(225,179,130,0.20)',
  text1:   '#f0f4f5',
  text2:   '#8fb3bc',
  text3:   '#4a7a88',
  teal:    '#12343b',
  tealMid: '#2d545e',
}

const MONTHLY = [
  { month: 'May', orders: 18, bookings: 4,  revenue: 9800  },
  { month: 'Jun', orders: 22, bookings: 6,  revenue: 13400 },
  { month: 'Jul', orders: 29, bookings: 5,  revenue: 16700 },
  { month: 'Aug', orders: 34, bookings: 9,  revenue: 21200 },
  { month: 'Sep', orders: 38, bookings: 7,  revenue: 23500 },
  { month: 'Oct', orders: 42, bookings: 8,  revenue: 26100 },
]

const TOP_PRODUCTS = [
  { name: 'Basmati Rice 5 kg',    orders: 34, revenue: '₹13,090' },
  { name: 'Amul Full Cream Milk', orders: 28, revenue: '₹1,736'  },
  { name: 'Grocery delivery',     orders: 22, revenue: '₹2,200'  },
  { name: 'Sugar 1 kg',           orders: 19, revenue: '₹817'    },
  { name: 'Stationery bundles',   orders: 12, revenue: '₹2,520'  },
]

const REVIEWS = [
  { customer: 'Priya M.',  rating: 5, text: 'Always fresh, fast delivery. Best kirana store in Thanesar!',  date: '22 Oct' },
  { customer: 'Sanjay K.', rating: 4, text: 'Good quality. Sometimes out of stock for branded items.',      date: '18 Oct' },
  { customer: 'Ritu S.',   rating: 5, text: 'Ramesh bhai is very helpful. Home delivery is very punctual.', date: '14 Oct' },
]

function Stars({ n }: { n: number }) {
  return (
    <span style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24"
          fill={i <= n ? C.gold : 'none'} stroke={C.gold}
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  )
}

function BarChart({ data }: { data: typeof MONTHLY }) {
  const max = Math.max(...data.map(d => d.orders + d.bookings))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 110, padding: '0 4px' }}>
      {data.map((d) => {
        const total = d.orders + d.bookings
        const hPct  = Math.round((total / max) * 100)
        return (
          <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.text2 }}>{total}</div>
            <div style={{
              width: '100%', display: 'flex', flexDirection: 'column',
              borderRadius: '4px 4px 0 0', overflow: 'hidden',
              height: `${hPct}%`, minHeight: 4,
            }}>
              <div style={{ flex: d.bookings, background: C.goldBg, borderTop: `2px solid ${C.gold}` }} />
              <div style={{ flex: d.orders,   background: `linear-gradient(180deg, ${C.tealMid} 0%, ${C.teal} 100%)` }} />
            </div>
            <div style={{ fontSize: 10, color: C.text3, fontWeight: 600 }}>{d.month}</div>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsPage() {
  const curr = MONTHLY[MONTHLY.length - 1]
  const prev = MONTHLY[MONTHLY.length - 2]
  const orderDelta = ((curr.orders - prev.orders) / prev.orders * 100).toFixed(0)

  const KPIS = [
    { label: 'Orders (Oct)',          value: String(curr.orders),                       note: `+${orderDelta}% vs Sep`, up: true  },
    { label: 'Bookings (Oct)',         value: String(curr.bookings),                     note: 'services booked',        up: true  },
    { label: 'Revenue direct to you', value: `₹${curr.revenue.toLocaleString('en-IN')}`, note: '0% commission to My KKR', up: true },
    { label: 'Profile views (Oct)',    value: '1,284',                                   note: '+18% vs Sep',            up: true  },
  ]

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: C.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Business Analytics</div>
        <h1 style={{ fontWeight: 900, fontSize: 22, color: C.text1, margin: 0, letterSpacing: -0.4 }}>Performance Overview</h1>
      </div>

      {/* KPI Grid — equal 2×2 → 4-col on wide */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 24 }}
           className="an-kpi-4">
        {KPIS.map(({ label, value, note, up }) => (
          <div key={label} style={{
            background: C.panel, borderRadius: 12, padding: '16px 18px',
            border: `1px solid ${C.panelB}`,
          }}>
            <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.text1, lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={up ? '#22c55e' : '#f87171'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {up ? <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></> : <><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></>}
              </svg>
              <span style={{ fontSize: 11, color: up ? '#4ade80' : '#f87171', fontWeight: 600 }}>{note}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`@media(min-width:600px){.an-kpi-4{grid-template-columns:repeat(4,1fr)!important}}`}</style>

      {/* Chart */}
      <div style={{ background: C.panel, borderRadius: 12, padding: '18px 20px', marginBottom: 24, border: `1px solid ${C.panelB}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Orders &amp; bookings by month</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.text3 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, background: C.tealMid, borderRadius: 2, display: 'inline-block' }} />Orders
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 10, height: 10, background: C.goldBg, border: `1px solid ${C.gold}`, borderRadius: 2, display: 'inline-block' }} />Bookings
            </span>
          </div>
        </div>
        <BarChart data={MONTHLY} />
        <div style={{ fontSize: 11, color: C.text3, marginTop: 10 }}>Sample data — connects to real orders after sign-in is wired.</div>
      </div>

      {/* Inquiry metrics */}
      <div style={{ background: C.panel, borderRadius: 12, padding: '18px 20px', marginBottom: 24, border: `1px solid ${C.panelB}` }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: C.text1, marginBottom: 14 }}>Customer inquiries (Oct)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { label: 'New inquiries',       value: '14'     },
            { label: 'Converted to orders', value: '9',  note: '64% rate' },
            { label: 'Avg response time',   value: '38m', note: 'target < 1 hr' },
          ].map(({ label, value, note }) => (
            <div key={label} style={{
              background: C.card, borderRadius: 10, padding: '14px 12px',
              border: `1px solid ${C.panelB}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.gold, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 11, color: C.text2, marginTop: 6, lineHeight: 1.4 }}>{label}</div>
              {note && <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>{note}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Top products */}
      <div style={{ background: C.panel, borderRadius: 12, overflow: 'hidden', marginBottom: 24, border: `1px solid ${C.panelB}` }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.panelB}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Top products &amp; services this month</div>
        </div>
        {TOP_PRODUCTS.map((p, i) => (
          <div key={p.name} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '13px 20px',
            borderBottom: i < TOP_PRODUCTS.length - 1 ? `1px solid ${C.panelB}` : 'none',
          }}>
            <span style={{
              width: 24, height: 24, borderRadius: 6, flexShrink: 0,
              background: C.teal, border: `1px solid ${C.tealMid}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: C.gold,
            }}>{i + 1}</span>
            <div style={{ flex: 1, fontSize: 13, color: C.text1 }}>{p.name}</div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: C.text1 }}>{p.revenue}</div>
              <div style={{ fontSize: 11, color: C.text3 }}>{p.orders} orders</div>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews */}
      <div style={{ background: C.panel, borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.panelB}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `1px solid ${C.panelB}` }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.text1 }}>Recent reviews</div>
          <span style={{ fontWeight: 900, fontSize: 16, color: C.gold }}>4.7 / 5</span>
        </div>
        {REVIEWS.map((r, i) => (
          <div key={r.customer} style={{
            padding: '14px 20px',
            borderBottom: i < REVIEWS.length - 1 ? `1px solid ${C.panelB}` : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: C.text1 }}>{r.customer}</span>
                <Stars n={r.rating} />
              </div>
              <span style={{ fontSize: 11, color: C.text3 }}>{r.date}</span>
            </div>
            <div style={{ fontSize: 12, color: C.text2, fontStyle: 'italic', lineHeight: 1.55 }}>&ldquo;{r.text}&rdquo;</div>
          </div>
        ))}
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.panelB}` }}>
          <span style={{ fontSize: 11, color: C.text3 }}>Reviews are from verified customers. They cannot be removed by the business.</span>
        </div>
      </div>
    </>
  )
}
