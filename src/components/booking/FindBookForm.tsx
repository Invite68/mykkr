'use client'

import { useMemo, useState, type FormEvent } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { KKR_CENTER, findArea } from '@/data/areas'

// Bookable categories — services, venues, events + all others
const ALL_CATS = [
  { slug: '', label: 'Any category', icon: '🔍' },
  ...CATEGORY_GROUPS.map((g) => ({ slug: g.slug, label: g.label, icon: g.icon })),
]

const SLOTS = ['Any time', 'Morning (8–12)', 'Afternoon (12–4)', 'Evening (4–8)', 'Full day']

const QUICK_PICKS = [
  '🎉 Wedding event', '🏛️ Venue / Hall', '🎵 DJ & Sound',
  '🍽️ Catering', '📷 Photography', '🔧 Home repair', '🚗 Transport',
]

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
        setGeoMsg('Location set — finding businesses nearby…')
      },
      () => setGeoMsg('Could not get location — pick an area instead.'),
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  function applyQuick(label: string) {
    // Strip leading emoji + space
    const clean = label.replace(/^[\p{Emoji}\s]+/u, '').trim()
    setKeyword(clean)
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
      // Sort same-area first
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

          {/* Quick picks */}
          <div className="findbk-quick">
            <button
              type="button"
              className={`findbk-chip${!keyword ? ' active' : ''}`}
              onClick={() => setKeyword('')}
            >Any service</button>
            {QUICK_PICKS.map((q) => {
              const clean = q.replace(/^[\p{Emoji}\s]+/u, '').trim()
              return (
                <button
                  type="button"
                  key={q}
                  className={`findbk-chip${keyword === clean ? ' active' : ''}`}
                  onClick={() => applyQuick(q)}
                >
                  {q}
                </button>
              )
            })}
          </div>

          {/* Free-text keyword */}
          <input
            className="input"
            type="text"
            placeholder="Or describe in detail…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ marginTop: 10 }}
          />

          {/* Category filter */}
          <select
            className="select"
            value={catSlug}
            onChange={(e) => setCatSlug(e.target.value)}
            style={{ marginTop: 8 }}
          >
            {ALL_CATS.map((c) => (
              <option key={c.slug} value={c.slug}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>

        {/* Step 2: Where */}
        <div className="findbk-step">
          <div className="findbk-step-head">
            <span className="findbk-num">2</span>
            <span className="findbk-step-title">WHERE IN KURUKSHETRA?</span>
          </div>
          <AreaSelect id="fb-area" value={area} onChange={onArea} />
          <input
            className="input"
            type="text"
            placeholder="Or type address"
            style={{ marginTop: 8 }}
          />
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
                {keyword ? ` · &ldquo;${keyword}&rdquo;` : ''}
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
