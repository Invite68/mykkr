import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import SubNav from '@/components/category/SubNav'
import HowItWorks from '@/components/category/HowItWorks'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { CATEGORY_GROUPS, getGroup } from '@/data/categories'
import { businessesInSub } from '@/data/businesses'

type Params = Promise<{ group: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORY_GROUPS.map((g) => ({ group: g.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const group = getGroup((await params).group)
  return { title: group?.name ?? 'Category', description: group?.blurb }
}

export default async function GroupPage({ params }: { params: Params }) {
  const group = getGroup((await params).group)
  if (!group) notFound()

  return (
    <div className="container">
      <Breadcrumbs items={[{ href: '/categories', label: 'Categories' }, { label: group.name }]} />
      <h1 className="page-title">{group.icon} {group.name}</h1>
      <p className="page-sub">{group.blurb} <span lang="hi">· {group.nameHi}</span></p>
      <SubNav group={group} />
      <HowItWorks kind={group.subcategories[0].kind} />

      {group.subcategories.map((sub) => (
        <section className="sec" key={sub.slug} aria-labelledby={`s-${sub.slug}`}>
          <div className="sec-head">
            <h2 className="sec-title" id={`s-${sub.slug}`}>{sub.icon} {sub.name}</h2>
            <Link href={`/c/${group.slug}/${sub.slug}`} className="link">See all →</Link>
          </div>
          <BusinessGrid businesses={businessesInSub(sub.slug)} />
        </section>
      ))}
    </div>
  )
}
