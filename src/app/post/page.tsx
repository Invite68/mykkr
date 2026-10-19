import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import PostRequirementWizard from '@/components/post/PostRequirementWizard'

export const metadata: Metadata = { title: 'Post a requirement' }

type SearchParams = Promise<{ sub?: string }>

export default async function PostPage({ searchParams }: { searchParams: SearchParams }) {
  const { sub } = await searchParams
  return (
    <div className="container narrow">
      <Breadcrumbs items={[{ label: 'Post Requirement' }]} />
      <h1 className="page-title">Post a requirement</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>
        Tell local businesses what you need — they send you quotes. Great for bigger jobs, events and bulk orders.
      </p>
      <PostRequirementWizard initialSub={typeof sub === 'string' ? sub : ''} />
    </div>
  )
}
