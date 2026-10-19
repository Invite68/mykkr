'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export default function SearchForm({
  variant = 'hero',
  initialQuery = '',
}: {
  variant?: 'hero' | 'nav' | 'page'
  initialQuery?: string
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)

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
      <span aria-hidden="true" style={{ alignSelf: 'center', paddingLeft: 10, fontSize: 16 }}>🔍</span>
      <input
        id={`search-${variant}`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Try "electrician Model Town" or "banquet"…'
        maxLength={100}
        autoComplete="off"
        enterKeyHint="search"
      />
      <button type="submit">Search</button>
    </form>
  )
}
