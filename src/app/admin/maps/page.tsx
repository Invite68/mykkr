'use client'
/**
 * Admin → Maps — test/demo page for HERE Maps integration.
 * Shows LocationPicker (address search + pin) and BusinessMap (read-only).
 */
import { useState } from 'react'
import dynamic from 'next/dynamic'
import type { LocationValue } from '@/components/maps/LocationPicker'

// Dynamic imports — Leaflet can't run on SSR
const LocationPicker = dynamic(() => import('@/components/maps/LocationPicker'), { ssr: false })
const BusinessMap = dynamic(() => import('@/components/maps/BusinessMap'), { ssr: false })

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', bg: '#f1f5f9', surface: '#fff' }

export default function AdminMapsPage() {
  const [picked, setPicked] = useState<LocationValue | null>({
    lat: 29.9695,
    lng: 76.8783,
    address: 'Kurukshetra, Haryana 136118, India',
    city: 'Kurukshetra',
    state: 'Haryana',
  })

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Maps Integration</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>
          HERE Maps — powered by server-side API proxy. API key never reaches the browser.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 18 }}>

        {/* Location Picker */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 16px' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: C.teal }}>Address Search + Pin</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.muted }}>
            Type any Indian address — autocomplete powered by HERE. Drag the pin or click the map to fine-tune.
          </p>
          <LocationPicker
            value={picked ?? undefined}
            onChange={setPicked}
            label="Business Location"
            placeholder="e.g. Sharma Kirana, Pipli Road, Kurukshetra"
            showMap
            mapHeight={220}
          />
          {picked && (
            <div style={{ marginTop: 14, background: C.bg, borderRadius: 8, padding: '10px 12px', fontSize: 12 }}>
              <div style={{ fontWeight: 700, color: C.teal, marginBottom: 4 }}>Selected location</div>
              <div style={{ color: '#334155' }}>{picked.address}</div>
              <div style={{ color: C.muted, marginTop: 2 }}>lat {picked.lat.toFixed(5)}, lng {picked.lng.toFixed(5)}</div>
              {picked.city && <div style={{ color: C.muted }}>{picked.city}{picked.state ? `, ${picked.state}` : ''} {picked.postalCode ?? ''}</div>}
            </div>
          )}
        </div>

        {/* Read-only Business Map */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 16px' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 800, color: C.teal }}>Business Map (Read-only)</h2>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: C.muted }}>
            Shown on customer-facing business profile pages.
          </p>
          {picked ? (
            <BusinessMap
              lat={picked.lat}
              lng={picked.lng}
              name="KKR Laundry Hub"
              address={picked.address}
              height={260}
            />
          ) : (
            <div style={{ height: 260, background: C.bg, borderRadius: 10, border: `1.5px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 13 }}>
              Select a location above
            </div>
          )}
          <div style={{ marginTop: 10, fontSize: 11, color: C.muted }}>
            Clicking the marker shows business name + address popup.
            Use the directions link to open in Google Maps / Apple Maps / OLA.
          </div>
        </div>

        {/* Security info card */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '18px 16px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 800, color: '#166534' }}>Security Architecture</h2>
          {[
            ['HERE API Key', 'Stored in Coolify env var only — server-side, never NEXT_PUBLIC_'],
            ['Geocoding', '/api/maps/geocode — server route, key injected at edge'],
            ['Reverse Geo', '/api/maps/reverse — coords → address, no key to client'],
            ['Lookup', '/api/maps/lookup — resolves place IDs server-side'],
            ['Map Tiles', 'OpenStreetMap CDN — no key needed, no tracking'],
            ['Leaflet', 'Loaded dynamically client-side — ssr: false, no bundle impact'],
          ].map(([title, desc]) => (
            <div key={title} style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>{title}</div>
              <div style={{ fontSize: 11, color: '#15803d' }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
