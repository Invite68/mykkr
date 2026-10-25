'use client'

import { useEffect, useRef, useMemo, useState, type FormEvent } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { KKR_CENTER, findArea } from '@/data/areas'

// All categories for dropdown (plain text only — <option> cannot render SVG)
const ALL_CATS = [
  { slug: '', label: 'Any category' },
  ...CATEGORY_GROUPS.map((g) => ({ slug: g.slug, label: g.label })),
]

const SLOTS = ['Any time', 'Morning (8–12)', 'Afternoon (12–4)', 'Evening (4–8)', 'Full day']

function today(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

function formatDate(iso: string) {
  if (!iso) return ''
  const d = new Date(iso + 'T00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// Mini Leaflet map component (loads lazily, no API key needed)
function LocationMap({ lat, lon, onPin }: { lat: number; lon: number; onPin: (lat: number, lon: number) => void }) {
  const mapRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstance = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return

    // Dynamically load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id = 'leaflet-css'
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    // Dynamically load Leaflet JS
    const initMap = async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (await import('leaflet' as any)).default ?? (await import('leaflet' as any))

      // Fix default icon path issue with webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapInstance.current) {
        mapInstance.current.setView([lat, lon], 13)
        markerRef.current?.setLatLng([lat, lon])
        return
      }

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false }).setView([lat, lon], 13)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const marker = L.marker([lat, lon], { draggable: true }).addTo(map)
      markerRef.current = marker

      marker.on('dragend', () => {
        const pos = marker.getLatLng()
        onPin(pos.lat, pos.lng)
      })

      map.on('click', (e: { latlng: { lat: number; lng: number } }) => {
        marker.setLatLng([e.latlng.lat, e.latlng.lng])
        onPin(e.latlng.lat, e.latlng.lng)
      })
    }

    initMap()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update map view when coords change externally
  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      mapInstance.current.setView([lat, lon], 13)
      markerRef.current.setLatLng([lat, lon])
    }
  }, [lat, lon])

  return <div ref={mapRef} className="findbk-map" aria-label="Pin your location on the map" />
}

export default function FindBookForm({ initialSub = '' }: { initialSub?: string }) {
  const [catSlug, setCatSlug] = useState('')
  const [keyword, setKeyword] = useState(initialSub)
  const [area, setArea] = useState('')
  const [coords, setCoords] = useState(KKR_CENTER)
  const [date, setDate] = useState(today())
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
      setGeoMsg('Location not available — pick an area instead.')
      return
    }
    setGeoMsg('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        setGeoMsg('Location set!')
      },
      () => setGeoMsg('Could not get location — pick an area instead.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitted(true)
  }

  // Keyword match against name, sub, tags, area
  const results = useMemo(() => {
    if (!submitted) return []
    let pool = catSlug
      ? BUSINESSES.filter((b) => b.cat === catSlug)
      : BUSINESSES

    if (keyword.trim()) {
      const kw = keyword.toLowerCase()
      pool = pool.filter((b) =>
        b.name.toLowerCase().includes(kw) ||
        b.sub.toLowerCase().includes(kw) ||
        (b.tags ?? []).some((t) => t.toLowerCase().includes(kw)) ||
        b.area.toLowerCase().includes(kw)
      )
    }

    if (area) {
      pool = [...pool].sort((a, b) => Number(b.area === area) - Number(a.area === area))
    }

    return pool
  }, [submitted, catSlug, keyword, area])

  return (
    <>
      <form className="findbk-form" onSubmit={onSubmit} noValidate>

        {/* Step 1: What */}
        <div className="findbk-step">
          <div className="findbk-step-head">
            <span className="findbk-num">1</span>
            <span className="findbk-step-title">WHAT ARE YOU LOOKING FOR?</span>
          </div>

          {/* Free-text keyword */}
          <input
            className="input"
            type="text"
            placeholder="e.g. wedding venue, electrician, catering…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />

          {/* Category filter — dropdown only, no chips */}
          <select
            className="select"
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            style={{ marginTop: 8 }}
          >
            {ALL_CATS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Where */}
        <div className="findbk-step">
          <div className="findbk-step-head">
            <span className="findbk-num">2</span>
            <span className="findbk-step-title">WHERE IN KURUKSHETRA?</span>
          </div>

          {/* Area dropdown */}
          <AreaSelect id="fb-area" value={area} onChange={onArea} />

          {/* GPS button */}
          <button
            type="button"
            className="findbk-geo-btn"
            onClick={useMyLocation}
          >
            📍 Use my current location
          </button>

          {geoMsg && (
            <p className={`findbk-geo-msg${geoMsg.startsWith('Location set') ? ' ok' : ''}`} role="status">
              {geoMsg.startsWith('Location set') ? '✓ ' : ''}{geoMsg}
            </p>
          )}

          {/* Live map with draggable pin */}
          <LocationMap
            lat={coords.lat}
            lon={coords.lon}
            onPin={(lat, lon) => setCoords({ lat, lon })}
          />
          <p className="findbk-map-hint">Drag the pin or tap the map to set exact location</p>
        </div>

        {/* Step 3: When */}
        <div className="findbk-step">
          <div className="findbk-step-head">
            <span className="findbk-num">3</span>
            <span className="findbk-step-title">WHEN?</span>
          </div>
          <input
            id="fb-date"
            className="input"
            type="date"
            min={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <select
            id="fb-slot"
            className="select"
            value={slot}
            onChange={(e) => setSlot(e.target.value)}
            style={{ marginTop: 8 }}
          >
            {SLOTS.map((s) => <option key={s}>{s}</option>)}
          </select>
          {error && <p className="field-error" role="alert" style={{ marginTop: 8 }}>{error}</p>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: 4 }}>
          🔍 Find available providers →
        </button>
      </form>

      {submitted && (
        <section className="sec" aria-live="polite" style={{ marginTop: 24 }}>
          <div className="sec-head">
            <div>
              <h2 className="sec-title">
                {results.length > 0 ? `${results.length} provider${results.length === 1 ? '' : 's'} found` : 'No providers found'}
              </h2>
              <div className="sec-sub">
                {formatDate(date)} &middot; {slot}
                {area ? ` · near ${area}` : ''}
                {keyword ? ` · "${keyword}"` : ''}
              </div>
            </div>
          </div>
          {results.length === 0 ? (
            <div className="findbk-empty">
              <p>No businesses matched your search.</p>
              <p className="muted" style={{ marginTop: 6 }}>Try a broader keyword or different category.</p>
            </div>
          ) : (
            <BusinessGrid businesses={results} />
          )}
        </section>
      )}
    </>
  )
}
