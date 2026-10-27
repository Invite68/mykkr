/**
 * here.ts — Server-side HERE Maps API utility
 *
 * SECURITY:
 *  - HERE_MAPS_API_KEY is SERVER SIDE ONLY — never NEXT_PUBLIC_, never logged,
 *    never returned in any API response, never imported in any client component.
 *  - This file must only be imported inside /app/api/ routes or Server Components.
 *  - All results are sanitised before returning to the client.
 */

export interface GeoPoint { lat: number; lng: number }

export interface GeocodedPlace {
  title: string
  address: string
  lat: number
  lng: number
  city: string
  state: string
  country: string
  postalCode: string
}

export interface AutocompleteResult {
  id: string
  title: string
  address: string
  lat?: number
  lng?: number
}

// ── Internal key accessor (never export the key itself) ──────────────────────
function key(): string {
  const k = process.env.HERE_MAPS_API_KEY
  if (!k) throw new Error('HERE_MAPS_API_KEY is not configured')
  return k
}

const BASE = 'https://geocode.search.hereapi.com/v1'
const AUTOCOMPLETE_BASE = 'https://autocomplete.search.hereapi.com/v1'
const REVGEO_BASE = 'https://revgeocode.search.hereapi.com/v1'

// ── Geocode: address string → lat/lng ────────────────────────────────────────
export async function geocode(query: string): Promise<GeocodedPlace[]> {
  const url = new URL(`${BASE}/geocode`)
  url.searchParams.set('q', query)
  url.searchParams.set('in', 'countryCode:IND')  // restrict to India
  url.searchParams.set('limit', '5')
  url.searchParams.set('apiKey', key())

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return []

  const json = await res.json() as { items?: HereGeoItem[] }
  return (json.items ?? []).map(sanitiseGeoItem)
}

// ── Reverse geocode: lat/lng → address ──────────────────────────────────────
export async function reverseGeocode(lat: number, lng: number): Promise<GeocodedPlace | null> {
  const url = new URL(`${REVGEO_BASE}/revgeocode`)
  url.searchParams.set('at', `${lat},${lng}`)
  url.searchParams.set('lang', 'en-US')
  url.searchParams.set('apiKey', key())

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return null

  const json = await res.json() as { items?: HereGeoItem[] }
  const item = json.items?.[0]
  return item ? sanitiseGeoItem(item) : null
}

// ── Autocomplete: partial text → suggestions ────────────────────────────────
export async function autocomplete(
  q: string,
  centerLat?: number,
  centerLng?: number,
): Promise<AutocompleteResult[]> {
  if (!q || q.length < 2) return []

  const url = new URL(`${AUTOCOMPLETE_BASE}/autocomplete`)
  url.searchParams.set('q', q)
  url.searchParams.set('in', 'countryCode:IND')
  url.searchParams.set('limit', '7')
  if (centerLat && centerLng) {
    url.searchParams.set('at', `${centerLat},${centerLng}`)
  }
  url.searchParams.set('apiKey', key())

  const res = await fetch(url.toString(), { next: { revalidate: 60 } })
  if (!res.ok) return []

  const json = await res.json() as { items?: HereAutoItem[] }
  return (json.items ?? []).map(item => ({
    id: item.id,
    title: item.title,
    address: item.address?.label ?? item.title,
  }))
}

// ── Lookup: HERE place ID → full details ────────────────────────────────────
export async function lookupById(id: string): Promise<GeocodedPlace | null> {
  const url = new URL(`${BASE}/lookup`)
  url.searchParams.set('id', id)
  url.searchParams.set('apiKey', key())

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return null

  const item = await res.json() as HereGeoItem
  return sanitiseGeoItem(item)
}

// ── Internal types ───────────────────────────────────────────────────────────
interface HereGeoItem {
  id?: string
  title: string
  address?: {
    label?: string
    city?: string
    state?: string
    countryName?: string
    postalCode?: string
  }
  position?: { lat: number; lng: number }
}

interface HereAutoItem {
  id: string
  title: string
  address?: { label?: string }
}

function sanitiseGeoItem(item: HereGeoItem): GeocodedPlace {
  return {
    title: item.title,
    address: item.address?.label ?? item.title,
    lat: item.position?.lat ?? 0,
    lng: item.position?.lng ?? 0,
    city: item.address?.city ?? '',
    state: item.address?.state ?? '',
    country: item.address?.countryName ?? 'India',
    postalCode: item.address?.postalCode ?? '',
  }
}
