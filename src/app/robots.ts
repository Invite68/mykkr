import type { MetadataRoute } from 'next'
import { SITE } from '@/config/platform'

/**
 * robots.txt — tells search engines what to crawl.
 * Dashboard, register, and internal pages are noindexed here.
 * Individual dashboard pages also set their own robots metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',  // role dashboards are private / dynamic
          '/register',    // sign-up page has no SEO value
          '/post',        // post-requirement wizard
          '/api/',        // never expose API routes to crawlers
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  }
}
