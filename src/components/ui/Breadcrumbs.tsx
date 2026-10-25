import Link from 'next/link'
import { Fragment } from 'react'

export interface Crumb {
  href?: string
  label: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Home
      </Link>
      {items.map((c) => (
        <Fragment key={c.label}>
          <span aria-hidden="true">›</span>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
