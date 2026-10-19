import Link from 'next/link'
import { Fragment } from 'react'

export interface Crumb {
  href?: string
  label: string
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link href="/">🏠 Home</Link>
      {items.map((c) => (
        <Fragment key={c.label}>
          <span aria-hidden="true">›</span>
          {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  )
}
