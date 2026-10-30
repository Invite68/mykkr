'use client'

/**
 * Driver Dashboard — /dashboard/driver
 *
 * Two tabs: Available jobs (open, waiting to be accepted) + My active/history jobs.
 * Driver clicks "Accept" → atomic accept API → redirected to job detail page.
 */

import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, getAuth } from 'firebase/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Job {
  id: string
  ref: string
  mode: string
  status: string
  customer_name: string
  pickup_label: string
  dropoff_label: string
  distance_km: number | null
  fare_accepted_paise: number | null
  notes: string | null
  scheduled_at: string | null
  driver_id: string | null
  driver_name: string | null
  created_at: string
  accepted_at: string | null
}

type Tab = 'available' | 'mine'
type State = 'loading' | 'unauth' | 'ready' | 'error'

const STATUS_LABEL: Record<string, string> = {
  open:            'Open',
  accepted:        'Accepted',
  driver_en_route: 'En Route',
  picked_up:       'Picked Up',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

function formatKm(km: number | null) {
  if (km == null) return '—'
  return `${km.toFixed(1)} km`
}

function formatRupees(paise: number | null) {
  if (paise == null) return '—'
  return `₹${(paise / 100).toFixed(0)}`
}

function timeAgo(iso: string) {
  const secs = (Date.now() - new Date(iso).getTime()) / 1000
  if (secs < 60) return 'just now'
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`
  return `${Math.floor(secs / 3600)}h ago`
}

export default function DriverDashboard() {
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [tab, setTab] = useState<Tab>('available')
  const [available, setAvailable] = useState<Job[]>([])
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [acceptError, setAcceptError] = useState<Record<string, string>>({})

  const loadAvailable = useCallback(async (token: string) => {
    const res = await fetch('/api/jobs', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to load jobs')
    const data = await res.json() as { jobs: Job[] }
    setAvailable(data.jobs)
  }, [])

  const loadMyJobs = useCallback(async (token: string) => {
    const res = await fetch('/api/driver/jobs', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('Failed to load my jobs')
    const data = await res.json() as { jobs: Job[] }
    setMyJobs(data.jobs)
  }, [])

  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { setState('unauth'); return }
      setUid(user.uid)
      try {
        const token = await user.getIdToken()
        setIdToken(token)
        await Promise.all([loadAvailable(token), loadMyJobs(token)])
        setState('ready')
      } catch {
        setState('error')
      }
    })
    return unsub
  }, [loadAvailable, loadMyJobs])

  // Poll available jobs every 20s
  useEffect(() => {
    if (state !== 'ready' || !idToken) return
    const t = setInterval(() => loadAvailable(idToken).catch(console.error), 20_000)
    return () => clearInterval(t)
  }, [state, idToken, loadAvailable])

  async function acceptJob(job: Job) {
    if (!idToken || !uid) return
    setAcceptingId(job.id)
    setAcceptError(prev => ({ ...prev, [job.id]: '' }))

    // Get driver details from Firebase profile (simplified: use displayName or ask)
    const auth = getAuth()
    const user = auth.currentUser
    const driverName    = user?.displayName ?? 'Driver'
    const driverPhone   = user?.phoneNumber ?? '0000000000'
    const driverVehicle = 'Auto'   // TODO: pull from driver profile

    try {
      const res = await fetch(`/api/jobs/${job.id}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverName, driverPhone, driverVehicle }),
      })

      if (res.status === 409) {
        setAcceptError(prev => ({ ...prev, [job.id]: 'Another driver was faster. Try another job.' }))
        // Refresh available list
        await loadAvailable(idToken)
        return
      }
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        setAcceptError(prev => ({ ...prev, [job.id]: d.error ?? 'Could not accept' }))
        return
      }

      const data = await res.json() as { job: { id: string } }
      router.push(`/dashboard/driver/jobs/${data.job.id}`)
    } catch {
      setAcceptError(prev => ({ ...prev, [job.id]: 'Network error. Try again.' }))
    } finally {
      setAcceptingId(null)
    }
  }

  if (state === 'loading') return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 60, textAlign: 'center' }}>
      <p className="muted">Loading…</p>
    </div>
  )

  if (state === 'unauth') return (
    <div className="container" style={{ maxWidth: 480, paddingTop: 80, textAlign: 'center' }}>
      <p className="muted" style={{ marginBottom: 16 }}>Sign in as a driver to continue.</p>
      <Link href="/auth/login" className="btn btn-primary">Sign In</Link>
    </div>
  )

  if (state === 'error') return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 60 }}>
      <div className="alert alert-error">Failed to load dashboard. <button className="btn btn-outline" style={{ marginLeft: 8 }} onClick={() => window.location.reload()}>Retry</button></div>
    </div>
  )

  const activeMyJobs = myJobs.filter(j => !['completed', 'cancelled'].includes(j.status))
  const pastMyJobs   = myJobs.filter(j => ['completed', 'cancelled'].includes(j.status))

  return (
    <div className="container" style={{ maxWidth: 720, paddingTop: 32, paddingBottom: 80 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--night-d)' }}>Driver Dashboard</h1>
        <p className="muted" style={{ fontSize: 13, marginTop: 4 }}>Accept jobs and earn. All payments are between you and the customer.</p>
      </div>

      {/* Active jobs banner */}
      {activeMyJobs.length > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--blue-l)', borderRadius: 'var(--r)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, color: '#1e40af', fontWeight: 600 }}>
            You have {activeMyJobs.length} active job{activeMyJobs.length > 1 ? 's' : ''}
          </span>
          <Link href={`/dashboard/driver/jobs/${activeMyJobs[0].id}`} className="btn btn-primary" style={{ fontSize: 12, padding: '6px 14px' }}>
            Resume
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {([['available', 'Available Jobs'], ['mine', 'My Jobs']] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
              background: 'transparent', color: tab === t ? 'var(--night-d)' : 'var(--text-3)',
              borderBottom: `2px solid ${tab === t ? 'var(--night-d)' : 'transparent'}`,
              marginBottom: -2,
            }}
          >
            {label}
            {t === 'available' && <span style={{ marginLeft: 6, fontSize: 11, background: 'var(--amber-l)', color: 'var(--amber)', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>{available.length}</span>}
          </button>
        ))}
      </div>

      {/* Available jobs tab */}
      {tab === 'available' && (
        <div>
          {available.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 16px' }} aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <p className="muted">No open jobs right now. Check back soon.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {available.map(job => (
                <div key={job.id} className="card" style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--night)' }}>{job.ref}</span>
                      <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>{timeAgo(job.created_at)}</span>
                    </div>
                    <span style={{ fontSize: 12, padding: '3px 8px', background: 'var(--amber-l)', color: 'var(--amber)', borderRadius: 10, fontWeight: 600 }}>
                      {job.mode === 'ride' ? 'Ride' : 'Delivery'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--green)', marginTop: 2, flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="8"/></svg>
                      </span>
                      <span>{job.pickup_label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ color: 'var(--red)', marginTop: 2, flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      </span>
                      <span>{job.dropoff_label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-3)', display: 'flex', gap: 12 }}>
                      <span>{formatKm(job.distance_km)}</span>
                      <span style={{ fontWeight: 700, color: 'var(--night-d)', fontSize: 15 }}>{formatRupees(job.fare_accepted_paise)}</span>
                    </div>
                    <div>
                      {acceptError[job.id] && <p style={{ fontSize: 11, color: 'var(--red)', marginBottom: 4 }}>{acceptError[job.id]}</p>}
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: 13, padding: '8px 20px' }}
                        onClick={() => acceptJob(job)}
                        disabled={acceptingId === job.id}
                      >
                        {acceptingId === job.id ? 'Accepting…' : 'Accept Job'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My jobs tab */}
      {tab === 'mine' && (
        <div>
          {myJobs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <p className="muted">No jobs yet. Accept one from the Available tab.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activeMyJobs.length > 0 && (
                <>
                  <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)' }}>Active</h2>
                  {activeMyJobs.map(job => (
                    <Link key={job.id} href={`/dashboard/driver/jobs/${job.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '16px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--night)' }}>{job.ref}</span>
                        <span style={{ fontSize: 11, padding: '3px 8px', background: 'var(--blue-l)', color: '#1d4ed8', borderRadius: 10, fontWeight: 600 }}>{STATUS_LABEL[job.status] ?? job.status}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>{job.pickup_label} → {job.dropoff_label}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
                        <span>{formatKm(job.distance_km)}</span>
                        <span style={{ fontWeight: 700, color: 'var(--night-d)' }}>{formatRupees(job.fare_accepted_paise)}</span>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              {pastMyJobs.length > 0 && (
                <>
                  <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-3)', marginTop: 8 }}>History</h2>
                  {pastMyJobs.map(job => (
                    <Link key={job.id} href={`/dashboard/driver/jobs/${job.id}`} className="card" style={{ display: 'block', textDecoration: 'none', color: 'inherit', padding: '14px 20px', opacity: 0.75 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace', color: 'var(--night)' }}>{job.ref}</span>
                        <span style={{ fontSize: 11, color: job.status === 'completed' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>{STATUS_LABEL[job.status] ?? job.status}</span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>{job.pickup_label} → {job.dropoff_label}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
                        <span>{timeAgo(job.created_at)}</span>
                        <span style={{ fontWeight: 700 }}>{formatRupees(job.fare_accepted_paise)}</span>
                      </div>
                    </Link>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
