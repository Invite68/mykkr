'use client'

/**
 * Customer live tracking page — polls /api/jobs/[id]/status every 6 seconds.
 * No Supabase, no external dependencies — pure fetch + setInterval.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import type { SafeJob, JobStatus } from '@/lib/job-types'

// ── Status display config ─────────────────────────────────────────────────────
const STATUS_META: Record<JobStatus, { label: string; color: string; icon: string; done: boolean }> = {
  open:                 { label: 'Looking for a driver…',                    color: '#f59e0b', icon: '🔍', done: false },
  accepted:             { label: 'Driver assigned!',                          color: '#10b981', icon: '✅', done: false },
  driver_en_route:      { label: 'Driver on the way',                         color: '#3b82f6', icon: '🚗', done: false },
  picked_up:            { label: 'En route to drop-off',                      color: '#8b5cf6', icon: '📦', done: false },
  completed:            { label: 'Completed!',                                color: '#10b981', icon: '🎉', done: true  },
  cancelled_by_rider:   { label: 'Cancelled by you',                          color: '#ef4444', icon: '✖',  done: true  },
  cancelled_by_driver:  { label: 'Driver cancelled — finding a new one…',     color: '#f59e0b', icon: '⚠️', done: false },
}

const STEPS: JobStatus[] = ['open', 'accepted', 'driver_en_route', 'picked_up', 'completed']

function stepIndex(s: JobStatus) {
  const i = STEPS.indexOf(s)
  return i === -1 ? 0 : i
}

// ── Map with green/red Leaflet pins ───────────────────────────────────────────
function JobMap({ job }: { job: SafeJob }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Green pin — Pickup (A)
      const greenIcon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:40px;background:#22c55e;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35)"><div style="transform:rotate(45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">A</div></div>`,
        iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42],
      })

      // Red pin — Drop-off (B)
      const redIcon = L.divIcon({
        className: '',
        html: `<div style="width:32px;height:40px;background:#ef4444;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.35)"><div style="transform:rotate(45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff">B</div></div>`,
        iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -42],
      })

      const pickupLatLng:  [number, number] = [job.pickup_lat,  job.pickup_lon]
      const dropoffLatLng: [number, number] = [job.dropoff_lat, job.dropoff_lon]

      L.marker(pickupLatLng,  { icon: greenIcon }).addTo(map).bindPopup(`<strong>🟢 Pickup</strong><br>${job.pickup_label}`)
      L.marker(dropoffLatLng, { icon: redIcon   }).addTo(map).bindPopup(`<strong>🔴 Drop-off</strong><br>${job.dropoff_label}`)

      map.fitBounds([pickupLatLng, dropoffLatLng], { padding: [40, 40], maxZoom: 15 })
    })

    return () => { mapInstance.current?.remove(); mapInstance.current = null }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapRef} style={{ height: 280, borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--border)' }} />
      <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'white', borderRadius: 8, padding: '6px 10px', fontSize: 12, fontWeight: 600, display: 'flex', gap: 10, boxShadow: '0 2px 8px rgba(0,0,0,.15)', zIndex: 1000 }}>
        <span style={{ color: '#22c55e' }}>● A Pickup</span>
        <span style={{ color: '#ef4444' }}>● B Drop-off</span>
      </div>
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
                {done ? '✓' : i + 1}
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
  const meta = STATUS_META[job.status] ?? STATUS_META.open

  const [cancelling, setCancelling]   = useState(false)
  const [cancelError, setCancelError] = useState('')

  const handleCancel = useCallback(async () => {
    if (!confirm('Cancel this job?')) return
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
  }, [job.id])

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
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--night-d)', margin: '4px 0 2px' }}>
              {meta.icon} {meta.label}
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
            <div style={{ fontSize: 36 }}>🧑‍✈️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{job.driver_name}</div>
              {job.driver_vehicle && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>{job.driver_vehicle}</div>}
              {job.driver_phone && (
                <a href={`tel:${job.driver_phone}`} style={{ fontSize: 13, color: 'var(--night)', fontWeight: 700, display: 'block', marginTop: 4 }}>
                  📞 Call driver
                </a>
              )}
            </div>
          </div>
        )}

        {canCancel && (
          <div style={{ marginTop: 12 }}>
            {cancelError && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{cancelError}</p>}
            <button className="btn btn-outline btn-sm" onClick={handleCancel} disabled={cancelling} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
              {cancelling ? 'Cancelling…' : '✖ Cancel this job'}
            </button>
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
      {job.status === 'completed'          && <div className="banner banner-ok"   role="status">🎉 Job completed! Pay your driver directly — cash or UPI. My KKR takes ₹0 commission.</div>}
      {job.status === 'cancelled_by_rider' && <div className="banner banner-err"  role="status">✖ You cancelled this job.</div>}
      {job.status === 'cancelled_by_driver'&& <div className="banner banner-warn" role="status">⚠️ Your driver cancelled. The job is back live — another driver will pick it up shortly.</div>}

      <p className="muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>
        This page updates live. Pay the driver directly — My KKR takes zero commission.
      </p>
    </div>
  )
}
