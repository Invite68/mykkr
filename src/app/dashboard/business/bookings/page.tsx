'use client'

/**
 * Business Portal — Incoming Service Bookings
 * View, accept, reject, complete service booking requests from customers.
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

const C = {
  teal: '#12343b', tealMid: '#2d545e', gold: '#e1b382',
  border: '#e2e8f0', text1: '#0f172a', text2: '#475569', bg: '#f8fafc',
}

type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled' | 'completed'

interface Booking {
  id: string
  ref: string
  category: string
  service_name: string
  description: string | null
  customer_name: string
  address_label: string
  requested_date: string
  requested_time: string
  quoted_price: number | null
  status: BookingStatus
  reject_reason: string | null
  cancel_reason: string | null
  created_at: string
}

const STATUS_COLOURS: Record<BookingStatus, { bg: string; color: string; label: string }> = {
  pending:   { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
  accepted:  { bg: '#d1fae5', color: '#065f46', label: 'Accepted' },
  rejected:  { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  cancelled: { bg: '#f1f5f9', color: '#475569', label: 'Cancelled' },
  completed: { bg: '#dbeafe', color: '#1e40af', label: 'Completed' },
}

const ALL_FILTERS: { value: string; label: string }[] = [
  { value: '',           label: 'All' },
  { value: 'pending',    label: 'Pending' },
  { value: 'accepted',   label: 'Accepted' },
  { value: 'completed',  label: 'Completed' },
  { value: 'rejected',   label: 'Rejected' },
  { value: 'cancelled',  label: 'Cancelled' },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function IcBooking() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function IcCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
}
function IcX() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function IcComplete() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}

export default function BusinessBookingsPage() {
  const [bookings, setBookings]   = useState<Booking[]>([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('')
  const [acting, setActing]       = useState<string | null>(null)
  const [rejectId, setRejectId]   = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError]         = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const url = filter ? `/api/business/bookings?status=${filter}` : '/api/business/bookings'
      const res = await fetch(url, { headers: { 'Cache-Control': 'no-store' } })
      if (!res.ok) { setError('Failed to load bookings'); return }
      const data = await res.json() as { bookings: Booking[] }
      setBookings(data.bookings ?? [])
    } catch { setError('Network error') } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { void load() }, [load])

  async function act(id: string, action: string, extra?: Record<string, unknown>) {
    setActing(id + action)
    try {
      const res = await fetch(`/api/service-bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setError(json.error ?? 'Action failed')
        return
      }
      await load()
    } catch { setError('Network error') } finally { setActing(null) }
  }

  const pending = bookings.filter(b => b.status === 'pending').length

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px 80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 8 }}>
        <Link href="/dashboard/business" style={{ color: C.text2, textDecoration: 'none', fontSize: 13 }}>← Dashboard</Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ color: C.teal }}><IcBooking /></span>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: C.text1, margin: 0 }}>Service Bookings</h1>
        {pending > 0 && (
          <span style={{ background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 99, padding: '2px 8px' }}>
            {pending} new
          </span>
        )}
      </div>
      <p style={{ color: C.text2, fontSize: 13, marginBottom: 20 }}>
        Customers who booked your services. Accept, quote a price, or reject.
      </p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {error} <button onClick={() => setError('')} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 700 }}>✕</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {ALL_FILTERS.map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            style={{
              padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none',
              background: filter === f.value ? C.teal : C.bg,
              color: filter === f.value ? '#fff' : C.text2,
              boxShadow: filter === f.value ? '0 1px 4px rgba(18,52,59,0.2)' : 'none',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Reject modal */}
      {rejectId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, color: C.text1 }}>Reject this booking?</h3>
            <p style={{ color: C.text2, fontSize: 13, margin: '0 0 14px' }}>Optionally explain why (sent to customer).</p>
            <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Fully booked on that date, try next week"
              maxLength={300} rows={3}
              style={{ width: '100%', borderRadius: 8, border: `1px solid ${C.border}`, padding: '8px 12px', fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 14, justifyContent: 'flex-end' }}>
              <button onClick={() => { setRejectId(null); setRejectReason('') }}
                style={{ padding: '8px 18px', borderRadius: 8, border: `1px solid ${C.border}`, background: '#fff', color: C.text2, cursor: 'pointer', fontSize: 13 }}>
                Cancel
              </button>
              <button onClick={async () => {
                await act(rejectId, 'reject', { reason: rejectReason })
                setRejectId(null); setRejectReason('')
              }} disabled={!!acting}
                style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                {acting ? 'Rejecting…' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: C.text2, padding: '40px 0', fontSize: 14 }}>Loading…</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: C.text2 }}>
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>
            <IcBooking />
          </div>
          <p style={{ fontSize: 14, margin: 0 }}>No {filter || ''} bookings yet.</p>
          <p style={{ fontSize: 12, marginTop: 6 }}>Customers will appear here when they book your services.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookings.map(b => {
            const s = STATUS_COLOURS[b.status]
            return (
              <div key={b.id} style={{
                background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`,
                padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: C.text2, letterSpacing: 0.5 }}>#{b.ref}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: C.text1, margin: '2px 0 0' }}>{b.service_name}</h3>
                    <span style={{ fontSize: 12, color: C.text2 }}>{b.category}</span>
                  </div>
                  <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </div>

                {/* Details */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '6px 16px', margin: '12px 0 0', fontSize: 13, color: C.text2 }}>
                  <div><strong style={{ color: C.text1 }}>Customer:</strong> {b.customer_name}</div>
                  <div><strong style={{ color: C.text1 }}>Date:</strong> {formatDate(b.requested_date)} at {b.requested_time}</div>
                  <div><strong style={{ color: C.text1 }}>Location:</strong> {b.address_label}</div>
                  {b.quoted_price && <div><strong style={{ color: C.text1 }}>Quoted:</strong> ₹{b.quoted_price.toLocaleString('en-IN')}</div>}
                  {b.description && <div style={{ gridColumn: '1/-1' }}><strong style={{ color: C.text1 }}>Note:</strong> {b.description}</div>}
                  {b.reject_reason && <div style={{ gridColumn: '1/-1', color: '#991b1b' }}><strong>Reject reason:</strong> {b.reject_reason}</div>}
                </div>

                {/* Actions */}
                {b.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <button onClick={() => act(b.id, 'accept')} disabled={!!acting}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <IcCheck /> {acting === b.id + 'accept' ? 'Accepting…' : 'Accept'}
                    </button>
                    <button onClick={() => setRejectId(b.id)} disabled={!!acting}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, border: `1px solid #fca5a5`, background: '#fff', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <IcX /> Reject
                    </button>
                  </div>
                )}

                {b.status === 'accepted' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    <button onClick={() => act(b.id, 'complete')} disabled={!!acting}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 16px', borderRadius: 8, border: 'none', background: C.teal, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      <IcComplete /> {acting === b.id + 'complete' ? 'Marking…' : 'Mark Complete'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
