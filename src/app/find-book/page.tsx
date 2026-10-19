import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import FindBookForm from '@/components/booking/FindBookForm'

export const metadata: Metadata = { title: 'Find & Book' }

type SearchParams = Promise<{ sub?: string }>

export default async function FindBookPage({ searchParams }: { searchParams: SearchParams }) {
  const { sub } = await searchParams
  return (
    <div className="container narrow">
      <Breadcrumbs items={[{ label: 'Find & Book' }]} />
      <h1 className="page-title">Find &amp; Book</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>Search by service, area and date — then contact the provider directly.</p>
      <FindBookForm initialSub={typeof sub === 'string' ? sub : ''} />
    </div>
  )
}
