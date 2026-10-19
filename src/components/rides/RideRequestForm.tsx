'use client'

import { useEffect, useState, type FormEvent } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { DELIVERY_VEHICLES, RIDE_VEHICLES } from '@/data/vehicles'
import { KKR_CENTER, findArea, osmBboxUrl, osmEmbedUrl } from '@/data/areas'
import { estimateRoute, fareFor, geocode, mapsLinks, type LatLon, type RouteEstimate } from '@/lib/routing'
import { isValidIndianMobile, jobRef } from '@/lib/sanitize'

type Mode = 'ride' | 'deliver'

interface Point extends LatLon {
  label: string
}

function LocationField({
  which,
  point,
  onChange,
}: {
  which: 'pickup' | 'dropoff'
  point: Point | null
  onChange: (p: Point | null) => void
}) {
  const [text, setText] = useState('')
  const [area, setArea] = useState('')
  const [status, setStatus] = useState('')
  const label = which === 'pickup' ? 'Pickup' : 'Drop-off'

  function pickArea(name: string) {
    setArea(name)
    const a = findArea(name)
    onChange(a ? { lat: a.lat, lon: a.lon, label: a.name } : null)
    setStatus('')
  }

  async function lookUp() {
    const q = text.trim()
    if (!q) {
      setStatus('Type an address first, or pick an area.')
      return
    }
    setStatus('Looking up…')
    try {
      const hit = await geocode(q)
      if (!hit) {
        setStatus('Address not found — pick an area from the list instead.')
        return
      }
      onChange({ ...hit, label: q })
      setArea('')
      setStatus('✓ Found')
    } catch {
      setStatus('Could not look up the address — pick an area instead.')
    }
  }

  return (
    <div className="field">
      <span className="label">{label} location</span>
      <div className="inline-group">
        <input
          className="input"
          aria-label={`${label} address`}
          placeholder={which === 'pickup' ? 'e.g. Sector 13 Market' : 'e.g. Brahmsarovar'}
          maxLength={200}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={lookUp} aria-label={`Find ${label.toLowerCase()} address`}>📍</button>
      </div>
      <AreaSelect id={`${which}-area`} value={area} onChange={pickArea} placeholder={`…or choose ${label.toLowerCase()} area`} />
      {status && <span className="muted" role="status">{status}</span>}
      {point && <span className="muted">Set: {point.label}</span>}
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
  const [submittedRef, setSubmittedRef] = useState<string | null>(null)

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

  function onSubmit(e: FormEvent) {
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
    // TODO(backend): POST /api/jobs → broadcast to drivers. Until then we only confirm locally.
    setSubmittedRef(jobRef())
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        <div style={{ fontSize: 40 }} aria-hidden="true">✅</div>
        <h2 className="page-title" style={{ fontSize: 20 }}>Request sent to nearby drivers</h2>
        <p className="muted">You’ll be notified when a verified driver accepts.</p>
        <p style={{ margin: '12px 0' }}><span className="ref">{submittedRef}</span></p>
        <ul className="track">
          <li><span className="dot done" />Request created and broadcast</li>
          <li><span className="dot wait" />Waiting for a driver — usually under 3 minutes</li>
          <li><span className="dot" />Driver assigned — your number is shared</li>
          <li><span className="dot" />Driver en route to pickup</li>
          <li><span className="dot" />{mode === 'ride' ? 'Ride' : 'Delivery'} completed (photo proof for deliveries)</li>
        </ul>
        <p className="muted" style={{ marginBottom: 14 }}>Pay the driver directly — cash or UPI. My KKR takes zero commission.</p>
        <button className="btn btn-primary" onClick={reset}>Make another request</button>
      </div>
    )
  }

  const links = pickup && dropoff ? mapsLinks(pickup, dropoff) : null
  const mapSrc =
    pickup && dropoff ? osmBboxUrl(pickup, dropoff) : pickup ? osmEmbedUrl(pickup.lat, pickup.lon) : osmEmbedUrl(KKR_CENTER.lat, KKR_CENTER.lon, 0.08)

  return (
    <form className="panel" onSubmit={onSubmit} noValidate>
      <div className="option-grid" role="radiogroup" aria-label="Request type" style={{ gridTemplateColumns: '1fr 1fr' }}>
        {(
          [
            { id: 'ride', icon: '🚗', name: 'Book a ride', desc: 'Auto, cab or SUV' },
            { id: 'deliver', icon: '📦', name: 'Deliver goods', desc: 'Parcels to freight' },
          ] as const
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
        <p className="muted" style={{ marginTop: 8 }}>🔒 Your number stays private until a driver is assigned.</p>
      </div>

      <div className="step-block">
        <div className="steps-head"><span className="step-num">2</span>Pickup &amp; drop-off</div>
        <div className="form-row">
          <LocationField which="pickup" point={pickup} onChange={setPickup} />
          <LocationField which="dropoff" point={dropoff} onChange={setDropoff} />
        </div>
        <iframe className="map-frame" style={{ marginTop: 12 }} src={mapSrc} title="Route map" loading="lazy" />
        {estimate && (
          <div className="estimate" style={{ marginTop: 12 }}>
            <div className="estimate-row"><span>Distance</span><span>{estimate.approximate ? '~' : ''}{estimate.km.toFixed(1)} km</span></div>
            <div className="estimate-row"><span>Time</span><span>{estimate.approximate ? '~' : ''}{estimate.minutes} min</span></div>
            <div className="estimate-total"><span>Indicative fare ({vehicle.name})</span><span>₹{fareFor(estimate.km, vehicle.perKm).toLocaleString('en-IN')}</span></div>
            <p className="muted" style={{ marginTop: 6 }}>Final fare is agreed with the driver. Zero commission to My KKR.</p>
          </div>
        )}
        {links && (
          <div className="chips" style={{ marginTop: 10 }}>
            <a className="chip" href={links.google} target="_blank" rel="noopener noreferrer">🗺️ Google Maps</a>
            <a className="chip" href={links.apple} target="_blank" rel="noopener noreferrer">🍎 Apple Maps</a>
            <a className="chip" href={links.waze} target="_blank" rel="noopener noreferrer">🚗 Waze</a>
            <a className="chip" href={links.osm} target="_blank" rel="noopener noreferrer">🌍 OpenStreetMap</a>
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
            I agree my name and phone may be shared with the assigned driver. I’ll pay the driver directly.
          </label>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="banner banner-err" role="alert" style={{ marginBottom: 12 }}>
          <span aria-hidden="true">⚠️</span>
          <ul style={{ paddingLeft: 16 }}>{errors.map((e) => <li key={e}>{e}</li>)}</ul>
        </div>
      )}
      <button type="submit" className="btn btn-primary btn-block">
        {mode === 'ride' ? '🚗 Send ride request' : '📦 Send delivery request'} to nearby drivers →
      </button>
    </form>
  )
}
