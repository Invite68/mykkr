'use client'
import { useState, useMemo } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff', purple: '#7c3aed' }

type DStatus = 'active' | 'pending' | 'suspended' | 'offline'
type Vehicle = 'bike' | 'car' | 'auto' | 'truck' | 'tempo'

type Driver = {
  id: string; name: string; phone: string; vehicle: Vehicle; vehicleNo: string
  status: DStatus; kyc: 'verified' | 'pending'; rating: number; deliveries: number
  earnings: number; joined: string; area: string
}

type Job = {
  id: string; driver: string; pickup: string; dropoff: string; status: 'active' | 'completed' | 'cancelled'
  amount: number; distance: string; time: string; type: 'goods' | 'service' | 'taxi'
}

const DRIVERS: Driver[] = [
  { id: 'D001', name: 'Ramesh Kumar', phone: '98765-43210', vehicle: 'bike', vehicleNo: 'HR38-AB1234', status: 'active', kyc: 'verified', rating: 4.8, deliveries: 234, earnings: 18600, joined: '10 Jan 2026', area: 'KKR City' },
  { id: 'D002', name: 'Suresh Yadav', phone: '87654-32109', vehicle: 'car', vehicleNo: 'HR38-CD5678', status: 'active', kyc: 'verified', rating: 4.6, deliveries: 178, earnings: 24200, joined: '15 Feb 2026', area: 'Thanesar' },
  { id: 'D003', name: 'Mohan Singh', phone: '76543-21098', vehicle: 'auto', vehicleNo: 'HR38-EF9012', status: 'offline', kyc: 'verified', rating: 4.2, deliveries: 89, earnings: 9800, joined: '20 Mar 2026', area: 'Pipli' },
  { id: 'D004', name: 'Vijay Sharma', phone: '65432-10987', vehicle: 'truck', vehicleNo: 'HR38-GH3456', status: 'pending', kyc: 'pending', rating: 0, deliveries: 0, earnings: 0, joined: '22 Oct 2026', area: 'KKR City' },
  { id: 'D005', name: 'Rakesh Verma', phone: '54321-09876', vehicle: 'tempo', vehicleNo: 'HR38-IJ7890', status: 'active', kyc: 'verified', rating: 4.9, deliveries: 312, earnings: 41800, joined: '05 Dec 2025', area: 'KKR City' },
  { id: 'D006', name: 'Deepak Rawat', phone: '43210-98765', vehicle: 'bike', vehicleNo: 'HR38-KL2345', status: 'suspended', kyc: 'verified', rating: 3.1, deliveries: 45, earnings: 3200, joined: '01 Apr 2026', area: 'Shahabad' },
  { id: 'D007', name: 'Anil Chauhan', phone: '32109-87654', vehicle: 'car', vehicleNo: 'HR38-MN6789', status: 'pending', kyc: 'pending', rating: 0, deliveries: 0, earnings: 0, joined: '25 Oct 2026', area: 'Ladwa' },
  { id: 'D008', name: 'Prem Gupta', phone: '21098-76543', vehicle: 'bike', vehicleNo: 'HR38-OP1234', status: 'active', kyc: 'verified', rating: 4.5, deliveries: 156, earnings: 13400, joined: '14 Jun 2026', area: 'KKR City' },
  { id: 'D009', name: 'Harish Nain', phone: '10987-65432', vehicle: 'car', vehicleNo: 'HR38-QR5678', status: 'active', kyc: 'verified', rating: 4.7, deliveries: 203, earnings: 27600, joined: '10 Aug 2026', area: 'Pehowa' },
]

const JOBS: Job[] = [
  { id: 'J-2047', driver: 'Ramesh Kumar', pickup: 'Sharma Kirana - KKR City', dropoff: '22 Brahma Colony', status: 'active', amount: 45, distance: '3.2 km', time: '12 min ago', type: 'goods' },
  { id: 'J-2046', driver: 'Prem Gupta', pickup: 'Sunrise Bakery', dropoff: '14 Model Town', status: 'active', amount: 30, distance: '2.1 km', time: '18 min ago', type: 'goods' },
  { id: 'J-2045', driver: 'Suresh Yadav', pickup: 'KKR Bus Stand', dropoff: 'KUK Gate No. 3', status: 'active', amount: 120, distance: '8.4 km', time: '25 min ago', type: 'taxi' },
  { id: 'J-2044', driver: 'Rakesh Verma', pickup: 'City Hardware Store', dropoff: 'Sector 7, KKR', status: 'completed', amount: 280, distance: '5.6 km', time: '1 hr ago', type: 'goods' },
  { id: 'J-2043', driver: 'Harish Nain', pickup: 'KKR Railway Station', dropoff: 'Brahma Sarovar', status: 'completed', amount: 60, distance: '4.2 km', time: '2 hr ago', type: 'taxi' },
  { id: 'J-2042', driver: 'Ramesh Kumar', pickup: 'Green Vegetable Store', dropoff: '8 Civil Lines', status: 'cancelled', amount: 35, distance: '2.8 km', time: '3 hr ago', type: 'goods' },
]

const ST: Record<DStatus, { label: string; color: string }> = {
  active:    { label: 'Active',    color: C.green },
  pending:   { label: 'Pending',   color: C.amber },
  suspended: { label: 'Suspended', color: C.red },
  offline:   { label: 'Offline',   color: C.muted },
}

const VH: Record<Vehicle, string> = { bike: 'Bike / 2W', car: 'Cab / Car', auto: 'Auto', truck: 'Mini Truck', tempo: 'Tempo' }

function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 99, padding: '3px 9px', whiteSpace: 'nowrap', display: 'inline-block' }}>{label}</span>
}

function DriverAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0,2).toUpperCase()
  return <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${C.teal}18`, border: `1px solid ${C.teal}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: C.teal, flexShrink: 0 }}>{initials}</div>
}

function btn(bg: string, color = '#fff'): React.CSSProperties {
  return { background: bg, border: 'none', color, padding: '7px 14px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }
}

export default function AdminDrivers() {
  const [tab, setTab] = useState<'drivers' | 'jobs' | 'analytics'>('drivers')
  const [drivers, setDrivers] = useState(DRIVERS)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [jobFilter, setJobFilter] = useState<string>('all')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function setStatus(id: string, s: DStatus) {
    setDrivers(d => d.map(x => x.id === id ? { ...x, status: s } : x))
    showToast(`Status updated: ${ST[s].label}`)
    setExpanded(null)
  }

  const filtered = useMemo(() => {
    return drivers.filter(d => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false
      const q = search.toLowerCase()
      return !q || d.name.toLowerCase().includes(q) || d.phone.includes(q) || d.id.toLowerCase().includes(q) || d.area.toLowerCase().includes(q)
    })
  }, [drivers, statusFilter, search])

  const counts: Record<string, number> = {
    all: drivers.length,
    active: drivers.filter(d => d.status === 'active').length,
    pending: drivers.filter(d => d.status === 'pending').length,
    suspended: drivers.filter(d => d.status === 'suspended').length,
    offline: drivers.filter(d => d.status === 'offline').length,
  }

  const filteredJobs = useMemo(() => jobFilter === 'all' ? JOBS : JOBS.filter(j => j.status === jobFilter), [jobFilter])
  const jobTypeColor: Record<string, string> = { goods: C.teal, taxi: C.purple, service: C.amber }

  return (
    <div style={{ paddingBottom: 40 }}>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 24px rgba(0,0,0,.25)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 900, color: C.teal, letterSpacing: -0.5 }}>Drivers &amp; Rides</h1>
        <p style={{ margin: 0, color: C.muted, fontSize: 14 }}>Manage driver accounts, approve applications and monitor deliveries</p>
      </div>

      {/* Stat tiles — 3 col */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total', val: drivers.length, color: C.teal },
          { label: 'Active', val: counts.active, color: C.green },
          { label: 'Pending', val: counts.pending, color: C.amber },
          { label: 'Suspended', val: counts.suspended, color: C.red },
          { label: 'Offline', val: counts.offline, color: C.muted },
          { label: 'Live Jobs', val: JOBS.filter(j => j.status === 'active').length, color: C.purple },
        ].map(t => (
          <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.color, lineHeight: 1 }}>{t.val}</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 3 }}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 2 }}>
        {([['drivers','Driver Accounts'], ['jobs','Delivery Jobs'], ['analytics','Analytics']] as const).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t as any)} style={{ padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: tab === t ? 'none' : `1px solid ${C.border}`, background: tab === t ? C.teal : C.surface, color: tab === t ? '#fff' : C.muted, flexShrink: 0 }}>{label}</button>
        ))}
      </div>

      {tab === 'drivers' && (
        <>
          {/* Status pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(['all', 'active', 'pending', 'suspended', 'offline'] as const).map(s => {
              const color = s === 'all' ? C.teal : ST[s]?.color ?? C.teal
              return (
                <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', flexShrink: 0, background: statusFilter === s ? color : '#e2e8f0', color: statusFilter === s ? '#fff' : C.muted }}>
                  {s === 'all' ? 'All' : ST[s]?.label} ({counts[s]})
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div style={{ marginBottom: 14 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, phone, ID, area…" style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: C.muted, fontSize: 14 }}>No drivers match current filters</div>}
            {filtered.map(d => (
              <div key={d.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <DriverAvatar name={d.name} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontWeight: 800, fontSize: 15, color: C.teal }}>{d.name}</span>
                        <code style={{ fontSize: 10, color: C.muted, background: C.bg, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>{d.id}</code>
                      </div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>
                        {d.area} &nbsp;·&nbsp; {VH[d.vehicle]} &nbsp;·&nbsp; {d.vehicleNo}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Badge label={ST[d.status].label} color={ST[d.status].color} />
                        <Badge label={d.kyc === 'verified' ? 'KYC Verified' : 'KYC Pending'} color={d.kyc === 'verified' ? C.green : C.amber} />
                        {d.rating > 0 && <span style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{d.rating.toFixed(1)} ★</span>}
                      </div>
                    </div>
                    <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} style={{ flexShrink: 0, fontSize: 12, fontWeight: 700, color: expanded === d.id ? '#fff' : C.teal, background: expanded === d.id ? C.teal : `${C.teal}10`, border: 'none', borderRadius: 8, padding: '7px 12px', cursor: 'pointer' }}>
                      {expanded === d.id ? 'Close' : 'Manage'}
                    </button>
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                    {[
                      { label: 'Deliveries', value: d.deliveries },
                      { label: 'Earnings', value: d.earnings > 0 ? `₹${d.earnings.toLocaleString()}` : '—' },
                      { label: 'Joined', value: d.joined.split(' ').slice(1).join(' ') },
                    ].map(s => (
                      <div key={s.label} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: '#334155' }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {expanded === d.id && (
                  <div style={{ background: '#f8fafc', borderTop: `1px solid ${C.border}`, padding: '12px 16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12, fontSize: 12, color: C.muted }}>
                      <div>Phone: <strong style={{ color: C.teal }}>{d.phone}</strong></div>
                      <div>Vehicle No: <strong style={{ color: '#334155' }}>{d.vehicleNo}</strong></div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {d.status === 'pending' && <>
                        <button onClick={() => setStatus(d.id, 'active')} style={btn(C.green)}>Approve</button>
                        <button onClick={() => setStatus(d.id, 'suspended')} style={btn(C.red)}>Reject</button>
                      </>}
                      {d.status === 'active' && <>
                        <button onClick={() => setStatus(d.id, 'offline')} style={btn('#475569')}>Set Offline</button>
                        <button onClick={() => setStatus(d.id, 'suspended')} style={btn(C.red)}>Suspend</button>
                      </>}
                      {d.status === 'suspended' && <button onClick={() => setStatus(d.id, 'active')} style={btn(C.green)}>Reinstate</button>}
                      {d.status === 'offline' && <button onClick={() => setStatus(d.id, 'active')} style={btn(C.green)}>Activate</button>}
                      {d.kyc === 'pending' && <button onClick={() => { setDrivers(drv => drv.map(x => x.id === d.id ? { ...x, kyc: 'verified' } : x)); showToast('KYC verified') }} style={btn(C.teal)}>Verify KYC</button>}
                      <button onClick={() => { if (confirm('Delete this driver account?')) { setDrivers(dr => dr.filter(x => x.id !== d.id)); showToast('Driver deleted'); setExpanded(null) } }} style={btn(C.red)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'jobs' && (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {(['all', 'active', 'completed', 'cancelled'] as const).map(s => {
              const count = JOBS.filter(j => s === 'all' || j.status === s).length
              const color = s === 'active' ? C.green : s === 'completed' ? C.teal : s === 'cancelled' ? C.red : C.teal
              return (
                <button key={s} onClick={() => setJobFilter(s)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: jobFilter === s ? color : '#e2e8f0', color: jobFilter === s ? '#fff' : C.muted }}>
                  {s.charAt(0).toUpperCase()+s.slice(1)} ({count})
                </button>
              )
            })}
          </div>

          {/* Job cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filteredJobs.map(j => {
              const sc = j.status === 'active' ? C.green : j.status === 'completed' ? C.teal : C.red
              return (
                <div key={j.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px 16px' }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <code style={{ fontSize: 12, fontWeight: 800, color: C.teal, background: `${C.teal}10`, padding: '3px 8px', borderRadius: 6 }}>{j.id}</code>
                    <span style={{ fontSize: 11, fontWeight: 700, color: jobTypeColor[j.type], background: `${jobTypeColor[j.type]}15`, borderRadius: 99, padding: '2px 8px' }}>{j.type}</span>
                    <Badge label={j.status.charAt(0).toUpperCase()+j.status.slice(1)} color={sc} />
                    <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{j.time}</span>
                  </div>

                  {/* Route */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, marginTop: 3, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>Pickup</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{j.pickup}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, marginTop: 3, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>Dropoff</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{j.dropoff}</div>
                      </div>
                    </div>
                  </div>

                  {/* Footer row */}
                  <div style={{ display: 'flex', gap: 16, paddingTop: 10, borderTop: `1px solid ${C.border}`, alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>Driver</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>{j.driver}</span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 16 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>Distance</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{j.distance}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.3 }}>Fare</div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: C.teal }}>₹{j.amount}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.teal, marginBottom: 16 }}>Vehicle Type Distribution</div>
            {Object.entries(VH).map(([v, label]) => {
              const cnt = drivers.filter(d => d.vehicle === v).length
              const pct = Math.round(cnt / drivers.length * 100)
              return (
                <div key={v} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{label}</span>
                    <span style={{ color: C.muted, fontWeight: 600 }}>{cnt} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: '#e2e8f0', borderRadius: 99 }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: C.purple, borderRadius: 99 }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.teal, marginBottom: 16 }}>Top Earners</div>
            {[...drivers].filter(d => d.earnings > 0).sort((a, b) => b.earnings - a.earnings).slice(0, 5).map((d, i) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? C.gold : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: i === 0 ? C.teal : C.muted, flexShrink: 0 }}>#{i+1}</div>
                <DriverAvatar name={d.name} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.teal }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.deliveries} deliveries · {VH[d.vehicle]}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 15, color: C.green }}>₹{d.earnings.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: C.teal, marginBottom: 16 }}>Status Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {(['active', 'pending', 'suspended', 'offline'] as const).map(s => {
                const cnt = drivers.filter(d => d.status === s).length
                return (
                  <div key={s} style={{ background: C.bg, borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: ST[s].color }}>{cnt}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, marginTop: 2 }}>{ST[s].label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
