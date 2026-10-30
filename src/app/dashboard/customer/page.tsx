'use client'

/**
 * Customer Dashboard — /dashboard/customer
 *
 * Shows the customer's booking history: all jobs they created, with live status.
 * Links to the tracking page for active jobs.
 */

import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import Link from 'next/link'

interface Job {
  id: string
  ref: string
  mode: string
  status: string
  pickup_label: string
  dropoff_label: string
  driver_name: string | null
  driver_vehicle: string | null
  driver_phone: string | null
  fare_accepted_paise: number | null
  created_at: string
  scheduled_at: string | null
}

const STATUS_LABEL: Record<string, string> = {
  open:                'Looking for driver',
  accepted:            'Driver on the way',
  driver_en_route:     'Driver en route',
  picked_up:           'In progress',
  completed:           'Completed',
  cancelled:           'Cancelled',
  cancelled_by_rider:  'Cancelled by you',
  cancelled_by_driver: 'Cancelled by driver',
}

const STATUS_COLOR: Record<string, string> = {
  open:                'badge-amber',
  accepted:            'badge-blue',
  driver_en_route:     'badge-blue',
  picked_up:           'badge-green',
  completed:           'badge-green',
  cancelled:           'badge-red',
  cancelled_by_rider:  'badge-red',
  cancelled_by_driver: 'badge-amber',
}

const ACTIVE = new Set(['open', 'accepted', 'driver_en_route', 'picked_up'])
const TERMINAL = new Set(['completed', 'cancelled', 'cancelled_by_rider', 'cancelled_by_driver'])

function formatRupees(paise: number | null) {
  if (paise == null) return '—'
  return `₹${(paise / 100).toFixed(0)}`
}

function timeAgo(iso: string) {
  const secs = (Date.now() - new Date(iso).getTime()) / 1000
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

type State = 'loading' | 'unauth' | 'ready' | 'error'

export default function CustomerDashboard() {
  const [state, setState] = useState<State>('loading')
  const [jobs, setJobs] = useState<Job[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setState('unauth'); return }

      try {
        const token = await user.getIdToken()
        const res = await fetch('/api/customer/jobs', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to load jobs')
        const data = await res.json() as { jobs: Job[] }
        setJobs(data.jobs)
        setState('ready')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
        setState('error')
      }
    })
    return unsub
  }, [])

  if (state === 'loading') return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 60, textAlign: 'center' }}>
      <p className="muted">Loading your bookings…</p>
    </div>
  )

  if (state === 'unauth') return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 80, textAlign: 'center' }}>
      <p className="muted" style={{ marginBottom: 16 }}>Sign in to view your bookings.</p>
      <Link href="/auth/login" className="btn btn-primary">Sign In</Link>
    </div>
  )

  if (state === 'error') return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 60 }}>
      <div className="alert alert-error">{error}</div>
    </div>
  )

  const active = jobs.filter(j => ACTIVE.has(j.status))
  const past   = jobs.filter(j => TERMINAL.has(j.status))

  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--night-d)' }}>My Bookings</h1>
        <Link href="/book" className="btn btn-primary" style={{ fontSize: 14, padding: '8px 16px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }} aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Booking
        </Link>
      </div>

      {jobs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }} aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <p style={{ color: 'var(--text-3)', marginBottom: 16 }}>No bookings yet.</p>
          <Link href="/book" className="btn btn-primary">Make your first booking</Link>
        </div>
      )}

      {/* Active jobs */}
      {active.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', marginBottom: 12 }}>Active</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {active.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {/* Past jobs */}
      {past.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', marginBottom: 12 }}>History</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {past.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function JobCard({ job }: { job: Job }) {
  const isActive = ACTIVE.has(job.status)

  return (
    <Link href={`/dashboard/customer/jobs/${job.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '16px 20px', transition: 'box-shadow .15s' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--night)' }}>{job.ref}</span>
          <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>{timeAgo(job.created_at)}</span>
        </div>
        <span className={`badge ${STATUS_COLOR[job.status] ?? 'badge-muted'}`} style={{ fontSize: 11 }}>
          {STATUS_LABEL[job.status] ?? job.status}
        </span>
      </div>

      {/* Route */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
          <span style={{ marginTop: 2, color: 'var(--green)', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>
          </span>
          <span style={{ color: 'var(--text-2)' }}>{job.pickup_label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
          <span style={{ marginTop: 2, color: 'var(--red)', flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
          <span style={{ color: 'var(--text-2)' }}>{job.dropoff_label}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
          {job.driver_name ? (
            <span>Driver: <strong>{job.driver_name}</strong>{job.driver_vehicle ? ` · ${job.driver_vehicle}` : ''}</span>
          ) : (
            <span>Awaiting driver…</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, color: 'var(--night-d)' }}>{formatRupees(job.fare_accepted_paise)}</span>
          {isActive && (
            <span style={{ color: 'var(--blue)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              Track
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
