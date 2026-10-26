/**
 * Business Portal — Orders & Jobs Dashboard
 * Brand: teal (#12343b) × gold (#e1b382) × white
 *
 * Status can be changed to any value at any time via dropdown.
 * Wrong status? Just change it back — no lock-in.
 */

'use client'

import { useState, useRef, useEffect } from 'react'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:      '#0e2028',
  panel:   '#132b32',
  panelB:  '#1e3d47',
  card:    '#0a1c22',
  gold:    '#e1b382',
  goldBg:  'rgba(225,179,130,0.10)',
  goldB:   'rgba(225,179,130,0.22)',
  text1:   '#f0f4f5',
  text2:   '#8fb3bc',
  text3:   '#4a7a88',
  teal:    '#12343b',
  tealMid: '#2d545e',
}

// ── Types ─────────────────────────────────────────────────────────────────────
type JobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
type JobType   = 'order' | 'booking' | 'inquiry'

interface Job {
  id:          string
  type:        JobType
  customer:    string
  area:        string
  desc:        string
  amount:      string
  time:        string
  scheduled:   string
  status:      JobStatus
  note?:       string
  fulfilment:  string
  phone:       string
}

// ── Status configuration ──────────────────────────────────────────────────────
const STATUS_META: Record<JobStatus, { label: string; color: string; bg: string; border: string }> = {
  pending:     { label: 'Pending',     color: '#f0c040', bg: 'rgba(240,192,64,0.12)',  border: 'rgba(240,192,64,0.28)'  },
  accepted:    { label: 'Accepted',    color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.28)'  },
  in_progress: { label: 'In Progress', color: '#60c8e8', bg: 'rgba(96,200,232,0.12)',  border: 'rgba(96,200,232,0.28)'  },
  completed:   { label: 'Completed',   color: C.gold,    bg: C.goldBg,                 border: C.goldB                   },
  rejected:    { label: 'Rejected',    color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.28)' },
}

const ALL_STATUSES: JobStatus[] = ['pending', 'accepted', 'in_progress', 'completed', 'rejected']

// ── Type badge colours ────────────────────────────────────────────────────────
const TYPE_META: Record<JobType, { label: string; color: string }> = {
  order:   { label: 'Order',   color: C.gold   },
  booking: { label: 'Booking', color: '#60c8e8' },
  inquiry: { label: 'Inquiry', color: '#a78bfa' },
}

// ── Sample data ───────────────────────────────────────────────────────────────
const SAMPLE: Job[] = [
  { id: '#KKR-7Q2M', type: 'order',   customer: 'Priya Mehta',    area: 'Pipli',       phone: '+91 91234 56789', desc: 'Groceries — Basmati Rice 5 kg, Amul Milk 2 L, Sugar 1 kg', amount: '₹380',   time: '10 min ago',   scheduled: 'Today by 5 pm',        status: 'pending',     fulfilment: 'Partner driver'   },
  { id: '#KKR-4NQR', type: 'booking', customer: 'Sanjay Kumar',   area: 'Thanesar',    phone: '+91 98100 22334', desc: 'Painting service — 2BHK flat, 4 rooms, walls + ceiling',    amount: '₹4,500', time: '2 hr ago',     scheduled: '26 Oct · 10:00 AM',    status: 'pending',     fulfilment: 'On-site'          },
  { id: '#KKR-8KLM', type: 'inquiry', customer: 'Ritu Sharma',    area: 'Kurukshetra', phone: '+91 94567 11200', desc: 'Monthly kirana subscription — wants pricing for 3 months',   amount: '—',      time: '1 hr ago',     scheduled: 'Respond today',        status: 'pending',     fulfilment: 'Chat / quote',    note: 'Wants 10% discount for advance payment'  },
  { id: '#KKR-3HXP', type: 'booking', customer: 'Amit Singh',     area: 'Pehowa',      phone: '+91 97300 45678', desc: 'House cleaning — 3BHK, 1 full day (kitchen + bathrooms)',    amount: '₹1,800', time: 'Yesterday',    scheduled: '27 Oct · 9:00 AM',     status: 'accepted',    fulfilment: 'On-site'          },
  { id: '#KKR-9LKA', type: 'order',   customer: 'Meena Devi',     area: 'Thanesar',    phone: '+91 99887 65432', desc: 'School stationery bundle — notebooks, pens, geometry box',   amount: '₹210',   time: '3 hr ago',     scheduled: 'Ready for pickup',     status: 'in_progress', fulfilment: 'Customer pickup'  },
  { id: '#KKR-2BNQ', type: 'order',   customer: 'Rahul Verma',    area: 'Kurukshetra', phone: '+91 88822 11003', desc: 'Vegetables daily box — tomato, onion, potato, green veg',    amount: '₹145',   time: 'Yesterday',    scheduled: 'Delivered 4:30 pm',    status: 'completed',   fulfilment: 'Self-delivery'    },
  { id: '#KKR-5STP', type: 'booking', customer: 'Neha Jain',      area: 'Shahabad',    phone: '+91 90011 22334', desc: 'Plumbing — bathroom tap dripping, needs washer replacement',  amount: '₹600',   time: '2 days ago',   scheduled: 'Completed',            status: 'completed',   fulfilment: 'On-site'          },
  { id: '#KKR-6XYZ', type: 'order',   customer: 'Vinay Mehta',    area: 'Pehowa',      phone: '+91 95512 33400', desc: 'Sweets — Diwali Mithai box 1 kg assorted',                   amount: '₹350',   time: '3 hr ago',     scheduled: 'Tomorrow by noon',     status: 'rejected',    fulfilment: 'Partner driver',  note: 'Out of stock — customer informed'        },
]

const TABS: { id: JobStatus | 'all'; label: string }[] = [
  { id: 'all',         label: 'All'         },
  { id: 'pending',     label: 'Pending'     },
  { id: 'accepted',    label: 'Accepted'    },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed'   },
  { id: 'rejected',    label: 'Rejected'    },
]

// ── StatusDropdown — change any status freely ─────────────────────────────────
function StatusDropdown({
  current,
  onChange,
}: {
  current: JobStatus
  onChange: (s: JobStatus) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function outside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', outside)
    return () => document.removeEventListener('mousedown', outside)
  }, [])

  const meta = STATUS_META[current]

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '4px 10px 4px 8px',
          borderRadius: 99, cursor: 'pointer',
          background: meta.bg, color: meta.color,
          border: `1px solid ${meta.border}`,
          fontSize: 11, fontWeight: 700,
        }}
        title="Tap to change status"
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
        {meta.label}
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
          background: C.panel, border: `1px solid ${C.panelB}`,
          borderRadius: 10, overflow: 'hidden', minWidth: 170,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <div style={{ padding: '6px 10px', fontSize: 10, color: C.text3, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, borderBottom: `1px solid ${C.panelB}` }}>
            Change status
          </div>
          {ALL_STATUSES.map((s) => {
            const m = STATUS_META[s]
            const isCurrent = s === current
            return (
              <button
                key={s}
                onClick={(e) => { e.stopPropagation(); onChange(s); setOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  width: '100%', padding: '9px 12px', textAlign: 'left',
                  background: isCurrent ? C.goldBg : 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: 12,
                  color: isCurrent ? C.gold : C.text2,
                  fontWeight: isCurrent ? 700 : 500,
                  borderBottom: `1px solid ${C.panelB}`,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                {m.label}
                {isCurrent && (
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginLeft: 'auto' }}>
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Job card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onStatusChange }: { job: Job; onStatusChange: (id: string, s: JobStatus) => void }) {
  const [expanded, setExpanded] = useState(false)
  const typeMeta = TYPE_META[job.type]

  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.panelB}`,
      borderRadius: 12, overflow: 'hidden', marginBottom: 8,
    }}>
      {/* Row — always visible */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded(v => !v)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setExpanded(v => !v)}
        style={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}
      >
        {/* Type badge */}
        <span style={{
          flexShrink: 0, padding: '3px 8px', borderRadius: 6,
          background: 'rgba(255,255,255,0.05)',
          border: `1px solid ${typeMeta.color}40`,
          color: typeMeta.color,
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.4,
        }}>{typeMeta.label}</span>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.text1 }}>
            {job.customer}
            <span style={{ fontWeight: 400, fontSize: 12, color: C.text3, marginLeft: 6 }}>{job.area}</span>
          </div>
          <div style={{ fontSize: 12, color: C.text2, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.desc}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 11, color: C.text3 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 3 }}>
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              {job.time}
            </span>
            <span style={{ fontSize: 11, color: C.text3 }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 3 }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              {job.scheduled}
            </span>
          </div>
        </div>

        {/* Right: amount + status dropdown */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
          <span style={{ fontWeight: 900, fontSize: 14, color: C.text1 }}>{job.amount}</span>
          <StatusDropdown
            current={job.status}
            onChange={(s) => onStatusChange(job.id, s)}
          />
        </div>

        {/* Expand chevron */}
        <svg
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke={C.text3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}
        >
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${C.panelB}`, padding: '14px 16px', background: C.card }}>
          {/* Full description */}
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 12, lineHeight: 1.6 }}>
            <strong style={{ color: C.text1, fontWeight: 600 }}>Order details:</strong> {job.desc}
          </div>

          {/* Note */}
          {job.note && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '8px 12px', borderRadius: 8, marginBottom: 12,
              background: C.goldBg, border: `1px solid ${C.goldB}`,
              fontSize: 12, color: C.gold,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {job.note}
            </div>
          )}

          {/* Meta row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Fulfilment', value: job.fulfilment },
              { label: 'Job ID',     value: job.id         },
              { label: 'Phone',      value: job.phone      },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: C.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: C.text1, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px', borderRadius: 8,
              background: C.goldBg, border: `1px solid ${C.goldB}`,
              color: C.gold, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message customer
            </button>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 14px', borderRadius: 8,
              background: 'transparent', border: `1px solid ${C.panelB}`,
              color: C.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.14 13.5 19.79 19.79 0 0 1 1.08 4.9 2 2 0 0 1 3.06 2.72h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16.92z"/>
              </svg>
              Call customer
            </button>
            {job.status === 'pending' && (
              <button
                onClick={() => onStatusChange(job.id, 'rejected')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 14px', borderRadius: 8,
                  background: 'transparent', border: '1px solid rgba(248,113,113,0.30)',
                  color: '#f87171', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Decline
              </button>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 11, color: C.text3 }}>
            Tip: Use the status dropdown in the card header to change status at any time — including reversing a wrong selection.
          </div>
        </div>
      )}
    </div>
  )
}

// ── Availability strip ────────────────────────────────────────────────────────
function AvailabilityStrip() {
  const [mode, setMode] = useState<'open' | 'busy' | 'closed'>('open')
  const opts = [
    { id: 'open',   label: 'Open — accepting orders',  color: '#4ade80' },
    { id: 'busy',   label: 'Busy — no new bookings',   color: C.gold   },
    { id: 'closed', label: 'Closed today',              color: '#f87171' },
  ] as const

  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.panelB}`,
      borderRadius: 12, padding: '14px 16px', marginBottom: 20,
    }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: C.text1, marginBottom: 10 }}>Availability</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {opts.map((opt) => {
          const active = mode === opt.id
          return (
            <button key={opt.id} onClick={() => setMode(opt.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              fontSize: 12, fontWeight: 600,
              border: `1px solid ${active ? opt.color : C.panelB}`,
              background: active ? `${opt.color}15` : 'transparent',
              color: active ? opt.color : C.text3,
              transition: 'all 0.15s',
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? opt.color : C.text3, flexShrink: 0 }} />
              {opt.label}
            </button>
          )
        })}
      </div>
      <div style={{ fontSize: 11, color: C.text3, marginTop: 8 }}>
        Customers see this on your profile. &ldquo;Busy&rdquo; hides the booking button while keeping your page live.
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [jobs,      setJobs]  = useState<Job[]>(SAMPLE)
  const [activeTab, setTab]   = useState<JobStatus | 'all'>('all')

  const pendingCount = jobs.filter(j => j.status === 'pending').length

  function handleStatusChange(id: string, status: JobStatus) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
  }

  const filtered = activeTab === 'all' ? jobs : jobs.filter(j => j.status === activeTab)

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 11, color: C.text3, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 4 }}>Orders & Jobs</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: C.text1, margin: 0, letterSpacing: -0.4 }}>
            Job Dashboard
          </h1>
          {pendingCount > 0 && (
            <span style={{
              background: '#dc2626', color: '#fff',
              fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 99,
            }}>
              {pendingCount} need action
            </span>
          )}
        </div>
      </div>

      {/* Availability */}
      <AvailabilityStrip />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${C.panelB}`, marginBottom: 16, overflowX: 'auto' }}>
        {TABS.map((t) => {
          const count = t.id === 'all' ? jobs.length : jobs.filter(j => j.status === t.id).length
          const active = activeTab === t.id
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 14px',
              fontSize: 12, fontWeight: active ? 700 : 500,
              color: active ? C.gold : C.text3,
              background: 'transparent', border: 'none',
              borderBottom: `2px solid ${active ? C.gold : 'transparent'}`,
              cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 5,
              transition: 'color 0.12s',
            }}>
              {t.label}
              {count > 0 && (
                <span style={{
                  background: active ? C.goldBg : `rgba(255,255,255,0.06)`,
                  color: active ? C.gold : C.text3,
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                  border: `1px solid ${active ? C.goldB : C.panelB}`,
                }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '44px 20px', textAlign: 'center',
          background: C.panel, borderRadius: 12, border: `1px solid ${C.panelB}`,
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 10 }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <div style={{ color: C.text3, fontSize: 13 }}>No jobs in this category</div>
        </div>
      ) : (
        filtered.map(job => (
          <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
        ))
      )}

      {/* Footer note */}
      <div style={{ marginTop: 16, fontSize: 11, color: C.text3, lineHeight: 1.6 }}>
        Sample data — real orders appear once sign-in is connected. All payments go directly between customer and you. My KKR takes 0%.
      </div>
    </>
  )
}
