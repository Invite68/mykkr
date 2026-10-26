/**
 * Business Portal — Jobs & Services Dashboard
 * Accept / reject / manage all incoming orders and bookings.
 * Status pipeline: Pending → Accepted → In Progress → Completed
 */

'use client'

import { useState } from 'react'

// ── Types ─────────────────────────────────────────────────────────────────────

type JobStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'

interface Job {
  id: string
  type: 'order' | 'booking' | 'inquiry'
  customer: string
  area: string
  desc: string
  amount: string
  time: string     // when the request came in
  scheduled: string // when the work / delivery is due
  status: JobStatus
  note?: string
  fulfilment: string
}

// ── Sample jobs ───────────────────────────────────────────────────────────────

const SAMPLE_JOBS: Job[] = [
  { id: '#KKR-7Q2M', type: 'order',   customer: 'Priya Mehta',    area: 'Pipli',      desc: 'Groceries (3 items) — Rice 5kg, Milk 2L, Sugar 1kg', amount: '₹380',   time: '10 min ago',  scheduled: 'Today by 5pm',         status: 'pending',     fulfilment: 'Partner driver' },
  { id: '#KKR-4NQR', type: 'booking', customer: 'Sanjay Kumar',   area: 'Thanesar',   desc: 'Painting service — 2BHK flat (4 rooms)',               amount: '₹4,500', time: '2 hr ago',    scheduled: '26 Oct · 10:00 AM',    status: 'pending',     fulfilment: 'You go on-site' },
  { id: '#KKR-8KLM', type: 'inquiry', customer: 'Ritu Sharma',    area: 'Kurukshetra',desc: 'Monthly kirana subscription — asked for pricing',       amount: '—',      time: '1 hr ago',    scheduled: 'Respond by today',     status: 'pending',     fulfilment: 'Chat / quote', note: 'Wants discount for 3 months advance' },
  { id: '#KKR-3HXP', type: 'booking', customer: 'Amit Singh',     area: 'Pehowa',     desc: 'House cleaning — 3BHK, 1 day',                         amount: '₹1,800', time: 'Yesterday',   scheduled: '27 Oct · 9:00 AM',     status: 'accepted',    fulfilment: 'You go on-site' },
  { id: '#KKR-9LKA', type: 'order',   customer: 'Meena Devi',     area: 'Thanesar',   desc: 'Stationery bundle (school supplies)',                   amount: '₹210',   time: '3 hr ago',    scheduled: 'Ready for pickup',     status: 'in_progress', fulfilment: 'Customer pickup' },
  { id: '#KKR-2BNQ', type: 'order',   customer: 'Rahul Verma',    area: 'Kurukshetra',desc: 'Vegetables daily box',                                  amount: '₹145',   time: 'Yesterday',   scheduled: 'Delivered 4:30pm',     status: 'completed',   fulfilment: 'Self-delivery' },
  { id: '#KKR-5STP', type: 'booking', customer: 'Neha Jain',      area: 'Shahabad',   desc: 'Plumbing — bathroom tap repair',                       amount: '₹600',   time: '2 days ago',  scheduled: 'Delivered',            status: 'completed',   fulfilment: 'You go on-site' },
  { id: '#KKR-6XYZ', type: 'order',   customer: 'Vinay Mehta',    area: 'Pehowa',     desc: 'Sweets — Mithai box 1kg for Diwali',                   amount: '₹350',   time: '3 hr ago',    scheduled: 'Tomorrow by noon',     status: 'rejected',    fulfilment: 'Partner driver', note: 'Out of stock - informed customer' },
]

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_META: Record<JobStatus, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Pending',     color: '#d97706', bg: '#d9780618' },
  accepted:    { label: 'Accepted',    color: '#0ea5e9', bg: '#0ea5e918' },
  in_progress: { label: 'In Progress', color: '#7c3aed', bg: '#7c3aed18' },
  completed:   { label: 'Completed',   color: '#16a34a', bg: '#16a34a18' },
  rejected:    { label: 'Rejected',    color: '#6b7280', bg: '#6b728018' },
}

// ── Tab config ────────────────────────────────────────────────────────────────

const TABS: { id: JobStatus | 'all'; label: string }[] = [
  { id: 'all',         label: 'All' },
  { id: 'pending',     label: 'Pending' },
  { id: 'accepted',    label: 'Accepted' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed',   label: 'Completed' },
  { id: 'rejected',    label: 'Rejected' },
]

// ── Job card ──────────────────────────────────────────────────────────────────

function JobCard({
  job, onStatusChange,
}: {
  job: Job
  onStatusChange: (id: string, status: JobStatus) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const meta = STATUS_META[job.status]

  const typeColor: Record<Job['type'], string> = {
    order: '#0ea5e9', booking: '#7c3aed', inquiry: '#d97706',
  }

  return (
    <div style={{
      background: '#1a2535', border: '1.5px solid #1e3a50',
      borderRadius: 12, overflow: 'hidden', marginBottom: 10,
    }}>
      {/* Card header — always visible */}
      <div
        onClick={() => setExpanded(v => !v)}
        style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start' }}
      >
        {/* Type badge */}
        <div style={{
          flexShrink: 0, padding: '4px 8px', borderRadius: 6,
          background: typeColor[job.type] + '18', color: typeColor[job.type],
          fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2,
        }}>{job.type}</div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{job.customer}</span>
              <span style={{ fontSize: 12, color: '#64748b' }}> · {job.area}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{job.amount}</span>
              <span style={{
                background: meta.bg, color: meta.color,
                fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                border: `1px solid ${meta.color}30`,
              }}>{meta.label}</span>
            </div>
          </div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {job.desc}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#475569' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 3 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {job.time}
            </span>
            <span style={{ fontSize: 11, color: '#475569' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 3 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {job.scheduled}
            </span>
            <span style={{ fontSize: 11, color: '#475569' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 3 }}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              {job.fulfilment}
            </span>
          </div>
        </div>

        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 4, transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="9 18 15 12 9 6"/></svg>
      </div>

      {/* Expanded detail + actions */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1e2d3a', padding: '12px 14px', background: '#111827' }}>
          {job.note && (
            <div style={{ fontSize: 12, color: '#d97706', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Note: {job.note}
            </div>
          )}

          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            <strong style={{ color: '#94a3b8' }}>Full details:</strong> {job.desc}
          </div>

          {/* Action buttons by status */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {job.status === 'pending' && (
              <>
                <button onClick={() => onStatusChange(job.id, 'accepted')} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 700,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                  Accept
                </button>
                <button onClick={() => onStatusChange(job.id, 'rejected')} style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                  borderRadius: 8, border: '1.5px solid #3f1a1a', cursor: 'pointer',
                  background: '#1a0f0f', color: '#f87171', fontSize: 12, fontWeight: 700,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  Decline
                </button>
              </>
            )}
            {job.status === 'accepted' && (
              <button onClick={() => onStatusChange(job.id, 'in_progress')} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#7c3aed', color: '#fff', fontSize: 12, fontWeight: 700,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Mark in progress
              </button>
            )}
            {job.status === 'in_progress' && (
              <button onClick={() => onStatusChange(job.id, 'completed')} style={{
                display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: '#0d9488', color: '#fff', fontSize: 12, fontWeight: 700,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                Mark completed
              </button>
            )}

            {/* Always available: message customer */}
            <button style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px',
              borderRadius: 8, border: '1.5px solid #1e3a50', cursor: 'pointer',
              background: 'transparent', color: '#94a3b8', fontSize: 12, fontWeight: 600,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Message customer
            </button>
            <div style={{ fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center' }}>
              {job.id}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Availability widget ────────────────────────────────────────────────────────

function AvailabilityWidget() {
  const [mode, setMode] = useState<'open' | 'busy' | 'closed'>('open')
  const options: { id: typeof mode; label: string; color: string }[] = [
    { id: 'open',   label: 'Open — accepting all jobs',    color: '#16a34a' },
    { id: 'busy',   label: 'Busy — no new bookings',       color: '#d97706' },
    { id: 'closed', label: 'Closed today',                  color: '#6b7280' },
  ]
  return (
    <div style={{ background: '#1a2535', border: '1.5px solid #1e3a50', borderRadius: 12, padding: 14, marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 10 }}>
        Your availability right now
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <button key={opt.id} onClick={() => setMode(opt.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600,
            border: `1.5px solid ${mode === opt.id ? opt.color : '#1e3a50'}`,
            background: mode === opt.id ? opt.color + '18' : 'transparent',
            color: mode === opt.id ? opt.color : '#64748b',
            transition: 'all 0.15s',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: mode === opt.id ? opt.color : '#334155', display: 'inline-block', flexShrink: 0 }} />
            {opt.label}
          </button>
        ))}
      </div>
      <div style={{ fontSize: 11, color: '#475569', marginTop: 8 }}>
        Customers see your status on your profile. &ldquo;Busy&rdquo; hides the booking button but keeps your profile live.
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [jobs, setJobs]       = useState<Job[]>(SAMPLE_JOBS)
  const [activeTab, setTab]   = useState<JobStatus | 'all'>('all')

  const pendingCount = jobs.filter(j => j.status === 'pending').length

  function handleStatusChange(id: string, status: JobStatus) {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
  }

  const filtered = activeTab === 'all' ? jobs : jobs.filter(j => j.status === activeTab)

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>Jobs &amp; Services</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#f1f5f9', margin: 0 }}>
            Job Dashboard
            {pendingCount > 0 && (
              <span style={{
                marginLeft: 10, background: '#dc2626', color: '#fff',
                fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 99,
              }}>{pendingCount} pending</span>
            )}
          </h1>
          <div style={{ fontSize: 11, color: '#475569' }}>{jobs.length} total jobs · Sample data</div>
        </div>
      </div>

      {/* Availability */}
      <AvailabilityWidget />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1.5px solid #1e2d3a', overflowX: 'auto' }}>
        {TABS.map((t) => {
          const count = t.id === 'all' ? jobs.length : jobs.filter(j => j.status === t.id).length
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 14px', fontSize: 12, fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? '#f97316' : '#64748b', background: 'transparent',
              border: 'none', borderBottom: activeTab === t.id ? '2px solid #f97316' : '2px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
            }}>
              {t.label}
              {count > 0 && (
                <span style={{
                  background: activeTab === t.id ? '#f9731620' : '#1e2d3a',
                  color: activeTab === t.id ? '#f97316' : '#475569',
                  fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 99,
                }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Job cards */}
      {filtered.length === 0 ? (
        <div style={{
          padding: '40px 20px', textAlign: 'center',
          background: '#1a2535', borderRadius: 12, border: '1.5px solid #1e3a50',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginBottom: 10 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <div style={{ color: '#475569', fontSize: 13 }}>No jobs in this status</div>
        </div>
      ) : (
        filtered.map(job => (
          <JobCard key={job.id} job={job} onStatusChange={handleStatusChange} />
        ))
      )}

      {/* Note */}
      <div style={{ marginTop: 16, fontSize: 11, color: '#334155' }}>
        Sample data — real orders appear once sign-in is connected. All payments go directly from customer to you. My KKR takes 0%.
      </div>
    </>
  )
}
