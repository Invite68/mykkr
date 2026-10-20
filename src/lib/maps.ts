/**
 * maps.ts — deep-link helpers for native map apps.
 *
 * "Open in Maps" button:
 *   - Android  → geo: URI  (opens Google Maps, OLA Maps, etc.)
 *   - iOS      → Apple Maps by default; user can pick Google Maps from share sheet
 *   - Desktop  → Google Maps web URL
 *
 * We detect the platform in the browser and return the right URL.
 * For directions we always send origin + destination so the user
 * sees a pre-drawn route, not just a pin.
 */

export interface LatLon { lat: number; lon: number }

/** Return the best "open directions" URL for the current platform. */
export function directionsUrl(
  from: LatLon & { label?: string },
  to:   LatLon & { label?: string },
): string {
  if (typeof navigator === 'undefined') {
    // SSR fallback — Google Maps web
    return googleMapsDirections(from, to)
  }

  const ua = navigator.userAgent

  // iOS → Apple Maps URI (works in Safari; user can redirect to Google Maps)
  if (/iPhone|iPad|iPod/i.test(ua)) {
    const origin = `${from.lat},${from.lon}`
    const dest   = `${to.lat},${to.lon}`
    return `maps://maps.apple.com/?saddr=${origin}&daddr=${dest}&dirflg=d`
  }

  // Android → geo: URI  (intent is handled by the OS; Google Maps, OLA, etc.)
  if (/Android/i.test(ua)) {
    const origin = encodeURIComponent(`${from.lat},${from.lon}`)
    const dest   = encodeURIComponent(`${to.lat},${to.lon}`)
    return `geo:0,0?q=${dest}&saddr=${origin}`
  }

  // Desktop / everything else → Google Maps web
  return googleMapsDirections(from, to)
}

function googleMapsDirections(from: LatLon, to: LatLon): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&origin=${from.lat},${from.lon}` +
    `&destination=${to.lat},${to.lon}` +
    `&travelmode=driving`
  )
}

/** Single-point "View on map" link (business pin, no directions). */
export function viewOnMapUrl(point: LatLon & { label?: string }): string {
  const label = point.label ? encodeURIComponent(point.label) : ''
  if (typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    return `maps://maps.apple.com/?ll=${point.lat},${point.lon}&q=${label}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lon}`
}

/**
 * Fetch a driving route from OSRM (free, no API key).
 * Returns an array of [lat, lon] pairs for drawing a polyline.
 */
export async function fetchRoute(
  from: LatLon,
  to:   LatLon,
): Promise<[number, number][]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lon},${from.lat};${to.lon},${to.lat}` +
    `?overview=full&geometries=geojson`

  const res = await fetch(url)
  if (!res.ok) return []

  const json = await res.json() as {
    routes?: Array<{ geometry: { coordinates: [number, number][] } }>
  }
  const coords = json.routes?.[0]?.geometry?.coordinates ?? []
  // OSRM returns [lon, lat] — flip to [lat, lon] for Leaflet
  return coords.map(([lon, lat]) => [lat, lon])
}
