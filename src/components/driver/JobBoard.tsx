'use client'

/**
 * Driver Job Board — real-time feed of open jobs via Server-Sent Events.
 *
 * Auth flow:
 *   1. On mount, POST /api/jobs/stream-token with Firebase Bearer token
 *      → receive short-lived signed token (5 min TTL)
 *   2. Open EventSource with ?token=<signed-token>
 *      (EventSource doesn't support Authorization headers)
 *   3. Auto-refresh token before expiry and reconnect SSE
 *   4. Accept/cancel use Firebase Bearer token via Authorization header (normal)
 *
 * Lifecycle:
 *   1. Connects to GET /api/jobs/stream?token=... (SSE)
 *   2. Receives initial snapshot of open jobs + live updates
 *   3. Driver taps Accept → POST /api/jobs/[id]/accept (atomic)
 *      → 200: job is yours
 *      → 409: race lost — someone else accepted first
 *   4. Driver can cancel accepted job → job goes back live for others
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { SafeJob, JobEvent } from '@/lib/job-types'

// ── Firebase auth integration ──────────────────────────────────────────────────
// getIdToken() returns the current user's Firebase ID token (auto-refreshed).
// Returns null if the user is not signed in (shouldn't happen on driver page).
async function getIdToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  try {
    // Dynamic import to avoid SSR — firebase/auth is client-only
    const { getAuth } = await import('firebase/auth')
    const user = getAuth().currentUser
    if (!user) return null
    return user.getIdToken(/* forceRefresh */ false)
  } catch {
    return null
  }
}

// ── Stream token exchange ─────────────────────────────────────────────────────
// Exchange a Firebase ID token for a short-lived SSE stream token.
// Returns { token, expiresInMs } or null on failure.
async function fetchStreamToken(): Promise<{ token: string; expiresInMs: number } | null> {
  try {
    const idToken = await getIdToken()
    if (!idToken) return null
    const res = await fetch('/api/jobs/stream-token', {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    })
    if (!res.ok) return null
    return res.json() as Promise<{ token: string; expiresInMs: number }>
  } catch {
    return null
  }
}

// ── Driver identity from Firebase ─────────────────────────────────────────────
// These are filled from the driver's saved profile (set during registration).
// Falls back to generic placeholders — the real values come from Firebase.
interface DriverInfo {
  name:    string
  phone:   string
  vehicle: string
}

async function getDriverInfo(): Promise<DriverInfo> {
  try {
    const { getAuth } = await import('firebase/auth')
    const user = getAuth().currentUser
    return {
      name:    user?.displayName ?? 'Driver',
      phone:   user?.phoneNumber ?? '',
      vehicle: 'Vehicle',   // pulled from driver profile on first accept
    }
  } catch {
    return { name: 'Driver', phone: '', vehicle: 'Vehicle' }
  }
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
      {taken && <div className="job-ribbon job-ribbon--taken">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Taken
      </div>}
      {mine  && <div className="job-ribbon job-ribbon--mine">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Your job
      </div>}

      <div className="job-card-header">
        <span className="job-mode-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {job.mode === 'ride'
            ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Ride</>
            : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Delivery</>
          }
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
        {job.distance_km && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>~{job.distance_km.toFixed(1)} km</span>}
        {fare             && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>{fare} est.</span>}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>{job.vehicle_id}</span>
        {job.scheduled_at && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>{new Date(job.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        )}
      </div>

      {job.notes && <p className="job-notes">{job.notes}</p>}

      {/* Customer contact — only visible to the driver who accepted */}
      {mine && (
        <div className="job-contact">
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {job.customer_name}
          </strong>
          {job.driver_phone && (
            <a href={`tel:${job.driver_phone}`} className="btn btn-sm btn-outline" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.92 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call rider
            </a>
          )}
        </div>
      )}

      {err && <p className="job-err">{err}</p>}

      <div className="job-actions">
        {!taken && !mine && (
          <button className="btn btn-primary btn-block" disabled={busy} onClick={handleAccept}>
            {state === 'accepting'
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg> Accepting…</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Accept job</>
            }
          </button>
        )}
        {mine && !confirmCancel && (
          <>
            <a href={`/track/${job.ref}`} className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              View map
            </a>
            <button
              className="btn btn-ghost btn-sm"
              style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              disabled={busy}
              onClick={() => setConfirmCancel(true)}
            >
              {cancelling
                ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" /></svg>…</>
                : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Cancel</>
              }
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
  const [jobs, setJobs]           = useState<SafeJob[]>([])
  const [connected, setConnected] = useState(false)
  const [authed, setAuthed]       = useState(true)   // false = no Firebase user
  const [myJobId, setMyJobId]     = useState<string | null>(null)
  const esRef    = useRef<EventSource | null>(null)
  const tokenRef = useRef<string | null>(null)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── SSE connection with token auth ────────────────────────────────────────
  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout>
    let mounted = true

    async function connect() {
      if (!mounted) return

      // Step 1: get a short-lived stream token
      const result = await fetchStreamToken()
      if (!result) {
        // Not signed in or server error — show auth prompt
        setAuthed(false)
        return
      }

      setAuthed(true)
      tokenRef.current = result.token

      // Step 2: schedule a token refresh at 80% of TTL (avoid expiry during stream)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = setTimeout(() => {
        // Reconnect with a fresh token
        esRef.current?.close()
        void connect()
      }, result.expiresInMs * 0.8)

      // Step 3: open SSE with token in query param
      const url = `/api/jobs/stream?token=${encodeURIComponent(result.token)}`
      const es  = new EventSource(url)
      esRef.current = es

      es.onopen = () => setConnected(true)

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data as string) as JobEvent
          if (event.type === 'ping') return
          if (event.type === 'error') {
            if (event.code === 'UNAUTHORIZED') {
              // Token expired mid-stream — reconnect
              es.close()
              retryTimer = setTimeout(() => void connect(), 500)
            }
            return
          }

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
        // Exponential back-off capped at 10s
        retryTimer = setTimeout(() => void connect(), 3_000)
      }
    }

    void connect()

    return () => {
      mounted = false
      clearTimeout(retryTimer)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      esRef.current?.close()
    }
  }, [])

  // ── Auth helper for API calls ─────────────────────────────────────────────
  async function authHeaders(): Promise<HeadersInit> {
    const idToken = await getIdToken()
    return idToken
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` }
      : { 'Content-Type': 'application/json' }
  }

  // ── Accept ────────────────────────────────────────────────────────────────
  const handleAccept = useCallback(async (jobId: string) => {
    const driver = await getDriverInfo()
    const res = await fetch(`/api/jobs/${jobId}/accept`, {
      method: 'POST',
      headers: await authHeaders(),
      body: JSON.stringify({
        // driverId comes from auth.uid server-side — NOT from body
        driverName:    driver.name,
        driverPhone:   driver.phone,
        driverVehicle: driver.vehicle,
      }),
    })
    const json = await res.json() as { job?: SafeJob; error?: string; code?: string }
    if (res.status === 409) throw new Error('ALREADY_ACCEPTED')
    if (!res.ok) throw new Error(json.error ?? 'accept failed')
    setMyJobId(jobId)
    if (json.job) {
      setJobs((prev) => prev.map((j) => j.id === jobId ? { ...j, ...json.job } : j))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Cancel ────────────────────────────────────────────────────────────────
  const handleCancel = useCallback(async (jobId: string) => {
    const res = await fetch(`/api/jobs/${jobId}/cancel`, {
      method: 'POST',
      headers: await authHeaders(),
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleJobs = jobs.filter((j) => j.status === 'open' || j.id === myJobId)

  // Not signed in — Firebase Auth not ready yet
  if (!authed) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 40 }}>
        <div style={{ color: 'var(--text-3)', marginBottom: 8 }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
        <p style={{ fontWeight: 700, marginTop: 8 }}>Sign in to see jobs</p>
        <p className="muted">Please sign in with your driver account to view and accept jobs.</p>
        <a href="/login?role=driver" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
          Sign in
        </a>
      </div>
    )
  }

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
          <div style={{ color: 'var(--text-3)', marginBottom: 8 }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
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
