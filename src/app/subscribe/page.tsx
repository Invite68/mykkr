import type { Metadata } from 'next'
import { Suspense } from 'react'
import SubscribePage from './SubscribePage'

export const metadata: Metadata = {
  title: 'Subscribe — My KKR',
  description: 'Start your My KKR subscription and unlock the full platform.',
  robots: 'noindex,nofollow',
}

export default function Subscribe() {
  return (
    <Suspense fallback={
      <div className="container" style={{ maxWidth: 480, paddingTop: 60, textAlign: 'center' }}>
        <p className="muted">Loading…</p>
      </div>
    }>
      <SubscribePage />
    </Suspense>
  )
}
