import type { Metadata } from 'next'
import { getAdminClient } from '@/lib/supabase'
import TrackingClient from './TrackingClient'

interface Props { params: Promise<{ ref: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ref } = await params
  return { title: `Track job ${ref} — My KKR`, robots: { index: false, follow: false } }
}

export default async function TrackPage({ params }: Props) {
  const { ref } = await params
  const supabase = getAdminClient()

  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('ref', ref)
    .single()

  if (!data) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <h1 className="page-title">Job not found</h1>
        <p className="muted">Check the reference number and try again.</p>
      </div>
    )
  }

  return <TrackingClient initialJob={data} />
}
