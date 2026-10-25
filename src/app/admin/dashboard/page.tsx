'use client'

import { useEffect, useState } from 'react'
import { getAuth } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

interface Stats {
  totalBusinesses: number
  verifiedBusinesses: number
  pendingVerification: number
  activeBusinessSubs: number
  totalCustomers: number
  activeCustomerSubs: number
  trialCustomers: number
  totalDrivers: number
  totalJobsAllTime: number
  openJobs: number
  completedJobs: number
  cancelledJobs: number
  businessSubRevenue: number
  customerSubRevenue: number
  totalRevenuePaise: number
  totalCategories: number
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

function fmt(paise: number) {
  return '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })
}

export default function AdminDashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const auth  = getAuth(firebaseApp)
      const token = await auth.currentUser?.getIdToken()
      const res   = await fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
      const json  = await res.json() as { stats?: Stats; error?: string }
      if (!res.ok) { setError(json.error ?? 'Failed'); return }
      setStats(json.stats ?? null)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  if (loading) return <p>Loading stats…</p>
  if (error)   return <p style={{ color: 'var(--error)' }}>{error}</p>
  if (!stats)  return null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ margin: 0 }}>Dashboard</h1>
        <button className="btn btn-secondary" onClick={() => void load()}>↻ Refresh</button>
      </div>

      <Section title="Revenue (Subscriptions Only)">
        <StatCard label="Total Revenue" value={fmt(stats.totalRevenuePaise)} color="var(--primary)" />
        <StatCard label="Business Subs Revenue" value={fmt(stats.businessSubRevenue)} />
        <StatCard label="Customer Subs Revenue" value={fmt(stats.customerSubRevenue)} />
      </Section>

      <Section title="Businesses">
        <StatCard label="Total Businesses" value={stats.totalBusinesses} />
        <StatCard label="Verified (GSTIN)" value={stats.verifiedBusinesses} color="green" />
        <StatCard label="Pending Verification" value={stats.pendingVerification} color="orange" />
        <StatCard label="Active Subscriptions" value={stats.activeBusinessSubs} sub="₹99/mo" />
      </Section>

      <Section title="Customers">
        <StatCard label="Total Customers" value={stats.totalCustomers} />
        <StatCard label="Active Subscribers" value={stats.activeCustomerSubs} sub="₹9.99/mo" />
        <StatCard label="On Free Trial" value={stats.trialCustomers} />
      </Section>

      <Section title="Drivers & Jobs">
        <StatCard label="Total Drivers" value={stats.totalDrivers} />
        <StatCard label="Open Jobs" value={stats.openJobs} color="orange" />
        <StatCard label="Completed Jobs" value={stats.completedJobs} color="green" />
        <StatCard label="Cancelled Jobs" value={stats.cancelledJobs} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-muted)' }}>{title}</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {children}
      </div>
    </div>
  )
}
