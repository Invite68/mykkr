import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container narrow">
      <div className="empty">
        <svg
          width="48" height="48" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.3"
          strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          style={{ opacity: 0.28, margin: '0 auto 16px', display: 'block' }}
        >
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
        <h1 className="page-title">Page not found</h1>
        <p className="muted" style={{ margin: '8px 0 16px' }}>That link does not go anywhere on My KKR.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <Link href="/" className="btn btn-primary">Go home</Link>
          <Link href="/categories" className="btn btn-outline">Browse categories</Link>
        </div>
      </div>
    </div>
  )
}
