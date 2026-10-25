'use client'

/**
 * BusinessMap — Leaflet map showing a single business pin.
 * Includes an "Open in Maps" button that deep-links to Google / Apple Maps.
 */

import { useEffect, useRef } from 'react'
import { viewOnMapUrl, directionsUrl } from '@/lib/maps'

interface Props {
  lat: number
  lon: number
  name: string
  area: string
}

export default function BusinessMap({ lat, lon, name, area }: Props) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Custom branded pin
      const pinIcon = L.divIcon({
        className: '',
        html: `
          <div style="
            width: 36px; height: 44px; position: relative;
            filter: drop-shadow(0 3px 6px rgba(0,0,0,.35));
          ">
            <div style="
              width: 36px; height: 36px;
              background: #12343b;
              border: 3px solid #fff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              display: flex; align-items: center; justify-content: center;
            ">
              <svg style="transform: rotate(45deg);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div style="
              width: 6px; height: 6px;
              background: #12343b;
              border-radius: 50%;
              margin: 2px auto 0;
            "></div>
          </div>
        `,
        iconSize:    [36, 44],
        iconAnchor:  [18, 44],
        popupAnchor: [0, -46],
      })

      L.marker([lat, lon], { icon: pinIcon })
        .addTo(map)
        .bindPopup(`<strong>${name}</strong><br><span style="color:#6b7280;font-size:12px">${area}, Kurukshetra</span>`)
        .openPopup()

      map.setView([lat, lon], 15)
    })

    return () => { mapInstance.current?.remove(); mapInstance.current = null }
  }, [lat, lon, name, area])

  const handleOpenMaps = () => {
    window.open(viewOnMapUrl({ lat, lon, label: name }), '_blank', 'noopener,noreferrer')
  }

  const handleDirections = () => {
    // From: user's current location (browser geolocation) → business
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const url = directionsUrl(
            { lat: pos.coords.latitude, lon: pos.coords.longitude },
            { lat, lon, label: name },
          )
          window.open(url, '_blank', 'noopener,noreferrer')
        },
        () => {
          // Fallback if user denies location — open Google Maps at the business
          window.open(viewOnMapUrl({ lat, lon, label: name }), '_blank', 'noopener,noreferrer')
        },
      )
    } else {
      window.open(viewOnMapUrl({ lat, lon, label: name }), '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mapRef}
        style={{ height: 240, width: '100%' }}
        aria-label={`Map showing ${name}`}
      />

      {/* Floating action buttons */}
      <div style={{
        position: 'absolute', bottom: 10, left: 10, right: 10,
        display: 'flex', gap: 8, zIndex: 1000,
        pointerEvents: 'none',
      }}>
        <button
          onClick={handleDirections}
          style={{
            pointerEvents: 'all',
            background: '#1d4ed8', color: '#fff',
            border: 'none', borderRadius: 8,
            padding: '8px 14px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,.25)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Get Directions
        </button>

        <button
          onClick={handleOpenMaps}
          style={{
            pointerEvents: 'all',
            background: 'white', color: '#12343b',
            border: '1.5px solid #e5e7eb', borderRadius: 8,
            padding: '8px 14px', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,.15)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          Open in Maps
        </button>
      </div>
    </div>
  )
}
