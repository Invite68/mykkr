/** Kurukshetra district areas with approximate coordinates (lat, lon). */

export interface Area {
  name: string
  lat: number
  lon: number
}

export interface AreaGroup {
  label: string
  areas: Area[]
}

export const AREA_GROUPS: AreaGroup[] = [
  {
    label: 'Tehsils',
    areas: [
      { name: 'Thanesar', lat: 29.9695, lon: 76.8783 },
      { name: 'Pehowa', lat: 29.9833, lon: 76.5833 },
      { name: 'Ismailabad', lat: 29.92, lon: 76.7 },
      { name: 'Shahabad', lat: 30.1667, lon: 76.8167 },
      { name: 'Ladwa', lat: 29.9997, lon: 77.0425 },
      { name: 'Babain', lat: 30.15, lon: 77.0167 },
    ],
  },
  {
    label: 'Sectors',
    areas: [
      { name: 'Sector 2', lat: 29.964, lon: 76.872 },
      { name: 'Sector 3', lat: 29.965, lon: 76.874 },
      { name: 'Sector 5', lat: 29.967, lon: 76.876 },
      { name: 'Sector 7', lat: 29.97, lon: 76.88 },
      { name: 'Sector 13', lat: 29.955, lon: 76.89 },
      { name: 'Sector 30', lat: 29.958, lon: 76.878 },
      { name: 'Sector 40', lat: 29.96, lon: 76.87 },
    ],
  },
  {
    label: 'Localities',
    areas: [
      { name: 'Pipli', lat: 29.955, lon: 76.84 },
      { name: 'Brahmsarovar', lat: 29.9737, lon: 76.8168 },
      { name: 'Model Town', lat: 29.966, lon: 76.858 },
      { name: 'Kalyan Nagar', lat: 29.962, lon: 76.871 },
      { name: 'Mohan Nagar', lat: 29.963, lon: 76.873 },
      { name: 'Sunder Pur', lat: 29.961, lon: 76.872 },
      { name: 'Shyam Colony', lat: 29.964, lon: 76.877 },
      { name: 'Dara Kalan', lat: 29.97, lon: 76.865 },
      { name: 'KU / NIT Area', lat: 29.952, lon: 76.886 },
    ],
  },
]

export const ALL_AREAS: Area[] = AREA_GROUPS.flatMap((g) => g.areas)

export function findArea(name: string): Area | undefined {
  return ALL_AREAS.find((a) => a.name === name)
}

/** Default map centre — Thanesar */
export const KKR_CENTER = { lat: 29.9695, lon: 76.8783 }

export function osmEmbedUrl(lat: number, lon: number, delta = 0.03): string {
  const bbox = [lon - delta, lat - delta, lon + delta, lat + delta].map((n) => n.toFixed(4)).join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`
}

export function osmBboxUrl(a: { lat: number; lon: number }, b: { lat: number; lon: number }): string {
  const pad = 0.02
  const bbox = [
    Math.min(a.lon, b.lon) - pad,
    Math.min(a.lat, b.lat) - pad,
    Math.max(a.lon, b.lon) + pad,
    Math.max(a.lat, b.lat) + pad,
  ]
    .map((n) => n.toFixed(4))
    .join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${a.lat}%2C${a.lon}`
}
