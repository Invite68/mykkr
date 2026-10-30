'use client'

/**
 * ActiveJob — shown to the driver when they have an accepted job.
 *
 * Gives the driver:
 *  - Route display (pickup A → dropoff B)
 *  - Status progression buttons (En Route → Picked Up → Completed)
 *  - Customer name display (never customer_phone per security rules)
 *  - Live chat with the customer
 *  - Cancel option (only before picked_up)
 *
 * Props:
 *   job       — the SafeJob the driver accepted
 *   idToken   — Firebase ID token for API calls
 *   myUid     — driver's Firebase UID
 *   onUpdated — callback when job status changes (refreshes parent)
 *   onCancelled — callback when driver cancels
 */

import { useState, type FormEvent } from 'react'
import type { SafeJob, JobStatus } from '@/lib/job-types'
import JobChat from '@/components/chat/JobChat'

const DRIVER_TRANSITIONS: Record<string, { label: string; next: JobStatus }> = {
  accepted:        { label: 'I am on the way',  next: 'driver_en_route' },
  driver_en_route: { label: 'Item picked up',   next: 'picked_up'       },
  picked_up:       { label: 'Job completed',    next: 'completed'       },
}

const STATUS_LABELS: Record<JobStatus, string> = {
  open:                'Looking for driver',
  accepted:            'Accepted',
  driver_en_route:     'On the way to pickup',
  picked_up:           'En route to drop-off',
  completed:           'Completed',
  cancelled_by_rider:  'Cancelled by customer',
  cancelled_by_driver: 'Cancelled by you',
}

const STATUS_COLORS: Record<JobStatus, string> = {
  open:                '#f59e0b',
  accepted:            '#10b981',
  driver_en_route:     '#3b82f6',
  picked_up:           '#8b5cf6',
  completed:           '#10b981',
  cancelled_by_rider:  '#ef4444',
  cancelled_by_driver: '#ef4444',
}

const CHAT_ACTIVE: Set<JobStatus> = new Set(['accepted', 'driver_en_route', 'picked_up'])

interface Props {
  job:          SafeJob
  idToken:      string
  myUid:        string
  onUpdated:    (updated: SafeJob) => void
  onCancelled:  () => void
}

export default function ActiveJob({ job, idToken, myUid, onUpdated, onCancelled }: Props) {
  const [currentJob, setCurrentJob] = useState<SafeJob>(job)
  const [advancing, setAdvancing]   = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [error, setError]           = useState('')

  const transition = DRIVER_TRANSITIONS[currentJob.status]
  const canCancel  = currentJob.status === 'accepted' || currentJob.status === 'driver_en_route'
  const isDone     = currentJob.status === 'completed' || currentJob.status.startsWith('cancelled')
  const color      = STATUS_COLORS[currentJob.status] ?? '#6b7280'

  async function advance() {
    if (!transition || advancing) return
    setAdvancing(true)
    setError('')
    try {
      const res = await fetch(`/api/jobs/${currentJob.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ status: transition.next }),
      })
      const json = await res.json() as { job?: SafeJob; error?: string }
      if (!res.ok) { setError(json.error ?? 'Could not update status'); return }
      if (json.job) {
        setCurrentJob(json.job)
        onUpdated(json.job)
      }
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setAdvancing(false)
    }
  }

  async function cancelJob() {
    setConfirmCancel(false)
    setCancelling(true)
    setError('')
    try {
      const res = await fetch(`/api/jobs/${currentJob.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ by: 'driver', reason: 'Driver cancelled from driver dashboard' }),
      })
      const json = await res.json() as { job?: SafeJob; error?: string }
      if (!res.ok) { setError(json.error ?? 'Could not cancel'); setCancelling(false); return }
      onCancelled()
    } catch {
      setError('Network error. Check your connection.')
      setCancelling(false)
    }
  }

  const fare = currentJob.fare_estimate
    ? `₹${Math.round(currentJob.fare_estimate / 100).toLocaleString('en-IN')}`
    : null

  return (
    <div className="active-job-panel">
      {/* Status header */}
      <div className="active-job-header" style={{ borderLeftColor: color }}>
        <div>
          <span className="active-job-eyebrow">Active job — {currentJob.mode === 'ride' ? 'Ride' : 'Delivery'}</span>
          <div className="active-job-status" style={{ color }}>
            {STATUS_LABELS[currentJob.status]}
          </div>
          <span className="active-job-ref muted">{currentJob.ref}</span>
        </div>
        {!isDone && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div className="live-dot" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>LIVE</span>
          </div>
        )}
      </div>

      {/* Route */}
      <div className="active-job-route">
        <div className="active-job-point">
          <span className="job-pin job-pin--green">A</span>
          <div>
            <div className="active-job-point-label">Pickup</div>
            <div className="active-job-point-address">{currentJob.pickup_label}</div>
          </div>
        </div>
        <div className="active-job-route-arrow" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
          </svg>
        </div>
        <div className="active-job-point">
          <span className="job-pin job-pin--red">B</span>
          <div>
            <div className="active-job-point-label">Drop-off</div>
            <div className="active-job-point-address">{currentJob.dropoff_label}</div>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="active-job-meta">
        {currentJob.distance_km && (
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            {currentJob.distance_km.toFixed(1)} km
          </span>
        )}
        {fare && (
          <span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            {fare} est.
          </span>
        )}
        <span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {currentJob.customer_name}
        </span>
        <a
          href={`https://www.google.com/maps/dir/?api=1&origin=${currentJob.pickup_lat},${currentJob.pickup_lon}&destination=${currentJob.dropoff_lat},${currentJob.dropoff_lon}&travelmode=driving`}
          target="_blank"
          rel="noopener noreferrer"
          className="active-job-maps-link"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Open in Maps
        </a>
      </div>

      {currentJob.notes && (
        <div className="active-job-notes">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          {currentJob.notes}
        </div>
      )}

      {/* Error */}
      {error && <div className="banner banner-err" role="alert" style={{ margin: '12px 0 0' }}>{error}</div>}

      {/* Action buttons */}
      {!isDone && (
        <div className="active-job-actions">
          {transition && (
            <button
              className="btn btn-primary btn-block"
              disabled={advancing}
              onClick={advance}
              style={{ fontSize: 15, padding: '13px 20px' }}
            >
              {advancing
                ? <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
                    Updating…
                  </>
                : <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    {transition.label}
                  </>
              }
            </button>
          )}

          {canCancel && !confirmCancel && (
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: '#ef4444', marginTop: 8 }}
              disabled={cancelling}
              onClick={() => setConfirmCancel(true)}
            >
              {cancelling ? 'Cancelling…' : 'Cancel this job'}
            </button>
          )}

          {confirmCancel && (
            <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', margin: 0 }}>
                Cancel? The job will go back to other drivers.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: '#ef4444', borderColor: '#ef4444' }} onClick={cancelJob}>
                  Yes, cancel
                </button>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setConfirmCancel(false)}>
                  Keep job
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completion banner */}
      {currentJob.status === 'completed' && (
        <div className="banner banner-ok" role="status" style={{ marginTop: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Job completed! Collect payment directly from the customer — cash or UPI.</span>
        </div>
      )}

      {/* Live chat — driver ↔ customer */}
      {CHAT_ACTIVE.has(currentJob.status) && (
        <JobChat
          jobId={currentJob.id}
          myUid={myUid}
          myRole="driver"
          idToken={idToken}
        />
      )}
    </div>
  )
}
