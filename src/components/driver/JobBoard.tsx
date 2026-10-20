'use client'

/**
 * Driver Job Board — real-time feed of open jobs.
 *
 * Lifecycle:
 *   1. Loads open jobs on mount via Supabase query
 *   2. Subscribes to Supabase Realtime for:
 *      INSERT → new job appears on board
 *      UPDATE → job taken (status changed) → remove from board OR update state
 *   3. Driver taps Accept → POST /api/jobs/[id]/accept (atomic)
 *      → 200: show "You got it!" + contact details
 *      → 409: someone else grabbed it first → job card greys out
 *   4. Driver can cancel accepted job → job goes back live for others
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Job } from '@/lib/supabase-types'

// ── Simulated driver session (replace with real Firebase auth) ────────────
const MOCK_DRIVER = {
  id:      'driver-demo-001',
  name:    'Demo Driver',
  phone:   '9876543210',
  vehicle: 'Auto Rickshaw',
}

// ── Relative time helper ───────────────────────────────────────────────────
function relTime(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 60)  return `${secs}s ago`
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

// ── Single job card ────────────────────────────────────────────────────────
function JobCard({
  job,
  onAccept,
  onCancel,
  myAccepted,
}: {
  job: Job
  onAccept: (id: string) => Promise<void>
  onCancel: (id: string) => Promise<void>
  myAccepted: boolean
}) {
  const [state, setState] = useState<'idle' | 'accepting' | 'taken' | 'mine' | 'cancelling'>(
    myAccepted ? 'mine' : 'idle'
  )
  const [err, setErr] = useState('')
  const fare = job.fare_estimate ? `₹${Math.round(job.fare_estimate / 100).toLocaleString('en-IN')}` : null

  // If another driver takes it while we're watching
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
        setErr('A different driver accepted this just now.')
      } else {
        setState('idle')
        setErr('Could not accept — please try again.')
      }
    }
  }

  async function handleCancel() {
    if (!confirm('Cancel this job? It will go back to other drivers.')) return
    setState('cancelling')
    try {
      await onCancel(job.id)
      setState('idle') // card will be removed by Realtime subscription
    } catch {
      setState('mine')
      setErr('Could not cancel — please try again.')
    }
  }

  const taken       = state === 'taken'
  const mine        = state === 'mine' || state === 'cancelling'
  const cancelling  = state === 'cancelling'
  const busy        = state === 'accepting' || state === 'cancelling'

  return (
    <div className={`job-card${taken ? ' job-card--taken' : mine ? ' job-card--mine' : ''}`}>
      {/* Status ribbon */}
      {taken && <div className="job-ribbon job-ribbon--taken">✖ Taken</div>}
      {mine  && <div className="job-ribbon job-ribbon--mine">✅ Your job</div>}

      <div className="job-card-header">
        <span className="job-mode-badge">{job.mode === 'ride' ? '🚗 Ride' : '📦 Delivery'}</span>
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

      {/* Meta row */}
      <div className="job-meta">
        {job.distance_km && <span>📏 ~{job.distance_km.toFixed(1)} km</span>}
        {fare             && <span>💰 {fare} est.</span>}
        <span>🚗 {job.vehicle_id}</span>
        {job.scheduled_at && <span>🕐 {new Date(job.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>}
      </div>

      {/* Notes */}
      {job.notes && <p className="job-notes">{job.notes}</p>}

      {/* Customer contact — only shown after acceptance */}
      {mine && (
        <div className="job-contact">
          <strong>👤 {job.customer_name}</strong>
          <a href={`tel:${job.customer_phone}`} className="btn btn-sm btn-outline" style={{ marginLeft: 'auto' }}>
            📞 Call rider
          </a>
        </div>
      )}

      {err && <p className="job-err">{err}</p>}

      {/* Action buttons */}
      <div className="job-actions">
        {!taken && !mine && (
          <button
            className="btn btn-primary btn-block"
            disabled={busy}
            onClick={handleAccept}
          >
            {state === 'accepting' ? '⏳ Accepting…' : '✅ Accept job'}
          </button>
        )}
        {mine && (
          <>
            <a href={`/track/${job.ref}`} className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
              🗺️ View map
            </a>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: '#ef4444' }}
              disabled={busy}
              onClick={handleCancel}
            >
              {cancelling ? '⏳…' : '✖ Cancel'}
            </button>
          </>
        )}
        {taken && <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>This job was taken by another driver.</p>}
      </div>
    </div>
  )
}

// ── Main board ─────────────────────────────────────────────────────────────
export default function JobBoard() {
  const [jobs, setJobs]         = useState<Job[]>([])
  const [loading, setLoading]   = useState(true)
  const [myJobId, setMyJobId]   = useState<string | null>(null)
  const myJobIdRef = useRef<string | null>(null)

  // ── Load open jobs ───────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })
        .limit(50)
      setJobs(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // ── Supabase Realtime ─────────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel('job-board')
      .on<Job>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        (payload) => {
          // New job posted — prepend to board
          if (payload.new.status === 'open') {
            setJobs((prev) => [payload.new, ...prev])
          }
        }
      )
      .on<Job>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs' },
        (payload) => {
          const updated = payload.new
          setJobs((prev) =>
            prev.map((j) => (j.id === updated.id ? { ...j, ...updated } : j))
          )
          // If this driver cancelled and job went back to open — keep visible
          // If another driver cancelled and job is open again — it stays on board
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
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
    const json = await res.json() as { job?: Job; error?: string; code?: string }
    if (res.status === 409) throw new Error('ALREADY_ACCEPTED')
    if (!res.ok) throw new Error(json.error ?? 'accept failed')
    myJobIdRef.current = jobId
    setMyJobId(jobId)
    // Update the local job record with driver details
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
    const json = await res.json() as { job?: Job; error?: string }
    if (!res.ok) throw new Error(json.error ?? 'cancel failed')
    myJobIdRef.current = null
    setMyJobId(null)
    // Job goes back to open — update locally
    if (json.job) {
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, ...json.job, status: 'open', driver_id: null } : j))
    }
  }, [])

  if (loading) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
        <div className="live-dot" style={{ margin: '0 auto 12px' }} />
        <p className="muted">Loading jobs…</p>
      </div>
    )
  }

  const openJobs = jobs.filter((j) => j.status === 'open' || j.id === myJobId)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div className="live-dot" />
        <span style={{ fontWeight: 700, color: '#10b981', fontSize: 13 }}>LIVE JOBS</span>
        <span className="muted" style={{ fontSize: 12 }}>— updates in real time</span>
      </div>

      {openJobs.length === 0 ? (
        <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40 }}>🕐</div>
          <p style={{ fontWeight: 700, marginTop: 8 }}>No open jobs right now</p>
          <p className="muted">New requests will appear here instantly.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {openJobs.map((job) => (
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
