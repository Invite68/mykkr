'use client'

/**
 * Driver active job page — /dashboard/driver/jobs/[id]
 *
 * Shows job details + advance-status buttons + in-app chat.
 * Driver moves job: accepted → driver_en_route → picked_up → completed
 */

import { useState, useEffect, use } from 'react'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const JobChat = dynamic(() => import('@/components/chat/JobChat'), { ssr: false })

interface Job {
  id: string
  ref: string
  mode: string
  status: string
  customer_name: string
  pickup_label: string
  pickup_lat: number
  pickup_lon: number
  dropoff_label: string
  dropoff_lat: number
  dropoff_lon: number
  distance_km: number | null
  fare_accepted_paise: number | null
  notes: string | null
  scheduled_at: string | null
  driver_id: string | null
  accepted_at: string | null
  picked_up_at: string | null
  completed_at: string | null
  cancelled_at: string | null
}

// Driver can advance through these statuses
const NEXT_STATUS: Record<string, { status: string; label: string; confirm?: string }> = {
  accepted:        { status: 'driver_en_route', label: 'Mark En Route' },
  driver_en_route: { status: 'picked_up',       label: 'Mark Picked Up' },
  picked_up:       { status: 'completed',        label: 'Mark Completed', confirm: 'Confirm job is completed?' },
}

const STATUS_LABEL: Record<string, string> = {
  open:            'Open',
  accepted:        'Accepted',
  driver_en_route: 'En Route',
  picked_up:       'Picked Up',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

const CHAT_ACTIVE = new Set(['accepted', 'driver_en_route', 'picked_up'])

function formatRupees(paise: number | null) {
  if (paise == null) return '—'
  return `₹${(paise / 100).toFixed(0)}`
}

function mapsLink(lat: number, lon: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
}

type PageState = 'loading' | 'unauth' | 'ready' | 'error' | 'not_mine'

export default function DriverJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = use(params)

  const [pageState, setPageState] = useState<PageState>('loading')
  const [job, setJob] = useState<Job | null>(null)
  const [uid, setUid] = useState<string | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const [advanceError, setAdvanceError] = useState('')

  async function loadJob(token: string) {
    const res = await fetch(`/api/jobs/${jobId}/status`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to load job')
    const data = await res.json() as { job: Job }
    setJob(data.job)
  }

  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setPageState('unauth'); return }
      setUid(user.uid)
      try {
        const token = await user.getIdToken()
        setIdToken(token)
        const res = await fetch(`/api/jobs/${jobId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('load failed')
        const data = await res.json() as { job: Job }
        setJob(data.job)
        // Verify this driver owns the job (or it's open)
        if (data.job.driver_id && data.job.driver_id !== user.uid) {
          setPageState('not_mine')
        } else {
          setPageState('ready')
        }
      } catch {
        setPageState('error')
      }
    })
    return unsub
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId])

  async function advanceStatus() {
    if (!job || !idToken) return
    const next = NEXT_STATUS[job.status]
    if (!next) return
    if (next.confirm && !window.confirm(next.confirm)) return

    setAdvancing(true)
    setAdvanceError('')
    try {
      const res = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next.status }),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setAdvanceError(d.error ?? 'Could not update status')
        return
      }
      const data = await res.json() as { job: Job }
      setJob(data.job)
    } catch {
      setAdvanceError('Network error. Try again.')
    } finally {
      setAdvancing(false)
    }
  }

  if (pageState === 'loading') return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 60, textAlign: 'center' }}>
      <p className="muted">Loading…</p>
    </div>
  )

  if (pageState === 'unauth') return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 80, textAlign: 'center' }}>
      <p className="muted" style={{ marginBottom: 16 }}>Sign in to view this job.</p>
      <Link href="/auth/login" className="btn btn-primary">Sign In</Link>
    </div>
  )

  if (pageState === 'not_mine') return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 60 }}>
      <div className="alert alert-error">This job belongs to a different driver.</div>
      <Link href="/dashboard/driver" className="btn btn-outline" style={{ marginTop: 16 }}>Back to Dashboard</Link>
    </div>
  )

  if (pageState === 'error' || !job) return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 60 }}>
      <div className="alert alert-error">Could not load job.</div>
      <Link href="/dashboard/driver" className="btn btn-outline" style={{ marginTop: 16 }}>Back to Dashboard</Link>
    </div>
  )

  const next       = NEXT_STATUS[job.status]
  const isActive   = CHAT_ACTIVE.has(job.status)
  const isDone     = job.status === 'completed' || job.status === 'cancelled'

  return (
    <div className="container" style={{ maxWidth: 640, paddingTop: 24, paddingBottom: 80 }}>

      {/* Back */}
      <Link href="/dashboard/driver" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-3)', textDecoration: 'none', marginBottom: 20 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>
        Dashboard
      </Link>

      {/* Status banner */}
      <div style={{
        padding: '12px 16px', borderRadius: 'var(--r)', marginBottom: 16,
        background: isDone ? 'var(--surface2)' : 'var(--blue-l)',
        color: isDone ? 'var(--text-3)' : '#1d4ed8',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>{STATUS_LABEL[job.status] ?? job.status}</span>
          <span style={{ marginLeft: 8, fontSize: 12, fontFamily: 'monospace' }}>{job.ref}</span>
        </div>
        {job.status === 'completed' && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </div>

      {/* Job details */}
      <div className="card" style={{ padding: '20px', marginBottom: 16 }}>

        {/* Customer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--night-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--night)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div>
            <p style={{ fontWeight: 600, color: 'var(--night-d)' }}>{job.customer_name}</p>
            <p className="muted" style={{ fontSize: 12 }}>{job.mode === 'ride' ? 'Ride' : 'Delivery'}</p>
          </div>
          <div style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 18, color: 'var(--night-d)' }}>
            {formatRupees(job.fare_accepted_paise)}
          </div>
        </div>

        {/* Route */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '.05em', marginBottom: 4 }}>Pickup</p>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{job.pickup_label}</p>
              <a
                href={mapsLink(job.pickup_lat, job.pickup_lon)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Navigate
              </a>
            </div>
          </div>
          <div style={{ paddingLeft: 0, borderLeft: '2px dashed var(--border)', marginLeft: 4, height: 12 }} aria-hidden="true"/>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-3)', letterSpacing: '.05em', marginBottom: 4 }}>Drop-off</p>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)' }}>{job.dropoff_label}</p>
              <a
                href={mapsLink(job.dropoff_lat, job.dropoff_lon)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                style={{ fontSize: 11, padding: '4px 10px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Navigate
              </a>
            </div>
          </div>
        </div>

        {/* Notes */}
        {job.notes && (
          <div style={{ padding: '10px 12px', background: 'var(--amber-l)', borderRadius: 'var(--r-xs)', fontSize: 13, color: '#92400e' }}>
            <strong>Note:</strong> {job.notes}
          </div>
        )}
      </div>

      {/* Advance status button */}
      {next && !isDone && (
        <div style={{ marginBottom: 16 }}>
          {advanceError && <div className="alert alert-error" style={{ marginBottom: 8, fontSize: 13 }}>{advanceError}</div>}
          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: 15, fontWeight: 700 }}
            onClick={advanceStatus}
            disabled={advancing}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }} aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
            {advancing ? 'Updating…' : next.label}
          </button>
        </div>
      )}

      {isDone && (
        <div style={{ marginBottom: 16, textAlign: 'center', padding: '20px', background: 'var(--green-l)', borderRadius: 'var(--r)' }}>
          <p style={{ color: 'var(--green-d)', fontWeight: 600 }}>
            {job.status === 'completed' ? 'Job completed. Collect payment directly from the customer.' : 'Job cancelled.'}
          </p>
        </div>
      )}

      {/* Platform disclaimer */}
      <div style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 'var(--r)', marginBottom: 16, fontSize: 11, color: 'var(--text-3)' }}>
        Platform is only a connector. Payments, disputes, and quality are between you and the customer.
      </div>

      {/* Chat */}
      {isActive && uid && idToken && (
        <JobChat jobId={job.id} myUid={uid} myRole="driver" idToken={idToken} />
      )}
    </div>
  )
}
