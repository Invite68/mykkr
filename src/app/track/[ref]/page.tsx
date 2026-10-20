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
        <div style={{ fontSize: 40 }}>🔍</div>
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
