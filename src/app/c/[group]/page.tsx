import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import CategoryPageFeed from '@/components/category/CategoryPageFeed'
import { CATEGORY_GROUPS } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'
import { getGroupIcon } from '@/data/categoryIcons'

type Params = Promise<{ group: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORY_GROUPS.map((g) => ({ group: g.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const slug = (await params).group
  const group = CATEGORY_GROUPS.find((g) => g.slug === slug)
  return { title: group ? `${group.label} — My KKR` : 'Category' }
}

export default async function GroupPage({ params }: { params: Params }) {
  const slug = (await params).group
  const group = CATEGORY_GROUPS.find((g) => g.slug === slug)
  if (!group) notFound()

  const allInGroup = BUSINESSES.filter((b) => b.cat === slug)
  const GroupIcon = getGroupIcon(slug)

  return (
    <div className="container">
      <Breadcrumbs items={[{ href: '/categories', label: 'Categories' }, { label: group.label }]} />
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(18,52,59,.1)', flexShrink: 0 }}>
          <GroupIcon size={20} strokeWidth={1.8} color="#12343b" />
        </span>
        {group.label}
      </h1>

      {/* L2 subcategory chip strip + filtered business grid */}
      <CategoryPageFeed group={group} businesses={allInGroup} />

      <div className="banner banner-ok" style={{ marginTop: 12 }}>
        <span aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
        <div>
          Own a business in this category?{' '}
          <Link href="/register?role=business" className="link">List for free trial →</Link>
        </div>
      </div>
    </div>
  )
}
