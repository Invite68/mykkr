import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import SubNav from '@/components/category/SubNav'
import HowItWorks from '@/components/category/HowItWorks'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { CATEGORY_GROUPS, getGroup, getSub } from '@/data/categories'
import { businessesInSub } from '@/data/businesses'

type Params = Promise<{ group: string; sub: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORY_GROUPS.flatMap((g) => g.subcategories.map((s) => ({ group: g.slug, sub: s.slug })))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params
  const sub = getSub(p.group, p.sub)
  return { title: sub?.name ?? 'Category' }
}

export default async function SubCategoryPage({ params }: { params: Params }) {
  const p = await params
  const group = getGroup(p.group)
  const sub = getSub(p.group, p.sub)
  if (!group || !sub) notFound()

  const businesses = businessesInSub(sub.slug)

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { href: '/categories', label: 'Categories' },
          { href: `/c/${group.slug}`, label: group.name },
          { label: sub.name },
        ]}
      />
      <h1 className="page-title">{sub.icon} {sub.name}</h1>
      <p className="page-sub">
        {businesses.length} listed in Kurukshetra <span lang="hi">· {sub.nameHi}</span>
      </p>
      <SubNav group={group} activeSub={sub.slug} />
      <HowItWorks kind={sub.kind} />

      {sub.kind === 'ride' && (
        <div className="banner banner-ok" style={{ marginTop: 12 }}>
          <span aria-hidden="true">🚕</span>
          <div>
            Need a cab right now? <Link href="/rides" className="link">Request a ride from nearby drivers →</Link>
          </div>
        </div>
      )}
      {sub.bookable && sub.kind !== 'ride' && (
        <div className="banner banner-ok" style={{ marginTop: 12 }}>
          <span aria-hidden="true">📅</span>
          <div>
            Need it on a specific date? <Link href={`/find-book?sub=${sub.slug}`} className="link">Check availability with Find &amp; Book →</Link>
          </div>
        </div>
      )}

      <section className="sec">
        <BusinessGrid businesses={businesses} />
      </section>
    </div>
  )
}
