/** Route + fare estimation using OSRM (allowed by CSP connect-src), with a straight-line fallback. */

export interface LatLon {
  lat: number
  lon: number
}

export interface RouteEstimate {
  km: number
  minutes: number
  approximate: boolean
}

export async function estimateRoute(a: LatLon, b: LatLon, signal?: AbortSignal): Promise<RouteEstimate> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=false`
    const res = await fetch(url, { signal })
    if (!res.ok) throw new Error('OSRM error')
    const data = (await res.json()) as { routes?: { distance: number; duration: number }[] }
    const route = data.routes?.[0]
    if (!route) throw new Error('No route')
    return { km: route.distance / 1000, minutes: Math.round(route.duration / 60), approximate: false }
  } catch (err) {
    if ((err as Error).name === 'AbortError') throw err
    const km = haversineKm(a, b) * 1.3 // road factor
    return { km, minutes: Math.round(km * 3), approximate: true }
  }
}

export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLon = ((b.lon - a.lon) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

export async function geocode(query: string, signal?: AbortSignal): Promise<LatLon | null> {
  // Use our server-side proxy — avoids mixed-content block on HTTP deployments
  const url = '/api/maps/nominatim?q=' + encodeURIComponent(`${query} Kurukshetra Haryana India`)
  const res = await fetch(url, { signal })
  if (!res.ok) return null
  const data = (await res.json()) as { lat: string; lon: string }[]
  if (!data.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
}

export function mapsLinks(a: LatLon, b: LatLon) {
  return {
    google: `https://www.google.com/maps/dir/?api=1&origin=${a.lat},${a.lon}&destination=${b.lat},${b.lon}&travelmode=driving`,
    apple: `https://maps.apple.com/?saddr=${a.lat},${a.lon}&daddr=${b.lat},${b.lon}&dirflg=d`,
    waze: `https://waze.com/ul?ll=${b.lat},${b.lon}&navigate=yes`,
    osm: `https://www.openstreetmap.org/directions?from=${a.lat},${a.lon}&to=${b.lat},${b.lon}&engine=fossgis_osrm_car`,
  }
}

export const MIN_FARE = 30

export function fareFor(km: number, perKm: number): number {
  return Math.max(MIN_FARE, Math.round(km * perKm))
}
