'use client'
/**
 * LocationPicker — address search + interactive map pin.
 *
 * Uses an <iframe> with a self-contained Leaflet page (no Next.js SSR conflicts).
 * All HERE geocoding goes through /api/maps/* server routes — key never in browser.
 */

import { useState, useCallback, useRef, useEffect, useId } from 'react'

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

const C = {
  teal: '#12343b', border: '#e2e8f0', muted: '#64748b',
  bg: '#f8fafc', surface: '#fff', red: '#dc2626',
}

export default function LocationPicker({
  value,
  onChange,
  placeholder = 'Search address...',
  label,
  required,
  disabled,
  showMap = true,
  mapHeight = 240,
}: Props) {
  const frameId = useId().replace(/:/g, '')
  const [query, setQuery] = useState(value?.address ?? '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const frameReady = useRef(false)

  // Keep input in sync if parent changes value
  useEffect(() => {
    if (value?.address && value.address !== query) setQuery(value.address)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.address])

  // Send location to iframe when value changes
  useEffect(() => {
    if (!value || !frameRef.current || !frameReady.current) return
    frameRef.current.contentWindow?.postMessage(
      { type: 'SET_LOCATION', lat: value.lat, lng: value.lng },
      '*'
    )
  }, [value?.lat, value?.lng])

  // Listen for location changes from iframe (drag/click)
  useEffect(() => {
    async function onMessage(e: MessageEvent) {
      if (e.data?.type !== 'LOCATION_CHANGED') return
      const { lat, lng } = e.data
      try {
        const res = await fetch(`/api/maps/reverse?lat=${lat}&lng=${lng}`)
        const data = await res.json() as { result?: LocationValue }
        if (data.result) {
          setQuery(data.result.address)
          onChange(data.result)
        }
      } catch { /* ignore */ }
    }
    function onReady(e: MessageEvent) {
      if (e.data?.type !== 'MAP_READY') return
      frameReady.current = true
      if (value) {
        frameRef.current?.contentWindow?.postMessage(
          { type: 'SET_LOCATION', lat: value.lat, lng: value.lng },
          '*'
        )
      }
    }
    window.addEventListener('message', onMessage)
    window.addEventListener('message', onReady)
    return () => {
      window.removeEventListener('message', onMessage)
      window.removeEventListener('message', onReady)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange])

  // Autocomplete search
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

  const selectSuggestion = async (s: Suggestion) => {
    setOpen(false)
    setQuery(s.address)
    setSuggestions([])

    if (s.lat && s.lng) {
      const loc = { lat: s.lat, lng: s.lng, address: s.address }
      onChange(loc)
      frameRef.current?.contentWindow?.postMessage({ type: 'SET_LOCATION', lat: s.lat, lng: s.lng }, '*')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/maps/lookup?id=${encodeURIComponent(s.id)}`)
      const data = await res.json() as { result?: LocationValue }
      if (data.result) {
        onChange(data.result)
        frameRef.current?.contentWindow?.postMessage({ type: 'SET_LOCATION', lat: data.result.lat, lng: data.result.lng }, '*')
      }
    } finally {
      setLoading(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(async pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      frameRef.current?.contentWindow?.postMessage({ type: 'SET_LOCATION', lat, lng }, '*')
      try {
        const res = await fetch(`/api/maps/reverse?lat=${lat}&lng=${lng}`)
        const data = await res.json() as { result?: LocationValue }
        if (data.result) { setQuery(data.result.address); onChange(data.result) }
      } catch { /* ignore */ }
    })
  }

  // Build the iframe src as a data URI with self-contained Leaflet HTML
  const startLat = value?.lat ?? 29.9695
  const startLng = value?.lng ?? 76.8783
  const mapSrc = buildMapHtml(startLat, startLng, frameId)

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
        <button
          type="button"
          onClick={useMyLocation}
          title="Use my current location"
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>
          </svg>
        </button>
        {loading && <span style={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.muted }}>...</span>}
      </div>

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 999, background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.10)', marginTop: 3, overflow: 'hidden' }}>
          {suggestions.map(s => (
            <button key={s.id} type="button" onMouseDown={() => selectSuggestion(s)}
              style={{ width: '100%', textAlign: 'left', padding: '9px 14px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: `1px solid ${C.border}`, fontSize: 13 }}
              onMouseEnter={e => (e.currentTarget.style.background = C.bg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 1 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.address}</div>
            </button>
          ))}
        </div>
      )}

      {/* Map iframe */}
      {showMap && (
        <iframe
          ref={frameRef}
          srcDoc={mapSrc}
          style={{ marginTop: 10, width: '100%', height: mapHeight, border: `1.5px solid ${C.border}`, borderRadius: 10, display: 'block' }}
          title="Location map"
        />
      )}

      {value?.lat && value?.lng && (
        <div style={{ marginTop: 5, fontSize: 11, color: C.muted }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill={C.teal} style={{ marginRight: 3 }}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          {value.city && <span style={{ marginLeft: 6 }}>· {value.city}{value.state ? `, ${value.state}` : ''}</span>}
        </div>
      )}
    </div>
  )
}

function buildMapHtml(lat: number, lng: number, id: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;}
  #map{cursor:crosshair;}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  var lat=${lat}, lng=${lng};
  var map = L.map('map',{zoomControl:true,attributionControl:true}).setView([lat,lng],14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OpenStreetMap contributors',maxZoom:19
  }).addTo(map);
  var marker = L.marker([lat,lng],{draggable:true}).addTo(map);

  function notify(lt,ln){
    window.parent.postMessage({type:'LOCATION_CHANGED',lat:lt,lng:ln},'*');
  }
  marker.on('dragend',function(){
    var p=marker.getLatLng();notify(p.lat,p.lng);
  });
  map.on('click',function(e){
    marker.setLatLng(e.latlng);
    notify(e.latlng.lat,e.latlng.lng);
  });
  window.addEventListener('message',function(e){
    if(e.data&&e.data.type==='SET_LOCATION'){
      marker.setLatLng([e.data.lat,e.data.lng]);
      map.setView([e.data.lat,e.data.lng],16);
    }
  });
  window.parent.postMessage({type:'MAP_READY',id:'${id}'},'*');
})();
</script>
</body>
</html>`
}
