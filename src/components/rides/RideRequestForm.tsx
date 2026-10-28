'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { IconRides, IconPackage } from '@/components/layout/NavIcons'
import { DELIVERY_VEHICLES, RIDE_VEHICLES } from '@/data/vehicles'
import { KKR_CENTER, findArea } from '@/data/areas'
import { estimateRoute, fareFor, mapsLinks, type LatLon, type RouteEstimate } from '@/lib/routing'
import { isValidIndianMobile, jobRef } from '@/lib/sanitize'

type Mode = 'ride' | 'deliver'

interface Point extends LatLon {
  label: string
}

/**
 * LocationField — text entry + HERE autocomplete + GPS + area picker.
 *
 * GPS flow:
 * 1. User clicks GPS button → browser asks permission
 * 2. On success → reverse-geocode via /api/maps/reverse (HERE) → fill input
 * 3. On denial → friendly fallback message
 *
 * Autocomplete flow:
 * 1. User types ≥3 chars → debounced call to /api/maps/geocode?mode=autocomplete
 * 2. Suggestions shown in dropdown — click to confirm location
 */
function LocationField({
  which,
  point,
  onChange,
  pinColor,
}: {
  which: 'pickup' | 'dropoff'
  point: Point | null
  onChange: (p: Point | null) => void
  pinColor: string
}) {
  const [text, setText] = useState('')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('')
  const [gpsLoading, setGpsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; address: string; lat?: number; lng?: number }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const label = which === 'pickup' ? 'Pickup' : 'Drop-off'

  // Keep input text in sync when parent clears point
  useEffect(() => {
    if (!point && !text) return
    if (!point) { setText(''); setArea(''); setSuggestions([]); setShowSuggestions(false) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [point])

  function pickArea(name: string) {
    setArea(name)
    setSuggestions([])
    setShowSuggestions(false)
    const a = findArea(name)
    if (a) {
      onChange({ lat: a.lat, lon: a.lon, label: a.name })
      setText(a.name)
    } else {
      onChange(null)
    }
    setStatus('')
  }

  async function fetchSuggestions(q: string) {
    if (q.length < 3) { setSuggestions([]); setShowSuggestions(false); return }
    try {
      const res = await fetch(`/api/maps/geocode?q=${encodeURIComponent(q + ' Kurukshetra Haryana')}&mode=autocomplete&lat=${KKR_CENTER.lat}&lng=${KKR_CENTER.lon}`)
      const data = await res.json() as { results?: Array<{ id: string; title: string; address: string; lat?: number; lng?: number }> }
      const hits = data.results ?? []
      setSuggestions(hits)
      setShowSuggestions(hits.length > 0)
    } catch { /* network error — silent */ }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setText(v)
    setStatus('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 280)
  }

  async function selectSuggestion(s: { id: string; title: string; address: string; lat?: number; lng?: number }) {
    setSuggestions([])
    setShowSuggestions(false)
    setText(s.address || s.title)
    setArea('')

    if (s.lat && s.lng) {
      onChange({ lat: s.lat, lon: s.lng, label: s.address || s.title })
      setStatus('Location set')
      return
    }

    // Need full lookup by HERE place ID
    setStatus('Getting exact location…')
    try {
      const res = await fetch(`/api/maps/lookup?id=${encodeURIComponent(s.id)}`)
      const data = await res.json() as { result?: { lat: number; lng: number; address: string } }
      if (data.result) {
        onChange({ lat: data.result.lat, lon: data.result.lng, label: data.result.address })
        setText(data.result.address)
        setStatus('Location set')
      } else {
        setStatus('Could not resolve location — try a different search.')
      }
    } catch {
      setStatus('Network error — try again.')
    }
  }

  /** GPS: browser permission → HERE reverse geocode */
  function useMyLocation() {
    if (!navigator.geolocation) {
      setStatus('GPS not supported — type the address or pick area below.')
      return
    }
    setGpsLoading(true)
    setStatus('Getting your location…')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(`/api/maps/reverse?lat=${lat}&lng=${lng}`)
          const data = await res.json() as { result?: { address: string; lat: number; lng: number } }
          if (data.result) {
            const loc = { lat: data.result.lat, lon: data.result.lng, label: data.result.address }
            onChange(loc)
            setText(data.result.address)
            setArea('')
            setStatus('Live location set')
          } else {
            const lbl = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            onChange({ lat, lon: lng, label: lbl })
            setText(lbl)
            setStatus('GPS coordinates set — address not found nearby')
          }
        } catch {
          const lbl = `${lat.toFixed(5)}, ${lng.toFixed(5)}`
          onChange({ lat, lon: lng, label: lbl })
          setText(lbl)
          setStatus('GPS coordinates set')
        }
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        const msgs: Record<number, string> = {
          1: 'Location access denied — type the address or pick an area below.',
          2: 'Location unavailable — try typing the address.',
          3: 'Location request timed out — try again.',
        }
        setStatus(msgs[err.code] ?? 'Could not get your location.')
      },
      { enableHighAccuracy: true, timeout: 12_000, maximumAge: 60_000 }
    )
  }

  const isSet = !!point

  return (
    <div className="field" style={{ position: 'relative' }}>
      <span className="label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Color dot for this pin */}
        <span style={{
          display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
          background: pinColor, border: '1.5px solid rgba(0,0,0,.25)', flexShrink: 0
        }} aria-hidden="true" />
        {label} location
        {isSet && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-label="Set" style={{ marginLeft: 2 }}><polyline points="20 6 9 17 4 12"/></svg>
        )}
      </span>

      {/* Address search input with autocomplete */}
      <div style={{ position: 'relative' }}>
        <input
          className="input"
          aria-label={`${label} address`}
          placeholder={which === 'pickup' ? 'Type pickup — e.g. Sector 13 Market' : 'Type drop-off — e.g. Brahmasarovar'}
          maxLength={200}
          value={text}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 180)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
            background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,.12)', marginTop: 2, overflow: 'hidden',
          }}>
            {suggestions.map(s => (
              <button
                key={s.id}
                type="button"
                onMouseDown={() => selectSuggestion(s)}
                style={{
                  width: '100%', textAlign: 'left', padding: '9px 13px',
                  border: 'none', borderBottom: '1px solid #f1f5f9',
                  background: 'none', cursor: 'pointer', fontSize: 13,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{s.address}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GPS button */}
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={useMyLocation}
        disabled={gpsLoading}
        aria-label={`Use current GPS location as ${label.toLowerCase()}`}
        style={{ marginTop: 6, width: '100%', justifyContent: 'center', gap: 7, fontSize: 12 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/></svg>
        {gpsLoading ? 'Getting location…' : `Use live location as ${label.toLowerCase()}`}
      </button>
      <p className="muted" style={{ fontSize: 11, marginTop: 3 }}>
        One-time GPS only. My KKR never stores your live location.
      </p>

      {/* Area fallback picker */}
      <AreaSelect id={`${which}-area`} value={area} onChange={pickArea} placeholder={`…or choose ${label.toLowerCase()} area from list`} />

      {status && (
        <span className="muted" role="status" aria-live="polite"
          style={{ fontSize: 11, display: 'block', marginTop: 3, color: status.includes('set') || status.includes('Set') ? '#10b981' : undefined }}
        >
          {status}
        </span>
      )}
    </div>
  )
}

export default function RideRequestForm() {
  const [mode, setMode] = useState<Mode>('ride')
  const vehicles = mode === 'ride' ? RIDE_VEHICLES : DELIVERY_VEHICLES
  const [vehicleId, setVehicleId] = useState(RIDE_VEHICLES[0].id)
  const vehicle = vehicles.find((v) => v.id === vehicleId) ?? vehicles[0]

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [pickup, setPickup] = useState<Point | null>(null)
  const [dropoff, setDropoff] = useState<Point | null>(null)
  const [estimate, setEstimate] = useState<RouteEstimate | null>(null)
  const [details, setDetails] = useState('')
  const [when, setWhen] = useState<'now' | 'scheduled'>('now')
  const [scheduledAt, setScheduledAt] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)
  const [submittedJobId, setSubmittedJobId] = useState<string | null>(null)

  const frameRef = useRef<HTMLIFrameElement>(null)
  // Track last values so we only push diffs to the iframe
  const lastPickup = useRef<Point | null>(null)
  const lastDropoff = useRef<Point | null>(null)

  function switchMode(m: Mode) {
    setMode(m)
    setVehicleId((m === 'ride' ? RIDE_VEHICLES : DELIVERY_VEHICLES)[0].id)
  }

  // Recalculate the route whenever both points are set
  useEffect(() => {
    if (!pickup || !dropoff) {
      setEstimate(null)
      return
    }
    const ctrl = new AbortController()
    estimateRoute(pickup, dropoff, ctrl.signal)
      .then(setEstimate)
      .catch(() => undefined)
    return () => ctrl.abort()
  }, [pickup, dropoff])

  // Send location updates to the map iframe
  useEffect(() => {
    const fw = frameRef.current?.contentWindow
    if (!fw) return

    // Push pickup pin if changed
    if (pickup !== lastPickup.current) {
      lastPickup.current = pickup
      fw.postMessage({ type: 'SET_PICKUP', lat: pickup?.lat ?? null, lon: pickup?.lon ?? null, label: pickup?.label ?? '' }, '*')
    }
    // Push dropoff pin if changed
    if (dropoff !== lastDropoff.current) {
      lastDropoff.current = dropoff
      fw.postMessage({ type: 'SET_DROPOFF', lat: dropoff?.lat ?? null, lon: dropoff?.lon ?? null, label: dropoff?.label ?? '' }, '*')
    }
  }, [pickup, dropoff])

  // Listen for pin-drag events from the map iframe
  useEffect(() => {
    async function onMessage(e: MessageEvent) {
      if (!e.data || typeof e.data.type !== 'string') return

      if (e.data.type === 'PICKUP_MOVED') {
        const { lat, lon } = e.data as { lat: number; lon: number }
        // Reverse-geocode to get a label for the dragged position
        const lbl = await reverseLabel(lat, lon)
        const next = { lat, lon, label: lbl }
        lastPickup.current = next
        setPickup(next)
      }

      if (e.data.type === 'DROPOFF_MOVED') {
        const { lat, lon } = e.data as { lat: number; lon: number }
        const lbl = await reverseLabel(lat, lon)
        const next = { lat, lon, label: lbl }
        lastDropoff.current = next
        setDropoff(next)
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (name.trim().length < 2) errs.push('Enter your name.')
    if (!isValidIndianMobile(phone)) errs.push('Enter a valid 10-digit Indian mobile number.')
    if (!pickup) errs.push('Set a pickup location.')
    if (!dropoff) errs.push('Set a drop-off location.')
    if (when === 'scheduled' && !scheduledAt) errs.push('Choose a date and time for the scheduled request.')
    if (!consent) errs.push('Tick the consent box so we can share your details with the assigned driver.')
    setErrors(errs)
    if (errs.length) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          name: name.trim(),
          phone,
          pickupLabel:   pickup!.label,
          pickupLat:     pickup!.lat,
          pickupLon:     pickup!.lon,
          dropoffLabel:  dropoff!.label,
          dropoffLat:    dropoff!.lat,
          dropoffLon:    dropoff!.lon,
          vehicleId:     vehicleId,
          distanceKm:    estimate?.km ?? null,
          fareEstimate:  estimate ? fareFor(estimate.km, vehicle.perKm) * 100 : null, // paise
          notes:         details.trim() || null,
          scheduledAt:   when === 'scheduled' ? scheduledAt : null,
        }),
      })
      const json = await res.json() as { job?: { id: string; ref: string }; errors?: string[]; error?: string }
      if (!res.ok) {
        setErrors(json.errors ?? [json.error ?? 'Something went wrong. Please try again.'])
        setSubmitting(false)
        return
      }
      setSubmittedRef(json.job!.ref)
      setSubmittedJobId(json.job!.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setErrors(['Network error — please check your connection and try again.'])
      setSubmitting(false)
    }
  }

  function reset() {
    setSubmittedRef(null)
    setPickup(null)
    setDropoff(null)
    setDetails('')
    setConsent(false)
  }

  if (submittedRef) {
    return (
      <div className="panel" style={{ textAlign: 'center' }} role="status">
        <div style={{ color: '#10b981', marginBottom: 8 }} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <h2 className="page-title" style={{ fontSize: 20 }}>Request sent to nearby drivers</h2>
        <p className="muted">You'll be notified when a verified driver accepts.</p>
        <p style={{ margin: '12px 0' }}><span className="ref">{submittedRef}</span></p>

        {submittedJobId && (
          <a
            href={`/track/${submittedRef}`}
            className="btn btn-primary btn-block"
            style={{ marginBottom: 12, display: 'flex', justifyContent: 'center', gap: 8 }}
          >
            Track live on map →
          </a>
        )}

        <ul className="track">
          <li><span className="dot done" />Request created and broadcast</li>
          <li><span className="dot wait" />Waiting for a driver — usually under 3 minutes</li>
          <li><span className="dot" />Driver assigned — your number is shared</li>
          <li><span className="dot" />Driver en route to pickup</li>
          <li><span className="dot" />{mode === 'ride' ? 'Ride' : 'Delivery'} completed</li>
        </ul>
        <p className="muted" style={{ marginBottom: 14 }}>Pay the driver directly — cash or UPI. My KKR takes zero commission.</p>
        <button className="btn btn-outline btn-sm" onClick={reset}>Make another request</button>
      </div>
    )
  }

  const links = pickup && dropoff ? mapsLinks(pickup, dropoff) : null
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <form className="panel" onSubmit={onSubmit} noValidate>
      <div className="option-grid" role="radiogroup" aria-label="Request type" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {(
          [
            { id: 'ride' as Mode, icon: <IconRides />, name: 'Book a ride', desc: 'Auto, cab or SUV' },
            { id: 'deliver' as Mode, icon: <IconPackage />, name: 'Deliver goods', desc: 'Parcels to freight' },
          ]
        ).map((m) => (
          <button
            type="button"
            key={m.id}
            role="radio"
            aria-checked={mode === m.id}
            className={`option${mode === m.id ? ' active' : ''}`}
            onClick={() => switchMode(m.id)}
          >
            <span className="option-icon" aria-hidden="true">{m.icon}</span>
            <span className="option-name">{m.name}</span>
            <span className="option-desc">{m.desc}</span>
          </button>
        ))}
      </div>

      <div className="step-block">
        <div className="steps-head"><span className="step-num">1</span>Your details</div>
        <div className="form-row">
          <div className="field">
            <label className="label" htmlFor="rd-name">Name</label>
            <input id="rd-name" className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div className="field">
            <label className="label" htmlFor="rd-phone">Phone</label>
            <input id="rd-phone" className="input" type="tel" maxLength={15} placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </div>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>Your number stays private until a driver is assigned.</p>
      </div>

      {/* ── Step 2: Map-first location picking ──────────────────────────── */}
      <div className="step-block">
        <div className="steps-head"><span className="step-num">2</span>Pickup &amp; drop-off</div>

        {/* Map hint */}
        <div style={{
          background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8,
          padding: '8px 12px', marginBottom: 10, fontSize: 12, color: '#166534',
          display: 'flex', gap: 8, alignItems: 'flex-start',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>
            <strong>Tip:</strong> Drop the <span style={{ color: '#16a34a', fontWeight: 700 }}>green pin</span> on pickup and the <span style={{ color: '#dc2626', fontWeight: 700 }}>red pin</span> on drop-off — drag them anywhere on the map.
            Or type an address / use live GPS below.
          </span>
        </div>

        {/* Interactive dual-pin map */}
        <DualPinMap
          frameRef={frameRef}
          origin={origin}
          pickup={pickup}
          dropoff={dropoff}
        />

        {/* Address inputs below the map */}
        <div className="form-row" style={{ marginTop: 14 }}>
          <LocationField which="pickup" point={pickup} onChange={setPickup} pinColor="#16a34a" />
          <LocationField which="dropoff" point={dropoff} onChange={setDropoff} pinColor="#dc2626" />
        </div>

        {/* Route estimate */}
        {estimate && (
          <div className="estimate" style={{ marginTop: 12 }}>
            <div className="estimate-row"><span>Distance</span><span>{estimate.approximate ? '~' : ''}{estimate.km.toFixed(1)} km</span></div>
            <div className="estimate-row"><span>Time</span><span>{estimate.approximate ? '~' : ''}{estimate.minutes} min</span></div>
            <div className="estimate-total"><span>Indicative fare ({vehicle.name})</span><span>₹{fareFor(estimate.km, vehicle.perKm).toLocaleString('en-IN')}</span></div>
            <p className="muted" style={{ marginTop: 6 }}>Final fare is agreed with the driver. Zero commission to My KKR.</p>
          </div>
        )}

        {/* Open in external maps — critical for drivers navigating */}
        {links && (
          <div style={{ marginTop: 10 }}>
            <p className="muted" style={{ fontSize: 11, marginBottom: 6 }}>
              <strong>Share route with driver:</strong> open in your preferred maps app
            </p>
            <div className="chips">
              <a className="chip" href={links.google} target="_blank" rel="noopener noreferrer">Google Maps</a>
              <a className="chip" href={links.ola} target="_blank" rel="noopener noreferrer">OLA</a>
              <a className="chip" href={links.apple} target="_blank" rel="noopener noreferrer">Apple Maps</a>
              <a className="chip" href={links.waze} target="_blank" rel="noopener noreferrer">Waze</a>
              <a className="chip" href={links.osm} target="_blank" rel="noopener noreferrer">OpenStreetMap</a>
            </div>
          </div>
        )}
      </div>

      <div className="step-block">
        <div className="steps-head"><span className="step-num">3</span>Select vehicle</div>
        <div className="option-grid" role="radiogroup" aria-label="Vehicle">
          {vehicles.map((v) => (
            <button
              type="button"
              key={v.id}
              role="radio"
              aria-checked={vehicle.id === v.id}
              className={`option${vehicle.id === v.id ? ' active' : ''}`}
              onClick={() => setVehicleId(v.id)}
            >
              <span className="option-icon" aria-hidden="true">{v.icon}</span>
              <span className="option-name">{v.name}</span>
              <span className="option-desc">{v.capacity}</span>
              <span className="option-desc"><strong>₹{v.perKm}/km</strong></span>
            </button>
          ))}
        </div>
      </div>

      <div className="step-block">
        <div className="steps-head"><span className="step-num">4</span>Additional details</div>
        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="rd-details">{mode === 'ride' ? 'Passengers & notes' : 'What are you sending?'}</label>
            <textarea
              id="rd-details"
              className="textarea"
              maxLength={500}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={mode === 'ride' ? 'e.g. 2 passengers, need AC' : 'e.g. 3 cartons, ~40 kg, fragile'}
            />
          </div>
          <div className="form-row">
            <div className="field">
              <label className="label" htmlFor="rd-when">When?</label>
              <select id="rd-when" className="select" value={when} onChange={(e) => setWhen(e.target.value as 'now' | 'scheduled')}>
                <option value="now">As soon as possible</option>
                <option value="scheduled">Schedule for later</option>
              </select>
            </div>
            {when === 'scheduled' && (
              <div className="field">
                <label className="label" htmlFor="rd-at">Date &amp; time</label>
                <input id="rd-at" className="input" type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
            )}
          </div>
          <label className="check">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            I agree my name and phone may be shared with the assigned driver. I'll pay the driver directly.
          </label>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="banner banner-err" role="alert" style={{ marginBottom: 12 }}>
          <span aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <ul style={{ paddingLeft: 16 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
        {submitting
          ? 'Sending…'
          : mode === 'ride'
            ? 'Send ride request →'
            : 'Send delivery request →'}
      </button>
    </form>
  )
}

/**
 * DualPinMap — self-contained Leaflet iframe with:
 *   - Green draggable marker for pickup
 *   - Red draggable marker for dropoff
 *   - Line between them when both are set
 *   - postMessage bridge for parent ↔ iframe sync
 */
function DualPinMap({
  frameRef,
  origin,
  pickup,
  dropoff,
}: {
  frameRef: React.RefObject<HTMLIFrameElement | null>
  origin: string
  pickup: Point | null
  dropoff: Point | null
}) {
  const html = buildDualPinHtml(origin)

  return (
    <iframe
      ref={frameRef}
      srcDoc={html}
      className="map-frame"
      title="Pickup and drop-off map — drag green pin for pickup, red for drop-off"
      aria-label="Interactive map: drag green pin to set pickup location, red pin to set drop-off location"
      style={{ display: 'block', width: '100%', border: 'none' }}
    />
  )
}

/** Reverse geocode via HERE proxy — returns a clean address label */
async function reverseLabel(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`/api/maps/reverse?lat=${lat}&lng=${lon}`)
    const data = await res.json() as { result?: { address: string } }
    return data.result?.address ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  }
}

/** Build self-contained Leaflet HTML with two draggable pins + polyline */
function buildDualPinHtml(origin: string): string {
  const kkrLat = KKR_CENTER.lat
  const kkrLon = KKR_CENTER.lon

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="/leaflet/leaflet.css"/>
<style>
html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
#hint{
  position:absolute;bottom:6px;left:50%;transform:translateX(-50%);
  background:rgba(0,0,0,.55);color:#fff;font-size:11px;padding:4px 10px;
  border-radius:20px;pointer-events:none;white-space:nowrap;z-index:1000;
  font-family:system-ui,-apple-system,sans-serif;
}
</style>
</head>
<body>
<div id="map"></div>
<div id="hint">Drag <span style="color:#4ade80;font-weight:700">green pin</span> = pickup &nbsp;|&nbsp; <span style="color:#f87171;font-weight:700">red pin</span> = drop-off</div>
<script src="/leaflet/leaflet.js"></script>
<script>
var TILE_BASE=${JSON.stringify(origin)};
(function(){
  var kkrLat=${kkrLat}, kkrLon=${kkrLon};

  var map = L.map('map',{zoomControl:true,scrollWheelZoom:false}).setView([kkrLat,kkrLon],13);

  L.tileLayer(TILE_BASE+'/api/maps/tiles/{z}/{x}/{y}.png',{
    attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom:19
  }).addTo(map);

  // ── Custom marker icons ──────────────────────────────────────────
  function coloredIcon(color) {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">'
      + '<path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z" fill="' + color + '"/>'
      + '<circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>'
      + '</svg>';
    return L.divIcon({
      className:'',
      html: svg,
      iconSize:[28,40],
      iconAnchor:[14,40],
      popupAnchor:[0,-38],
    });
  }

  var greenIcon = coloredIcon('#16a34a');
  var redIcon   = coloredIcon('#dc2626');

  // ── Markers ──────────────────────────────────────────────────────
  var pickupMk  = L.marker([kkrLat, kkrLon], {draggable:true, icon:greenIcon, title:'Pickup (drag to set)'}).addTo(map);
  var dropoffMk = L.marker([kkrLat+0.01, kkrLon+0.01], {draggable:true, icon:redIcon,   title:'Drop-off (drag to set)'}).addTo(map);

  // Track whether each pin has been explicitly positioned
  var pickupSet  = false;
  var dropoffSet = false;
  var line = null;

  function updateLine() {
    if(line){ map.removeLayer(line); line=null; }
    if(pickupSet && dropoffSet){
      var a = pickupMk.getLatLng();
      var b = dropoffMk.getLatLng();
      line = L.polyline([a,b],{color:'#6366f1',weight:3,dashArray:'6 4',opacity:0.7}).addTo(map);
    }
  }

  function notifyPickup() {
    var p = pickupMk.getLatLng();
    window.parent.postMessage({type:'PICKUP_MOVED',lat:p.lat,lon:p.lng},'*');
  }
  function notifyDropoff() {
    var p = dropoffMk.getLatLng();
    window.parent.postMessage({type:'DROPOFF_MOVED',lat:p.lat,lon:p.lng},'*');
  }

  pickupMk.on('dragend', function(){
    pickupSet = true;
    updateLine();
    notifyPickup();
  });
  dropoffMk.on('dragend', function(){
    dropoffSet = true;
    updateLine();
    notifyDropoff();
  });

  // Tap to place the next unset pin; if both set, tap sets pickup
  map.on('click', function(e){
    if(!pickupSet){
      pickupMk.setLatLng(e.latlng);
      pickupSet = true;
      updateLine();
      notifyPickup();
    } else if(!dropoffSet){
      dropoffMk.setLatLng(e.latlng);
      dropoffSet = true;
      updateLine();
      notifyDropoff();
    }
  });

  // ── Listen for messages from parent ────────────────────────────
  window.addEventListener('message', function(e){
    if(!e.data || !e.data.type) return;

    if(e.data.type === 'SET_PICKUP'){
      if(e.data.lat !== null && e.data.lat !== undefined){
        var ll = L.latLng(e.data.lat, e.data.lon);
        pickupMk.setLatLng(ll);
        pickupSet = true;
        if(dropoffSet){
          map.fitBounds([pickupMk.getLatLng(), dropoffMk.getLatLng()], {padding:[40,40]});
        } else {
          map.setView(ll, 15);
        }
        updateLine();
      } else {
        pickupSet = false;
        updateLine();
      }
    }

    if(e.data.type === 'SET_DROPOFF'){
      if(e.data.lat !== null && e.data.lat !== undefined){
        var ll2 = L.latLng(e.data.lat, e.data.lon);
        dropoffMk.setLatLng(ll2);
        dropoffSet = true;
        if(pickupSet){
          map.fitBounds([pickupMk.getLatLng(), dropoffMk.getLatLng()], {padding:[40,40]});
        } else {
          map.setView(ll2, 15);
        }
        updateLine();
      } else {
        dropoffSet = false;
        updateLine();
      }
    }
  });

  // Signal ready to parent
  window.parent.postMessage({type:'DUAL_MAP_READY'},'*');
})();
</script>
</body>
</html>`
}
