'use client'

/**
 * Customer job tracking page — /dashboard/customer/jobs/[id]
 *
 * Shows live job status, driver info, and in-app chat once driver is assigned.
 * Polls status every 15s; chat is via SSE (real-time).
 */

import { useState, useEffect, use } from 'react'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import Link from 'next/link'
import dynamic from 'next/dynamic'

// JobChat requires browser EventSource — load client-side only
const JobChat = dynamic(() => import('@/components/chat/JobChat'), { ssr: false })

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
  accepted_at: string | null
  picked_up_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancel_reason: string | null
}

const STATUS_LABEL: Record<string, string> = {
  open:            'Searching for a driver…',
  accepted:        'Driver assigned',
  driver_en_route: 'Driver is on the way',
  picked_up:       'Trip in progress',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

const CHAT_ACTIVE = new Set(['accepted', 'driver_en_route', 'picked_up'])
const SHOW_PHONE  = new Set(['accepted', 'driver_en_route', 'picked_up'])

function formatRupees(paise: number | null) {
  if (paise == null) return '—'
  return `₹${(paise / 100).toFixed(0)}`
}

function formatTime(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

type PageState = 'loading' | 'unauth' | 'ready' | 'error'

export default function CustomerJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [job, setJob] = useState<Job | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [cancelPending, setCancelPending] = useState(false)
  const [cancelError, setCancelError] = useState('')

  // Auth + initial load
  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setPageState('unauth'); return }
      setUid(user.uid)
      try {
        const token = await user.getIdToken()
        setIdToken(token)
        await loadJob(token)
        setPageState('ready')
      } catch {
        setPageState('error')
      }
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  async function loadJob(token?: string) {
    const res = await fetch(`/api/jobs/${jobId}/status`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to load job')
    const data = await res.json() as { job: Job }
    setJob(data.job)
  }

  // Poll every 15s for status updates while job is active
  useEffect(() => {
    if (pageState !== 'ready') return
    const jobStatus = job?.status
    if (!jobStatus || jobStatus === 'completed' || jobStatus === 'cancelled') return

    const t = setInterval(() => {
      loadJob().catch(console.error)
    }, 15_000)
    return () => clearInterval(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageState, job?.status])

  async function cancelJob() {
    if (!idToken) return
    setCancelPending(true)
    setCancelError('')
    try {
      const res = await fetch(`/api/jobs/${jobId}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer cancelled' }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setCancelError(d.error ?? 'Could not cancel')
        return
      }
      await loadJob()
    } catch {
      setCancelError('Network error. Try again.')
    } finally {
      setCancelPending(false)
    }
  }

  // ── Render states ─────────────────────────────────────────────────────────────

  if (pageState === 'loading') return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 60, textAlign: 'center' }}>
      <p className="muted">Loading…</p>
    </div>
  )

  if (pageState === 'unauth') return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 80, textAlign: 'center' }}>
      <p className="muted" style={{ marginBottom: 16 }}>Sign in to view this booking.</p>
      <Link href="/register?role=customer" className="btn btn-primary">Sign In</Link>
    </div>
  )

  if (pageState === 'error' || !job) return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 60 }}>
      <div className="alert alert-error">Could not load job. <Link href="/dashboard/customer">Back to bookings</Link></div>
    </div>
  )

  const canChat   = CHAT_ACTIVE.has(job.status)
  const showPhone = SHOW_PHONE.has(job.status)
  // Customer can cancel while 'open' or 'accepted' — matches cancel API
  const canCancel = job.status === 'open' || job.status === 'accepted'
  const isDone    = ['completed', 'cancelled', 'cancelled_by_rider', 'cancelled_by_driver'].includes(job.status)

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 24, paddingBottom: 80 }}>

      {/* Back */}
      <Link href="/dashboard/customer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 20 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        My Bookings
      </Link>

      {/* Status card */}
      <div className="card" style={{ padding: '24px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--night)' }}>{job.ref}</span>
          <StatusPill status={job.status} />
        </div>

        <p style={{ fontWeight: 600, fontSize: 16, color: 'var(--night-d)', marginBottom: 16 }}>
          {STATUS_LABEL[job.status] ?? job.status}
        </p>

        {/* Route */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 'var(--r)' }}>
          <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
            <span style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>
            </span>
            <span>{job.pickup_label}</span>
          </div>
          <div style={{ marginLeft: 6, width: 0, height: 12, borderLeft: '1px dashed var(--border-d)' }} aria-hidden="true"/>
          <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
            <span style={{ color: 'var(--red)', marginTop: 2, flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span>{job.dropoff_label}</span>
          </div>
        </div>

        {/* Fare */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 16 }}>
          <span className="muted">Estimated fare</span>
          <span style={{ fontWeight: 700, color: 'var(--night-d)', fontSize: 16 }}>{formatRupees(job.fare_accepted_paise)}</span>
        </div>

        {/* Timeline */}
        <Timeline job={job} />
      </div>

      {/* Driver info (shown once accepted) */}
      {job.driver_name && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '.05em' }}>Your Driver</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--night-l)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--night)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--night-d)' }}>{job.driver_name}</p>
              {job.driver_vehicle && <p className="muted" style={{ fontSize: 13 }}>{job.driver_vehicle}</p>}
            </div>
            {showPhone && job.driver_phone && (
              <a href={`tel:${job.driver_phone}`} className="btn btn-outline" style={{ marginLeft: 'auto', fontSize: 13, padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.22 1.21 2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>
                Call
              </a>
            )}
          </div>
        </div>
      )}

      {/* Platform disclaimer */}
      <div style={{ padding: '12px 16px', background: 'var(--amber-l)', borderRadius: 'var(--r)', marginBottom: 16, fontSize: 12, color: '#92400e' }}>
        <strong>Reminder:</strong> All payments go directly to your driver. The platform is only a connector — disputes, quality, and refunds are between you and the driver.
      </div>

      {/* Cancel (only while open) */}
      {canCancel && (
        <div style={{ marginBottom: 16 }}>
          {cancelError && <div className="alert alert-error" style={{ marginBottom: 8 }}>{cancelError}</div>}
          <button
            className="btn btn-outline"
            style={{ width: '100%', color: 'var(--red)', borderColor: 'var(--red)' }}
            onClick={cancelJob}
            disabled={cancelPending}
          >
            {cancelPending ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        </div>
      )}

      {/* Chat */}
      {canChat && uid && idToken && (
        <JobChat jobId={jobId} myUid={uid} myRole="customer" idToken={idToken} />
      )}

      {!canChat && job.status === 'open' && (
        <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
          <p className="muted" style={{ fontSize: 13 }}>Chat will be available once a driver accepts your booking.</p>
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  const color: Record<string, string> = {
    open: '#d97706', accepted: '#2563eb', driver_en_route: '#2563eb',
    picked_up: '#16a34a', completed: '#16a34a', cancelled: '#dc2626',
  }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: `${color[status] ?? '#6b7280'}20`, color: color[status] ?? '#6b7280' }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function Timeline({ job }: { job: Job }) {
  const steps = [
    { label: 'Booked',       time: job.created_at,     done: true },
    { label: 'Driver found', time: job.accepted_at,     done: !!job.accepted_at },
    { label: 'Picked up',    time: job.picked_up_at,   done: !!job.picked_up_at },
    { label: 'Completed',    time: job.completed_at,   done: !!job.completed_at },
  ]
  if (job.status === 'cancelled') return null
  return (
    <div style={{ display: 'flex', gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s.label} style={{ flex: 1, position: 'relative', textAlign: 'center' }}>
          {i < steps.length - 1 && (
            <div style={{
              position: 'absolute', top: 9, left: '50%', width: '100%', height: 2,
              background: steps[i + 1].done ? 'var(--green)' : 'var(--border)',
            }} aria-hidden="true"/>
          )}
          <div style={{
            width: 20, height: 20, borderRadius: '50%', margin: '0 auto 6px',
            background: s.done ? 'var(--green)' : 'var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', zIndex: 1,
          }}>
            {s.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <p style={{ fontSize: 10, color: s.done ? 'var(--night-d)' : 'var(--text-4)', fontWeight: s.done ? 600 : 400 }}>{s.label}</p>
          {s.time && <p style={{ fontSize: 9, color: 'var(--text-4)', marginTop: 2 }}>{formatTime(s.time)}</p>}
        </div>
      ))}
    </div>
  )
}
