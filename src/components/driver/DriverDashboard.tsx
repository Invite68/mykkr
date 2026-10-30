'use client'

/**
 * DriverDashboard — top-level driver app.
 *
 * Handles:
 *  - Firebase auth check on mount (gets ID token + UID)
 *  - Fetches driver profile from /api/auth/me (name, vehicle)
 *  - If driver has an active job → shows ActiveJob view
 *  - Otherwise → shows JobBoard (live SSE feed of open jobs)
 *
 * The JobBoard's onAccept callback stores the accepted job here so
 * we switch to ActiveJob immediately without a page reload.
 */

import { useEffect, useState, useCallback } from 'react'
import { getFirebaseAuth } from '@/lib/firebase-client'
import type { SafeJob } from '@/lib/job-types'
import JobBoard from '@/components/driver/JobBoard'
import ActiveJob from '@/components/driver/ActiveJob'

interface DriverProfile {
  full_name:      string
  vehicle_type:   string
  vehicle_number: string
  vehicle_model:  string | null
}

type AuthState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'ready'; uid: string; idToken: string; profile: DriverProfile | null }

export default function DriverDashboard() {
  const [auth, setAuth]           = useState<AuthState>({ status: 'loading' })
  const [activeJob, setActiveJob] = useState<SafeJob | null>(null)
  const [checkingJob, setCheckingJob] = useState(false)

  // ── Initialise Firebase auth + load driver profile ────────────────────────
  useEffect(() => {
    const unsub = getFirebaseAuth().onAuthStateChanged(async (user) => {
      if (!user) {
        setAuth({ status: 'unauthenticated' })
        return
      }

      try {
        const idToken = await user.getIdToken()

        // Fetch driver profile (name, vehicle) from DB
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${idToken}` },
        })
        let profile: DriverProfile | null = null
        if (res.ok) {
          const data = await res.json() as {
            exists?: boolean
            profile?: { full_name?: string; vehicle_type?: string; vehicle_number?: string; vehicle_model?: string }
          }
          if (data.exists && data.profile?.full_name) {
            profile = {
              full_name:      data.profile.full_name      ?? '',
              vehicle_type:   data.profile.vehicle_type   ?? '',
              vehicle_number: data.profile.vehicle_number ?? '',
              vehicle_model:  data.profile.vehicle_model  ?? null,
            }
          }
        }

        // Check if this driver has an active job (accepted/en-route/picked_up)
        setCheckingJob(true)
        try {
          const jobRes = await fetch('/api/driver/active-job', {
            headers: { Authorization: `Bearer ${idToken}` },
          })
          if (jobRes.ok) {
            const jobData = await jobRes.json() as { job?: SafeJob }
            if (jobData.job) setActiveJob(jobData.job)
          }
        } finally {
          setCheckingJob(false)
        }

        setAuth({ status: 'ready', uid: user.uid, idToken, profile })
      } catch {
        setAuth({ status: 'unauthenticated' })
      }
    })
    return () => unsub()
  }, [])

  // Called by JobBoard when driver accepts a job
  const handleJobAccepted = useCallback((job: SafeJob) => {
    setActiveJob(job)
  }, [])

  // Called by ActiveJob when driver updates status
  const handleJobUpdated = useCallback((updated: SafeJob) => {
    setActiveJob(updated)
    if (updated.status === 'completed' || updated.status.startsWith('cancelled')) {
      // After a brief delay so the driver sees the completion banner, clear the active job
      setTimeout(() => setActiveJob(null), 3000)
    }
  }, [])

  // Called by ActiveJob when driver cancels
  const handleJobCancelled = useCallback(() => {
    setActiveJob(null)
  }, [])

  // ── Loading state ─────────────────────────────────────────────────────────
  if (auth.status === 'loading' || checkingJob) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ animation: 'spin 1s linear infinite', color: 'var(--text-3)', marginBottom: 12 }}><circle cx="12" cy="12" r="10" strokeOpacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <p className="muted">Loading your dashboard…</p>
      </div>
    )
  }

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (auth.status === 'unauthenticated') {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: 'var(--text-3)', marginBottom: 12 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Sign in to start earning</p>
        <p className="muted" style={{ marginBottom: 20 }}>Use your registered driver phone number.</p>
        <a href="/register?role=driver" className="btn btn-primary">
          Sign in as driver
        </a>
      </div>
    )
  }

  // ── Profile incomplete ────────────────────────────────────────────────────
  if (!auth.profile) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ color: '#f59e0b', marginBottom: 12 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <p style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Complete your driver profile</p>
        <p className="muted" style={{ marginBottom: 20 }}>Add your name and vehicle details to start accepting jobs.</p>
        <a href="/register?role=driver&step=profile" className="btn btn-primary">
          Complete profile
        </a>
      </div>
    )
  }

  const { uid, idToken, profile } = auth
  const vehicleLabel = [profile.vehicle_model, profile.vehicle_number].filter(Boolean).join(' · ')

  return (
    <div>
      {/* Driver identity strip */}
      <div className="driver-identity-strip">
        <div className="driver-identity-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div>
          <div className="driver-identity-name">{profile.full_name}</div>
          <div className="driver-identity-vehicle">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            {profile.vehicle_type}
            {vehicleLabel && <span className="muted"> · {vehicleLabel}</span>}
          </div>
        </div>
        <div className="driver-identity-online">
          <div className="live-dot" />
          <span>Online</span>
        </div>
      </div>

      {/* Active job (if any) */}
      {activeJob && (
        <div style={{ marginBottom: 24 }}>
          <h2 className="section-label" style={{ marginBottom: 10 }}>Your current job</h2>
          <ActiveJob
            job={activeJob}
            idToken={idToken}
            myUid={uid}
            onUpdated={handleJobUpdated}
            onCancelled={handleJobCancelled}
          />
        </div>
      )}

      {/* Job board — always visible but visually secondary when active job exists */}
      <div style={{ opacity: activeJob ? 0.5 : 1, pointerEvents: activeJob ? 'none' : 'auto', transition: 'opacity .2s' }}>
        {activeJob && (
          <div className="banner banner-info" style={{ marginBottom: 12 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>Complete your current job before accepting a new one.</span>
          </div>
        )}
        <h2 className="section-label" style={{ marginBottom: 10 }}>Available jobs</h2>
        <JobBoard
          driverName={profile.full_name}
          driverPhone=""
          driverVehicle={`${profile.vehicle_type}${vehicleLabel ? ' ' + vehicleLabel : ''}`}
          onAccepted={handleJobAccepted}
          disabled={!!activeJob}
        />
      </div>
    </div>
  )
}
