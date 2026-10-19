import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container narrow">
      <div className="empty">
        <div className="empty-icon" aria-hidden="true">🧭</div>
        <h1 className="page-title">Page not found</h1>
        <p className="muted" style={{ margin: '8px 0 16px' }}>That link doesn’t go anywhere on My KKR.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/" className="btn btn-primary">Go home</Link>
          <Link href="/categories" className="btn btn-outline">Browse categories</Link>
        </div>
      </div>
    </div>
  )
}
