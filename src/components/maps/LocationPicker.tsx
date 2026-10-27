'use client'
/**
 * LocationPicker — interactive address search + map pin component.
 *
 * SECURITY: Never imports from @/lib/here — all API calls go through
 * /api/maps/* server routes. The HERE API key never reaches the browser.
 *
 * Usage:
 *   <LocationPicker
 *     value={{ lat: 29.96, lng: 76.84, address: 'Kurukshetra, Haryana' }}
 *     onChange={(loc) => setLocation(loc)}
 *     placeholder="Search your business address..."
 *   />
 */

import { useState, useCallback, useRef, useEffect } from 'react'

export interface LocationValue {
  lat: number
  lng: number
  address: string
  city?: string
  state?: string
  postalCode?: string
}

interface Props {
  value?: LocationValue | null
  onChange: (loc: LocationValue) => void
  placeholder?: string
  label?: string
  required?: boolean
  disabled?: boolean
  /** If provided, map tiles are shown (requires Leaflet loaded) */
  showMap?: boolean
  mapHeight?: number
}

interface Suggestion {
  id: string
  title: string
  address: string
  lat?: number
  lng?: number
}

const C = { teal: '#12343b', border: '#e2e8f0', muted: '#64748b', bg: '#f8fafc', surface: '#fff', red: '#dc2626' }

export default function LocationPicker({
  value,
  onChange,
  placeholder = 'Search address...',
  label,
  required,
  disabled,
  showMap = true,
  mapHeight = 220,
}: Props) {
  const [query, setQuery] = useState(value?.address ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<{ map: L.Map; marker: L.Marker } | null>(null)

  // Keep input in sync if parent changes value
  useEffect(() => {
    if (value?.address && value.address !== query) setQuery(value.address)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.address])

  // ── Autocomplete search ──────────────────────────────────────────────────
  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ q, mode: 'autocomplete' })
      if (value?.lat) params.set('lat', String(value.lat))
      if (value?.lng) params.set('lng', String(value.lng))
      const res = await fetch(`/api/maps/geocode?${params}`)
      const data = await res.json() as { results: Suggestion[] }
      setSuggestions(data.results ?? [])
      setOpen((data.results ?? []).length > 0)
    } finally {
      setLoading(false)
    }
  }, [value?.lat, value?.lng])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setQuery(v)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(v), 300)
  }

  // ── Select suggestion → lookup full coords ───────────────────────────────
  const selectSuggestion = async (s: Suggestion) => {
    setOpen(false)
    setQuery(s.address)
    setSuggestions([])

    // If autocomplete already includes coords, use them
    if (s.lat && s.lng) {
      onChange({ lat: s.lat, lng: s.lng, address: s.address })
      moveMap(s.lat, s.lng)
      return
    }

    // Otherwise resolve the HERE place ID
    setLoading(true)
    try {
      const res = await fetch(`/api/maps/lookup?id=${encodeURIComponent(s.id)}`)
      const data = await res.json() as { result?: LocationValue }
      if (data.result) {
        onChange(data.result)
        moveMap(data.result.lat, data.result.lng)
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Map initialisation (Leaflet loaded dynamically) ──────────────────────
  useEffect(() => {
    if (!showMap || !mapRef.current || mapReady) return

    let cancelled = false

    async function initMap() {
      // Leaflet is loaded via CDN in the page head; wait for it
      const L = await loadLeaflet()
      if (cancelled || !mapRef.current) return

      const startLat = value?.lat ?? 29.9695
      const startLng = value?.lng ?? 76.8783 // Kurukshetra default

      const map = L.map(mapRef.current, { zoomControl: true, attributionControl: true })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      map.setView([startLat, startLng], 14)
      // Force tile repaint after container is painted
      setTimeout(() => map.invalidateSize(), 100)
      setTimeout(() => map.invalidateSize(), 400)

      const marker = L.marker([startLat, startLng], { draggable: true }).addTo(map)

      // Drag marker → reverse geocode
      marker.on('dragend', async () => {
        const pos = marker.getLatLng()
        try {
          const res = await fetch(`/api/maps/reverse?lat=${pos.lat}&lng=${pos.lng}`)
          const data = await res.json() as { result?: LocationValue }
          if (data.result) {
            setQuery(data.result.address)
            onChange(data.result)
          }
        } catch { /* ignore */ }
      })

      // Click map → move marker + reverse geocode
      map.on('click', async (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng)
        try {
          const res = await fetch(`/api/maps/reverse?lat=${e.latlng.lat}&lng=${e.latlng.lng}`)
          const data = await res.json() as { result?: LocationValue }
          if (data.result) {
            setQuery(data.result.address)
            onChange(data.result)
          }
        } catch { /* ignore */ }
      })

      leafletRef.current = { map, marker }
      setMapReady(true)
    }

    initMap()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap, mapRef.current])

  function moveMap(lat: number, lng: number) {
    if (!leafletRef.current) return
    const { map, marker } = leafletRef.current
    map.setView([lat, lng], 16)
    marker.setLatLng([lat, lng])
  }

  // ── "Use my location" ────────────────────────────────────────────────────
  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      moveMap(lat, lng)
      try {
        const res = await fetch(`/api/maps/reverse?lat=${lat}&lng=${lng}`)
        const data = await res.json() as { result?: LocationValue }
        if (data.result) {
          setQuery(data.result.address)
          onChange(data.result)
        }
      } catch { /* ignore */ }
    })
  }

  return (
    <div style={{ position: 'relative' }}>
      {label && (
        <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.teal, marginBottom: 5 }}>
          {label}{required && <span style={{ color: C.red, marginLeft: 2 }}>*</span>}
        </label>
      )}

      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%', boxSizing: 'border-box',
            border: `1.5px solid ${C.border}`, borderRadius: 8,
            padding: '9px 40px 9px 14px', fontSize: 13,
            outline: 'none', background: C.surface,
          }}
        />
        {/* Location pin icon */}
        <button
          type="button"
          onClick={useMyLocation}
          title="Use my current location"
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 2,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
          </svg>
        </button>
        {loading && (
          <span style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.muted }}>...</span>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999,
          background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,.10)', marginTop: 3, overflow: 'hidden',
        }}>
          {suggestions.map(s => (
            <button
              key={s.id}
              type="button"
              onMouseDown={() => selectSuggestion(s)}
              style={{
                width: '100%', textAlign: 'left', padding: '9px 14px',
                border: 'none', background: 'none', cursor: 'pointer',
                borderBottom: `1px solid ${C.border}`, fontSize: 13,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 1 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.address}</div>
            </button>
          ))}
        </div>
      )}

      {/* Map */}
      {showMap && (
        <div
          ref={mapRef}
          style={{
            marginTop: 10,
            height: mapHeight,
            width: '100%',
            borderRadius: 10,
            border: `1.5px solid ${C.border}`,
            overflow: 'hidden',
            background: C.bg,
            display: 'block',
            position: 'relative',
          }}
        />
      )}

      {/* Selected location summary */}
      {value?.lat && value?.lng && (
        <div style={{ marginTop: 5, fontSize: 11, color: C.muted }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={C.teal} style={{ marginRight: 3 }}>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          {value.city && <span style={{ marginLeft: 6 }}>· {value.city}{value.state ? `, ${value.state}` : ''}</span>}
        </div>
      )}
    </div>
  )
}

// ── Leaflet loader (CDN, avoids SSR issues) ──────────────────────────────────
declare const L: typeof import('leaflet')

function loadLeaflet(): Promise<typeof L> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'))
    if ((window as unknown as { L?: typeof L }).L) return resolve((window as unknown as { L: typeof L }).L)

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      // Fix default marker icons
      const w = window as unknown as { L: typeof L }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (w.L.Icon.Default.prototype as any)._getIconUrl
      w.L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
      resolve(w.L)
    }
    script.onerror = reject
    document.head.appendChild(script)
  })
}
