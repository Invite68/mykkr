import type { MetadataRoute } from 'next'
import { SITE } from '@/config/platform'
import { CATEGORY_GROUPS, subSlug } from '@/data/categories'
import { BUSINESSES } from '@/data/businesses'

const BASE = SITE.url

/**
 * Sitemap — generated at build time for SSG.
 * Helps search engines discover all public pages and improves launch
 * crawl speed (launch GO checklist: "Google index").
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/categories`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/find-book`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/rides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Category group pages
  const group_pages: MetadataRoute.Sitemap = CATEGORY_GROUPS.map((g) => ({
    url: `${BASE}/c/${g.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Subcategory pages
  const sub_pages: MetadataRoute.Sitemap = CATEGORY_GROUPS.flatMap((g) =>
    g.subcategories.slice(1).map((s) => ({
      url: `${BASE}/c/${g.slug}/${subSlug(s)}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  )

  // Business detail pages
  const biz_pages: MetadataRoute.Sitemap = BUSINESSES.map((b) => ({
    url: `${BASE}/business/${b.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...static_pages, ...group_pages, ...sub_pages, ...biz_pages]
}
