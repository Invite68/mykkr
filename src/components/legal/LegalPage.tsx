import type { ReactNode } from 'react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export interface LegalSection {
  title: string
  body: ReactNode
}

export default function LegalPage({
  title,
  effective,
  summary,
  sections,
}: {
  title: string
  effective: string
  summary?: ReactNode
  sections: LegalSection[]
}) {
  return (
    <div className="container narrow">
      <Breadcrumbs items={[{ label: title }]} />
      <h1 className="page-title">{title}</h1>
      <p className="page-sub" style={{ marginBottom: 16 }}>Effective {effective} · My KKR, Kurukshetra, Haryana, India</p>
      {summary && <div className="banner banner-info" style={{ marginBottom: 14 }}><div>{summary}</div></div>}
      {sections.map((s, i) => (
        <section className="panel" key={s.title}>
          <h2 className="panel-title">{i + 1}. {s.title}</h2>
          <div className="prose">{s.body}</div>
        </section>
      ))}
    </div>
  )
}
