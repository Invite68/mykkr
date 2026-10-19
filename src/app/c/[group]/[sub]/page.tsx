import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { BusinessGrid } from '@/components/business/BusinessCard'
import { CATEGORY_GROUPS, subSlug, subFromSlug } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'

type Params = Promise<{ group: string; sub: string }>

export const dynamicParams = false

// Use clean ASCII slugs (no emoji) so Next.js standalone serves them reliably
export function generateStaticParams() {
  return CATEGORY_GROUPS.flatMap((g) =>
    g.subcategories.map((s) => ({
      group: g.slug,
      sub: subSlug(s),
    }))
  )
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const p = await params
  const group = CATEGORY_GROUPS.find((g) => g.slug === p.group)
  const label = group ? (subFromSlug(group, p.sub) ?? p.sub) : p.sub
  return { title: `${label} — My KKR` }
}

export default async function SubCategoryPage({ params }: { params: Params }) {
  const p = await params
  const group = CATEGORY_GROUPS.find((g) => g.slug === p.group)
  if (!group) notFound()

  const subLabel = subFromSlug(group, p.sub)
  if (!subLabel) notFound()

  const businesses = BUSINESSES.filter(
    (b) => b.cat === p.group && b.sub === subLabel
  )

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { href: '/categories', label: 'Categories' },
          { href: `/c/${group.slug}`, label: group.label },
          { label: subLabel },
        ]}
      />
      <h1 className="page-title">{subLabel}</h1>
      <p className="page-sub">
        {businesses.length} listed in Kurukshetra
      </p>

      {group.slug === 'transport' && (
        <div className="banner banner-ok" style={{ marginTop: 12 }}>
          <span aria-hidden="true">🚕</span>
          <div>
            Need a ride right now?{' '}
            <Link href="/rides" className="link">Request from nearby drivers →</Link>
          </div>
        </div>
      )}

      <section className="sec">
        <BusinessGrid businesses={businesses} />
      </section>
    </div>
  )
}
