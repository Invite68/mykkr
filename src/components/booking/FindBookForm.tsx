'use client'

import { useMemo, useState, type FormEvent } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { KKR_CENTER, findArea, osmEmbedUrl } from '@/data/areas'

const BOOKABLE = CATEGORY_GROUPS.flatMap((g) => g.subcategories.filter((s) => s.bookable && s.kind !== 'ride'))
const SLOTS = ['Any time', 'Morning (8–12)', 'Afternoon (12–4)', 'Evening (4–8)', 'Full day']

function today(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

export default function FindBookForm({ initialSub = '' }: { initialSub?: string }) {
  const [sub, setSub] = useState(BOOKABLE.some((s) => s.slug === initialSub) ? initialSub : '')
  const [area, setArea] = useState('')
  const [coords, setCoords] = useState(KKR_CENTER)
  const [date, setDate] = useState('')
  const [slot, setSlot] = useState(SLOTS[0])
  const [geoMsg, setGeoMsg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function onArea(name: string) {
    setArea(name)
    const a = findArea(name)
    if (a) setCoords({ lat: a.lat, lon: a.lon })
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      setGeoMsg('Location is not available on this device — pick an area instead.')
      return
    }
    setGeoMsg('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setGeoMsg('📍 Pinned to your current location')
      },
      () => setGeoMsg('Could not get your location — pick an area instead.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!date) {
      setError('Please choose a date.')
      return
    }
    setError('')
    setSubmitted(true)
  }

  const results = useMemo(() => {
    const pool = BUSINESSES.filter((b) => BOOKABLE.some((s) => s.slug === b.sub))
    let list = sub ? pool.filter((b) => b.sub === sub) : pool
    if (area) {
      // Same-area providers first
      list = [...list].sort((a, b) => Number(b.area === area) - Number(a.area === area))
    }
    return list
  }, [sub, area])

  return (
    <>
      <form className="panel" onSubmit={onSubmit} noValidate>
        <div className="step-block">
          <div className="steps-head"><span className="step-num">1</span>What are you looking for?</div>
          <div className="chips" style={{ flexWrap: 'wrap' }}>
            <button type="button" className={`chip${!sub ? ' active' : ''}`} onClick={() => setSub('')}>Any bookable service</button>
            {BOOKABLE.map((s) => (
              <button type="button" key={s.slug} className={`chip${sub === s.slug ? ' active' : ''}`} onClick={() => setSub(s.slug)} aria-pressed={sub === s.slug}>
                {s.icon} {s.name}
              </button>
            ))}
          </div>
        </div>

        <div className="step-block">
          <div className="steps-head"><span className="step-num">2</span>Where in Kurukshetra?</div>
          <div className="form-grid">
            <AreaSelect id="fb-area" value={area} onChange={onArea} />
            <button type="button" className="btn btn-outline btn-sm" onClick={useMyLocation} style={{ justifySelf: 'start' }}>
              📍 Use my current location
            </button>
            {geoMsg && <p className="muted" role="status">{geoMsg}</p>}
            <iframe className="map-frame" src={osmEmbedUrl(coords.lat, coords.lon)} title="Selected location map" loading="lazy" />
          </div>
        </div>

        <div className="step-block">
          <div className="steps-head"><span className="step-num">3</span>When?</div>
          <div className="form-row">
            <div className="field">
              <label className="label" htmlFor="fb-date">Date</label>
              <input id="fb-date" className="input" type="date" min={today()} value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label" htmlFor="fb-slot">Time slot</label>
              <select id="fb-slot" className="select" value={slot} onChange={(e) => setSlot(e.target.value)}>
                {SLOTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="field-error" role="alert" style={{ marginTop: 8 }}>{error}</p>}
        </div>

        <button type="submit" className="btn btn-primary btn-block">🔍 Find available providers →</button>
      </form>

      {submitted && (
        <section className="sec" aria-live="polite">
          <div className="sec-head">
            <div>
              <h2 className="sec-title">Available providers</h2>
              <div className="sec-sub">
                {new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {slot}
                {area ? ` · near ${area}` : ''}
              </div>
            </div>
          </div>
          <BusinessGrid businesses={results} />
        </section>
      )}
    </>
  )
}
