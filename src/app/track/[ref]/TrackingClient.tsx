'use client'

/**
 * Customer live tracking page — polls /api/jobs/[id]/status every 6 seconds.
 * No Supabase, no external dependencies — pure fetch + setInterval.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react'
import type { SafeJob, JobStatus } from '@/lib/job-types'
import { directionsUrl, fetchRoute } from '@/lib/maps'

// ── Status display config ─────────────────────────────────────────────────────
/* Status icons — stroke SVGs, 20×20 */
const StatusIcons: Record<JobStatus, React.ReactNode> = {
  open:                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  accepted:            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>,
  driver_en_route:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  picked_up:           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  completed:           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  cancelled_by_rider:  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  cancelled_by_driver: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
}

const STATUS_META: Record<JobStatus, { label: string; color: string; done: boolean }> = {
  open:                 { label: 'Looking for a driver…',                    color: '#f59e0b', done: false },
  accepted:             { label: 'Driver assigned!',                          color: '#10b981', done: false },
  driver_en_route:      { label: 'Driver on the way',                         color: '#3b82f6', done: false },
  picked_up:            { label: 'En route to drop-off',                      color: '#8b5cf6', done: false },
  completed:            { label: 'Completed!',                                color: '#10b981', done: true  },
  cancelled_by_rider:   { label: 'Cancelled by you',                          color: '#ef4444', done: true  },
  cancelled_by_driver:  { label: 'Driver cancelled — finding a new one…',     color: '#f59e0b', done: false },
}

const STEPS: JobStatus[] = ['open', 'accepted', 'driver_en_route', 'picked_up', 'completed']

function stepIndex(s: JobStatus) {
  const i = STEPS.indexOf(s)
  return i === -1 ? 0 : i
}

// ── Map with route polyline + A/B pins ───────────────────────────────────────
function JobMap({ job }: { job: SafeJob }) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)
  const routeLine   = useRef<import('leaflet').Polyline | null>(null)

  const from = { lat: job.pickup_lat,  lon: job.pickup_lon,  label: job.pickup_label  }
  const to   = { lat: job.dropoff_lat, lon: job.dropoff_lon, label: job.dropoff_label }

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    import('leaflet').then(async (L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: '/leaflet/images/marker-icon-2x.png',
        iconUrl:       '/leaflet/images/marker-icon.png',
        shadowUrl:     '/leaflet/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      const mkPin = (color: string, letter: string) => L.divIcon({
        className: '',
        html: `<div style="width:32px;height:40px;background:${color};border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35)"><div style="transform:rotate(45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">${letter}</div></div>`,
        iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42],
      })

      const pickupLatLng:  [number, number] = [from.lat, from.lon]
      const dropoffLatLng: [number, number] = [to.lat,   to.lon  ]

      L.marker(pickupLatLng,  { icon: mkPin('#22c55e', 'A') }).addTo(map).bindPopup(`<strong>A · Pickup</strong><br>${from.label}`)
      L.marker(dropoffLatLng, { icon: mkPin('#ef4444', 'B') }).addTo(map).bindPopup(`<strong>B · Drop-off</strong><br>${to.label}`)

      // Straight fallback line immediately so map isn't empty while route loads
      const straight = L.polyline([pickupLatLng, dropoffLatLng], {
        color: '#3b82f6', weight: 3, opacity: 0.4, dashArray: '8 6',
      }).addTo(map)
      map.fitBounds([pickupLatLng, dropoffLatLng], { padding: [50, 50], maxZoom: 15 })

      // Fetch OSRM driving route and replace straight line
      try {
        const coords = await fetchRoute(from, to)
        if (coords.length > 1 && mapInstance.current) {
          straight.remove()
          routeLine.current = L.polyline(coords, {
            color: '#1d4ed8', weight: 5, opacity: 0.85,
          }).addTo(map)
          map.fitBounds(routeLine.current.getBounds(), { padding: [50, 50], maxZoom: 15 })
        }
      } catch { /* keep straight dashed line */ }
    })

    return () => { mapInstance.current?.remove(); mapInstance.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const openInMaps = () => {
    window.open(directionsUrl(from, to), '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ height: 300, borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--border)' }} />

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 48, left: 10, background: 'white', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 600, display: 'flex', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 1000 }}>
        <span style={{ color: '#22c55e' }}>● A Pickup</span>
        <span style={{ color: '#ef4444' }}>● B Drop-off</span>
      </div>

      {/* Open in Maps button */}
      <button
        onClick={openInMaps}
        style={{
          position: 'absolute', bottom: 10, left: 10, zIndex: 1000,
          background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8,
          padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 8px rgba(0,0,0,.25)',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        Open in Maps
      </button>
    </div>
  )
}

// ── Progress stepper ──────────────────────────────────────────────────────────
function Stepper({ status }: { status: JobStatus }) {
  const current = stepIndex(status)
  const labels = ['Request sent', 'Driver assigned', 'En route', 'Picked up', 'Completed']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, margin: '20px 0' }}>
      {STEPS.map((s, i) => {
        const done   = i < current
        const active = i === current
        const future = i > current
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? '#10b981' : active ? '#12343b' : '#e5e7eb', color: done || active ? '#fff' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> : i + 1}
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, textAlign: 'center', maxWidth: 56, color: active ? '#12343b' : future ? '#9ca3af' : '#6b7280', lineHeight: 1.2 }}>
                {labels[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: done ? '#10b981' : '#e5e7eb', margin: '0 4px 18px' }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function TrackingClient({ initialJob }: { initialJob: SafeJob }) {
  const [job, setJob] = useState<SafeJob>(initialJob)
  const meta    = STATUS_META[job.status] ?? STATUS_META.open
  const metaIcon = StatusIcons[job.status] ?? StatusIcons.open

  const [cancelling, setCancelling]     = useState(false)
  const [cancelError, setCancelError]   = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  const handleCancelConfirmed = useCallback(async () => {
    setConfirmCancel(false)
    setCancelling(true)
    const res = await fetch(`/api/jobs/${job.id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ by: 'rider', reason: 'Cancelled by rider via tracking page' }),
    })
    const json = await res.json() as { job?: SafeJob; error?: string }
    if (!res.ok) { setCancelError(json.error ?? 'Could not cancel'); setCancelling(false); return }
    if (json.job) setJob(json.job)
    setCancelling(false)
  }, [job.id])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Polling — every 6 seconds ─────────────────────────────────────────────
  useEffect(() => {
    if (job.status === 'completed' || job.status === 'cancelled_by_rider') return

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/jobs/${job.id}/status`)
        if (!res.ok) return
        const data = await res.json() as { job?: SafeJob }
        if (data.job) setJob(data.job)
      } catch { /* ignore network blips */ }
    }, 6_000)

    return () => clearInterval(timer)
  }, [job.id, job.status])

  const fare      = job.fare_estimate ? `₹${Math.round(job.fare_estimate / 100).toLocaleString('en-IN')}` : null
  const canCancel = job.status === 'open' || job.status === 'accepted'

  return (
    <div className="container" style={{ maxWidth: 680 }}>
      {/* Header */}
      <div className="panel" style={{ marginBottom: 16, borderLeft: `4px solid ${meta.color}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.6px', color: 'var(--text-3)' }}>
              {job.mode === 'ride' ? 'Ride' : 'Delivery'} request
            </span>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--night-d)', margin: '4px 0 2px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: meta.color }}>{metaIcon}</span>
              {meta.label}
            </h1>
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace' }}>{job.ref}</span>
          </div>
          {!meta.done && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>LIVE</span>
            </div>
          )}
        </div>

        <Stepper status={job.status} />

        {/* Driver card — shown once accepted */}
        {(job.status === 'accepted' || job.status === 'driver_en_route' || job.status === 'picked_up') && job.driver_name && (
          <div className="track-driver-card">
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{job.driver_name}</div>
              {job.driver_vehicle && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>{job.driver_vehicle}</div>}
              {job.driver_phone && (
                <a href={`tel:${job.driver_phone}`} style={{ fontSize: 13, color: 'var(--night)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.56 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Call driver
                </a>
              )}
            </div>
          </div>
        )}

        {canCancel && (
          <div style={{ marginTop: 12 }}>
            {cancelError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{cancelError}</p>}
            {!confirmCancel ? (
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setConfirmCancel(true)}
                disabled={cancelling}
                style={{ color: '#ef4444', borderColor: '#ef4444' }}
              >
                {cancelling ? 'Cancelling…' : 'Cancel this job'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', margin: 0 }}>
                  Are you sure you want to cancel?
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm" style={{ flex: 1, color: '#ef4444', borderColor: '#ef4444' }} onClick={handleCancelConfirmed}>
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
      </div>

      {/* Map */}
      <div className="panel" style={{ padding: 12, marginBottom: 16 }}>
        <JobMap job={job} />
        <div style={{ display: 'flex', gap: 8, marginTop: 10, fontSize: 13 }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '.5px' }}>▲ A · Pickup</span>
            <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--night-d)' }}>{job.pickup_label}</p>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '.5px' }}>▼ B · Drop-off</span>
            <p style={{ margin: '2px 0 0', fontWeight: 600, color: 'var(--night-d)' }}>{job.dropoff_label}</p>
          </div>
        </div>
      </div>

      {/* Job details */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 12 }}>Job details</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
          {job.distance_km && <div><span style={{ color: 'var(--text-3)' }}>Distance</span><br /><strong>~{job.distance_km.toFixed(1)} km</strong></div>}
          {fare             && <div><span style={{ color: 'var(--text-3)' }}>Est. fare</span><br /><strong>{fare}</strong></div>}
          <div><span style={{ color: 'var(--text-3)' }}>Vehicle</span><br /><strong>{job.vehicle_id}</strong></div>
          <div><span style={{ color: 'var(--text-3)' }}>When</span><br /><strong>{job.scheduled_at ? new Date(job.scheduled_at).toLocaleString('en-IN') : 'ASAP'}</strong></div>
        </div>
        {job.notes && <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}><span style={{ color: 'var(--text-3)' }}>Notes: </span>{job.notes}</div>}
      </div>

      {/* Final banners */}
      {job.status === 'completed'          && <div className="banner banner-ok"   role="status">Job completed! Pay your driver directly — cash or UPI. My KKR takes ₹0 commission.</div>}
      {job.status === 'cancelled_by_rider' && <div className="banner banner-err"  role="status">You cancelled this job.</div>}
      {job.status === 'cancelled_by_driver'&& <div className="banner banner-warn" role="status">Your driver cancelled. The job is back live — another driver will pick it up shortly.</div>}

      <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>
        This page updates live. Pay the driver directly — My KKR takes zero commission.
      </p>
    </div>
  )
}
