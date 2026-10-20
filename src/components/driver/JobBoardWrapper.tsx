'use client'

/**
 * Thin client wrapper so `ssr: false` is legal in a Client Component.
 * The driver dashboard (Server Component) imports this instead of JobBoard directly.
 */
import dynamic from 'next/dynamic'

const JobBoard = dynamic(() => import('./JobBoard'), {
  ssr: false,
  loading: () => (
    <p className="muted" style={{ padding: 24, textAlign: 'center' }}>
      Loading live jobs…
    </p>
  ),
})

export default function JobBoardWrapper() {
  return <JobBoard />
}
