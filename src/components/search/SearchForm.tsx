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
        <input id="nav-search" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search shops, services, venues…" maxLength={100} />
      </form>
    )
  }

  return (
    <form className="search-box" onSubmit={submit} role="search">
      <label className="sr-only" htmlFor={`search-${variant}`}>Search</label>
      <span aria-hidden="true" style={{ alignSelf: 'center', paddingLeft: 6 }}>🔍</span>
      <input
        id={`search-${variant}`}
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder='Try "electrician Model Town" or "banquet"'
        maxLength={100}
      />
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
  )
}
