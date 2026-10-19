import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import SearchForm from '@/components/search/SearchForm'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { BUSINESSES, searchBusinesses } from '@/data/businesses'

export const metadata: Metadata = { title: 'Search' }

type SearchParams = Promise<{ q?: string | string[] }>

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const raw = (await searchParams).q
  const q = (Array.isArray(raw) ? raw[0] : raw ?? '').slice(0, 100)
  const results = q.trim() ? searchBusinesses(q) : BUSINESSES

  return (
    <div className="container">
      <Breadcrumbs items={[{ label: 'Search' }]} />
      <h1 className="page-title">{q.trim() ? `Results for “${q}”` : 'All businesses'}</h1>
      <p className="page-sub">{results.length} found in Kurukshetra</p>
      <div style={{ margin: '14px 0' }}>
        <SearchForm variant="page" initialQuery={q} key={q} />
      </div>
      <BusinessGrid businesses={results} />
    </div>
  )
}
