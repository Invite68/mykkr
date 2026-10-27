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
  active: { label: 'Active', color: C.green },
  pending: { label: 'Pending', color: C.amber },
  suspended: { label: 'Suspended', color: C.red },
  offline: { label: 'Offline', color: C.muted },
}

const VH: Record<Vehicle, string> = { bike: 'Bike/2W', car: 'Cab/Car', auto: 'Auto', truck: 'Mini Truck', tempo: 'Tempo' }

function Badge({ label, color }: { label: string; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap' }}>{label}</span>
}

function Stars({ n }: { n: number }) {
  if (n === 0) return <span style={{ fontSize: 12, color: C.muted }}>N/A</span>
  return <span style={{ fontSize: 13, fontWeight: 700, color: C.amber }}>{n.toFixed(1)} ★</span>
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
    showToast(`Driver status updated to ${ST[s].label}`)
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

  const filteredJobs = useMemo(() => {
    if (jobFilter === 'all') return JOBS
    return JOBS.filter(j => j.status === jobFilter)
  }, [jobFilter])

  const jobTypeColor: Record<string, string> = { goods: C.teal, taxi: C.purple, service: C.amber }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Drivers &amp; Rides</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage driver accounts, approve applications, and monitor deliveries</p>
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Total Drivers', val: drivers.length, color: C.teal },
          { label: 'Active', val: counts.active, color: C.green },
          { label: 'Pending Approval', val: counts.pending, color: C.amber },
          { label: 'Suspended', val: counts.suspended, color: C.red },
          { label: 'Offline', val: counts.offline, color: C.muted },
          { label: 'Jobs Today', val: JOBS.filter(j=>j.status==='active').length, color: C.purple },
        ].map(t => (
          <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: t.color }}>{t.val}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['drivers', 'jobs', 'analytics'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: tab===t ? 'none' : `1px solid ${C.border}`, background: tab===t ? C.teal : C.surface, color: tab===t ? '#fff' : C.muted }}>
            {t === 'drivers' ? 'Driver Accounts' : t === 'jobs' ? 'Delivery Jobs' : 'Analytics'}
          </button>
        ))}
      </div>

      {tab === 'drivers' && (
        <>
          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(['all', 'active', 'pending', 'suspended', 'offline'] as const).map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${statusFilter===s ? (s==='all' ? C.teal : (ST[s as DStatus]?.color || C.teal)) : C.border}`, background: statusFilter===s ? (s==='all' ? C.teal : (ST[s as DStatus]?.color || C.teal)) : C.surface, color: statusFilter===s ? '#fff' : C.muted }}>
                {s === 'all' ? 'All' : ST[s as DStatus]?.label} ({counts[s]})
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ marginBottom: 12 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, phone, ID, area..." style={{ width: '100%', maxWidth: 400, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>

          {/* Table */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 100px 80px 80px 80px', gap: 8, padding: '9px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
              <span>ID</span><span>Driver</span><span>Vehicle</span><span>Status</span><span>Rating</span><span>Jobs</span><span>Manage</span>
            </div>
            {filtered.map(d => (
              <div key={d.id}>
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr 100px 100px 80px 80px 80px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: 'monospace' }}>{d.id}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b' }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{d.area} · KYC: <span style={{ color: d.kyc==='verified' ? C.green : C.amber, fontWeight: 700 }}>{d.kyc}</span></div>
                  </div>
                  <span style={{ fontSize: 12, color: C.muted }}>{VH[d.vehicle]}</span>
                  <Badge label={ST[d.status].label} color={ST[d.status].color} />
                  <Stars n={d.rating} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{d.deliveries}</span>
                  <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.teal, borderRadius: 6, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    {expanded === d.id ? 'Close' : 'Manage'}
                  </button>
                </div>

                {expanded === d.id && (
                  <div style={{ background: 'rgba(18,52,59,.03)', borderBottom: `1px solid ${C.border}`, padding: '14px 20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: 16, marginBottom: 14, fontSize: 12, color: C.muted }}>
                      <div><span style={{ fontWeight: 700, color: '#334155' }}>Phone: </span>{d.phone}</div>
                      <div><span style={{ fontWeight: 700, color: '#334155' }}>Vehicle No: </span>{d.vehicleNo}</div>
                      <div><span style={{ fontWeight: 700, color: '#334155' }}>Joined: </span>{d.joined}</div>
                      <div><span style={{ fontWeight: 700, color: '#334155' }}>Earnings: </span>₹{d.earnings.toLocaleString()}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {d.status === 'pending' && <>
                        <button onClick={() => setStatus(d.id, 'active')} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Approve &amp; Activate</button>
                        <button onClick={() => setStatus(d.id, 'suspended')} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reject</button>
                      </>}
                      {d.status === 'active' && <>
                        <button onClick={() => setStatus(d.id, 'offline')} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Set Offline</button>
                        <button onClick={() => setStatus(d.id, 'suspended')} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Suspend</button>
                      </>}
                      {d.status === 'suspended' && <button onClick={() => setStatus(d.id, 'active')} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Reinstate</button>}
                      {d.status === 'offline' && <button onClick={() => setStatus(d.id, 'active')} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Activate</button>}
                      {d.kyc === 'pending' && <button onClick={() => { setDrivers(drv => drv.map(x => x.id === d.id ? { ...x, kyc: 'verified' } : x)); showToast('KYC verified') }} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Verify KYC</button>}
                      <button onClick={() => { if (confirm('Delete this driver account?')) { setDrivers(dr => dr.filter(x => x.id !== d.id)); showToast('Driver deleted'); setExpanded(null) } }} style={{ background: 'rgba(220,38,38,.08)', color: C.red, border: `1px solid ${C.red}33`, borderRadius: 7, padding: '6px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Delete Account</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>No drivers match the current filters.</div>}
          </div>
        </>
      )}

      {tab === 'jobs' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {(['all', 'active', 'completed', 'cancelled'] as const).map(s => (
              <button key={s} onClick={() => setJobFilter(s)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${jobFilter===s ? C.teal : C.border}`, background: jobFilter===s ? C.teal : C.surface, color: jobFilter===s ? '#fff' : C.muted }}>
                {s.charAt(0).toUpperCase()+s.slice(1)} ({JOBS.filter(j => s==='all' || j.status===s).length})
              </button>
            ))}
          </div>
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr 1fr 80px 80px 90px', gap: 8, padding: '9px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
              <span>Job ID</span><span>Driver</span><span>Pickup</span><span>Dropoff</span><span>Amount</span><span>Distance</span><span>Status</span>
            </div>
            {filteredJobs.map(j => {
              const sc = j.status === 'active' ? C.green : j.status === 'completed' ? C.teal : C.red
              return (
                <div key={j.id} style={{ display: 'grid', gridTemplateColumns: '80px 120px 1fr 1fr 80px 80px 90px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', fontSize: 12 }}>
                  <div>
                    <div style={{ fontWeight: 800, color: C.teal, fontFamily: 'monospace', fontSize: 11 }}>{j.id}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: jobTypeColor[j.type], background: `${jobTypeColor[j.type]}15`, borderRadius: 99, padding: '1px 6px' }}>{j.type}</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{j.driver}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{j.pickup}</span>
                  <span style={{ color: C.muted, fontSize: 11 }}>{j.dropoff}</span>
                  <span style={{ fontWeight: 800, color: C.teal }}>₹{j.amount}</span>
                  <span style={{ color: C.muted }}>{j.distance}</span>
                  <Badge label={j.status.charAt(0).toUpperCase()+j.status.slice(1)} color={sc} />
                </div>
              )
            })}
          </div>
        </>
      )}

      {tab === 'analytics' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Vehicle distribution */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.teal, marginBottom: 14 }}>Vehicle Type Distribution</div>
            {Object.entries(VH).map(([v, label]) => {
              const cnt = drivers.filter(d => d.vehicle === v).length
              const pct = Math.round(cnt / drivers.length * 100)
              return (
                <div key={v} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span style={{ color: '#334155' }}>{label}</span>
                    <span style={{ color: C.muted }}>{cnt} ({pct}%)</span>
                  </div>
                  <div style={{ height: 8, background: C.bg, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: C.purple, borderRadius: 99, transition: 'width .3s' }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Top earners */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.teal, marginBottom: 14 }}>Top Earners</div>
            {[...drivers].filter(d => d.earnings > 0).sort((a, b) => b.earnings - a.earnings).slice(0, 5).map((d, i) => (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: i === 0 ? C.gold : C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === 0 ? C.teal : C.muted, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#334155' }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{d.deliveries} deliveries · {VH[d.vehicle]}</div>
                </div>
                <div style={{ fontWeight: 900, fontSize: 14, color: C.green }}>₹{d.earnings.toLocaleString()}</div>
              </div>
            ))}
          </div>

          {/* Status breakdown */}
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, gridColumn: '1 / -1' }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: C.teal, marginBottom: 14 }}>Status Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {(['active', 'pending', 'suspended', 'offline'] as const).map(s => {
                const cnt = drivers.filter(d => d.status === s).length
                const pct = Math.round(cnt / drivers.length * 100)
                return (
                  <div key={s} style={{ background: C.bg, borderRadius: 10, padding: 14, textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: ST[s].color }}>{cnt}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{ST[s].label}</div>
                    <div style={{ fontSize: 11, color: ST[s].color, fontWeight: 700 }}>{pct}%</div>
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
