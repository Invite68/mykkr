'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, type FormEvent } from 'react'

// Rotating placeholder suggestions — give users ideas, reduces blank-page paralysis
const PLACEHOLDERS = [
  'Try "electrician Model Town"…',
  'Try "banquet hall for 500 guests"…',
  'Try "fresh sabzi delivery"…',
  'Try "cab to Chandigarh"…',
  'Try "painter near me"…',
  'Try "sweets for Diwali"…',
  'Try "plumber emergency"…',
  'Try "office space for rent"…',
]

export default function SearchForm({
  variant = 'hero',
  initialQuery = '',
}: {
  variant?: 'hero' | 'nav' | 'page'
  initialQuery?: string
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const [phIdx, setPhIdx] = useState(0)

  // Rotate placeholder every 3.5 s (hero only — doesn't affect other variants)
  useEffect(() => {
    if (variant !== 'hero') return
    const id = setInterval(() => setPhIdx((i) => (i + 1) % PLACEHOLDERS.length), 3500)
    return () => clearInterval(id)
  }, [variant])

  function submit(e: FormEvent) {
    e.preventDefault()
    const query = q.trim().slice(0, 100)
    if (!query) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  if (variant === 'nav') {
    return (
      <form onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="nav-search">Search My KKR</label>
        <div className="search-input-wrap">
          <input
            id="nav-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search shops, services, venues…"
            maxLength={100}
            autoComplete="off"
          />
          <button type="submit" aria-label="Search">🔍</button>
        </div>
      </form>
    )
  }

  return (
    <form className="search-box" onSubmit={submit} role="search">
      <label className="sr-only" htmlFor={`search-${variant}`}>Search</label>
      <span aria-hidden="true" style={{ alignSelf: 'center', paddingLeft: 14, fontSize: 18, opacity: .55 }}>🔍</span>
      <input
        id={`search-${variant}`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={variant === 'hero' ? PLACEHOLDERS[phIdx] : 'Search businesses, services, venues…'}
        maxLength={100}
        autoComplete="off"
        enterKeyHint="search"
        spellCheck={false}
      />
      <button type="submit" className="search-submit-btn">
        Search
      </button>
    </form>
  )
}
