'use client'

/**
 * Driver Job Board — real-time feed of open jobs via Server-Sent Events.
 *
 * Lifecycle:
 *   1. Connects to GET /api/jobs/stream (SSE)
 *   2. Receives initial snapshot of open jobs + live updates
 *   3. Driver taps Accept → POST /api/jobs/[id]/accept (atomic)
 *      → 200: job is yours
 *      → 409: race lost — someone else accepted first
 *   4. Driver can cancel accepted job → job goes back live for others
 *
 * No Supabase, no external deps — pure browser EventSource API.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SafeJob, JobEvent } from '@/lib/job-types'

// ── Simulated driver session (replace with real Firebase auth) ────────────────
const MOCK_DRIVER = {
  id:      'driver-demo-001',
  name:    'Demo Driver',
  phone:   '9876543210',
  vehicle: 'Auto Rickshaw',
}

// ── Relative time helper ──────────────────────────────────────────────────────
function relTime(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)   return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

// ── Single job card ───────────────────────────────────────────────────────────
function JobCard({
  job,
  onAccept,
  onCancel,
  myAccepted,
}: {
  job: SafeJob
  onAccept: (id: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
  myAccepted: boolean
}) {
  const [state, setState] = useState<'idle' | 'accepting' | 'taken' | 'mine' | 'cancelling'>(
    myAccepted ? 'mine' : 'idle'
  )
  const [err, setErr] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)
  const fare = job.fare_estimate
    ? `₹${Math.round(job.fare_estimate / 100).toLocaleString('en-IN')}`
    : null

  // Reflect status changes pushed via SSE
  useEffect(() => {
    if (job.status !== 'open' && state === 'idle') setState('taken')
  }, [job.status, state])

  async function handleAccept() {
    setState('accepting')
    setErr('')
    try {
      await onAccept(job.id)
      setState('mine')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg === 'ALREADY_ACCEPTED') {
        setState('taken')
        setErr('Another driver accepted this just now.')
      } else {
        setState('idle')
        setErr('Could not accept — please try again.')
      }
    }
  }

  async function handleCancelConfirmed() {
    setConfirmCancel(false)
    setState('cancelling')
    try {
      await onCancel(job.id)
      setState('idle')
    } catch {
      setState('mine')
      setErr('Could not cancel — please try again.')
    }
  }

  const taken      = state === 'taken'
  const mine       = state === 'mine' || state === 'cancelling'
  const cancelling = state === 'cancelling'
  const busy       = state === 'accepting' || state === 'cancelling'

  return (
    <div className={`job-card${taken ? ' job-card--taken' : mine ? ' job-card--mine' : ''}`}>
      {taken && <div className="job-ribbon job-ribbon--taken">✖ Taken</div>}
      {mine  && <div className="job-ribbon job-ribbon--mine">✅ Your job</div>}

      <div className="job-card-header">
        <span className="job-mode-badge">
          {job.mode === 'ride' ? '🚗 Ride' : '📦 Delivery'}
        </span>
        <span className="job-time">{relTime(job.created_at)}</span>
      </div>

      {/* Route */}
      <div className="job-route">
        <div className="job-route-point job-route-point--a">
          <span className="job-pin job-pin--green">A</span>
          <span className="job-route-label">{job.pickup_label}</span>
        </div>
        <div className="job-route-line" aria-hidden="true" />
        <div className="job-route-point job-route-point--b">
          <span className="job-pin job-pin--red">B</span>
          <span className="job-route-label">{job.dropoff_label}</span>
        </div>
      </div>

      {/* Meta */}
      <div className="job-meta">
        {job.distance_km && <span>📏 ~{job.distance_km.toFixed(1)} km</span>}
        {fare             && <span>💰 {fare} est.</span>}
        <span>🚗 {job.vehicle_id}</span>
        {job.scheduled_at && (
          <span>🕐 {new Date(job.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>

      {job.notes && <p className="job-notes">{job.notes}</p>}

      {/* Customer contact — only visible to the driver who accepted */}
      {mine && (
        <div className="job-contact">
          <strong>👤 {job.customer_name}</strong>
          {job.driver_phone && (
            <a href={`tel:${job.driver_phone}`} className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }}>
              📞 Call rider
            </a>
          )}
        </div>
      )}

      {err && <p className="job-err">{err}</p>}

      <div className="job-actions">
        {!taken && !mine && (
          <button className="btn btn-primary btn-block" disabled={busy} onClick={handleAccept}>
            {state === 'accepting' ? '⏳ Accepting…' : '✅ Accept job'}
          </button>
        )}
        {mine && !confirmCancel && (
          <>
            <a href={`/track/${job.ref}`} className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
              🗺️ View map
            </a>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: '#ef4444' }}
              disabled={busy}
              onClick={() => setConfirmCancel(true)}
            >
              {cancelling ? '⏳…' : '✖ Cancel'}
            </button>
          </>
        )}
        {mine && confirmCancel && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', margin: 0 }}>
              Cancel this job? It will go back to other drivers.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1, color: '#ef4444', borderColor: '#ef4444' }} onClick={handleCancelConfirmed}>
                Yes, cancel
              </button>
              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setConfirmCancel(false)}>
                Keep job
              </button>
            </div>
          </div>
        )}
        {taken && (
          <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
            Taken by another driver.
          </p>
        )}
      </div>
    </div>
  )
}

// ── Main board ────────────────────────────────────────────────────────────────
export default function JobBoard() {
  const [jobs, setJobs]       = useState<SafeJob[]>([])
  const [connected, setConnected] = useState(false)
  const [myJobId, setMyJobId] = useState<string | null>(null)
  const esRef = useRef<EventSource | null>(null)

  // ── SSE connection ────────────────────────────────────────────────────────
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>

    function connect() {
      const es = new EventSource('/api/jobs/stream')
      esRef.current = es

      es.onopen = () => setConnected(true)

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data as string) as JobEvent
          if (event.type === 'ping') return

          if (event.type === 'job_new') {
            setJobs((prev) => {
              // Deduplicate — initial snapshot can race with a broadcast
              if (prev.some((j) => j.id === event.job.id)) return prev
              return [event.job, ...prev]
            })
          } else if (event.type === 'job_updated') {
            setJobs((prev) =>
              prev.map((j) => j.id === event.job.id ? { ...j, ...event.job } : j)
            )
          }
        } catch {
          // Malformed event — ignore
        }
      }

      es.onerror = () => {
        setConnected(false)
        es.close()
        // Reconnect after 3s
        retryTimer = setTimeout(connect, 3_000)
      }
    }

    connect()

    return () => {
      clearTimeout(retryTimer)
      esRef.current?.close()
    }
  }, [])

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        driverId:      MOCK_DRIVER.id,
        driverName:    MOCK_DRIVER.name,
        driverPhone:   MOCK_DRIVER.phone,
        driverVehicle: MOCK_DRIVER.vehicle,
      }),
    })
    const json = await res.json() as { job?: SafeJob; error?: string; code?: string }
    if (res.status === 409) throw new Error('ALREADY_ACCEPTED')
    if (!res.ok) throw new Error(json.error ?? 'accept failed')
    setMyJobId(jobId)
    if (json.job) {
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, ...json.job } : j))
    }
  }, [])

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ by: 'driver', reason: 'Driver cancelled via job board' }),
    })
    const json = await res.json() as { job?: SafeJob; error?: string }
    if (!res.ok) throw new Error(json.error ?? 'cancel failed')
    setMyJobId(null)
    if (json.job) {
      setJobs((prev) =>
        prev.map((j) => j.id === jobId ? { ...j, ...json.job, status: 'open', driver_id: null } : j)
      )
    }
  }, [])

  const visibleJobs = jobs.filter((j) => j.status === 'open' || j.id === myJobId)

  return (
    <div>
      {/* Connection indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className={`live-dot${connected ? '' : ' live-dot--offline'}`} />
        <span style={{ fontWeight: 700, color: connected ? '#10b981' : '#f59e0b', fontSize: 13 }}>
          {connected ? 'LIVE JOBS' : 'RECONNECTING…'}
        </span>
        <span className="muted" style={{ fontSize: 12 }}>— updates in real time</span>
      </div>

      {visibleJobs.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40 }}>🕐</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>No open jobs right now</p>
          <p className="muted">New requests will appear here instantly.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onAccept={handleAccept}
              onCancel={handleCancel}
              myAccepted={myJobId === job.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
