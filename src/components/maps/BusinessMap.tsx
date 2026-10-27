'use client'
/**
 * BusinessMap — read-only map showing a business location pin.
 *
 * Uses OpenStreetMap tiles (no key in browser) + HERE geocoding server-side.
 * Clicking the marker opens native maps app (directionsUrl from maps.ts).
 */

import { useEffect, useRef } from 'react'

interface Props {
  lat: number
  lng: number
  name: string
  address?: string
  height?: number
  zoom?: number
}

declare const L: typeof import('leaflet')

export default function BusinessMap({ lat, lng, name, address, height = 240, zoom = 15 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    let map: import('leaflet').Map | null = null

    async function init() {
      const Leaflet = await loadLeaflet()
      if (!ref.current) return

      map = Leaflet.map(ref.current, { zoomControl: true, scrollWheelZoom: false, dragging: true })

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      map.setView([lat, lng], zoom)
      setTimeout(() => map?.invalidateSize(), 100)
      setTimeout(() => map?.invalidateSize(), 400)

      const marker = Leaflet.marker([lat, lng]).addTo(map)
      marker.bindPopup(`<b>${name}</b>${address ? `<br>${address}` : ''}`)
    }

    init()
    return () => { map?.remove() }
  }, [lat, lng, name, address, zoom])

  return (
    <div
      ref={ref}
      style={{
        height,
        width: '100%',
        display: 'block',
        position: 'relative',
        borderRadius: 10,
        border: '1.5px solid #e2e8f0',
        overflow: 'hidden',
        background: '#f1f5f9',
      }}
    />
  )
}

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
