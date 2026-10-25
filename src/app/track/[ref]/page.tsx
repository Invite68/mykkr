import type { Metadata } from 'next'
import { query } from '@/lib/db'
import { decryptPII } from '@/lib/encrypt'
import type { Job, SafeJob, JobStatus } from '@/lib/job-types'
import TrackingClient from './TrackingClient'

interface Props { params: Promise<{ ref: string }> }

const SHOW_PHONE: JobStatus[] = ['accepted', 'driver_en_route', 'picked_up']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params
  return { title: `Track job ${ref} — My KKR`, robots: { index: false, follow: false } }
}

export default async function TrackPage({ params }: Props) {
  const { ref } = await params

  const rows = await query<Job>('SELECT * FROM jobs WHERE ref = $1', [ref])

  if (rows.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ color: 'var(--text-3)', opacity: 0.4, margin: '0 auto 8px' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h1 className="page-title">Job not found</h1>
        <p className="muted">Check the reference number and try again.</p>
      </div>
    )
  }

  const job = rows[0]
  const revealPhone = SHOW_PHONE.includes(job.status)

  // Strip encrypted phone fields — only reveal driver_phone once accepted
  const { customer_phone, driver_phone, ...rest } = job
  void customer_phone

  const safe: SafeJob = {
    ...rest,
    driver_phone: revealPhone && driver_phone ? decryptPII(driver_phone) : null,
  }

  return <TrackingClient initialJob={safe} />
}
