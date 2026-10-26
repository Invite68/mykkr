/**
 * Business Portal — Edit Profile
 * Full profile editor: cover, logo, description, portfolio, services, hours.
 * "Make Live" and "View Public" wired to public profile page.
 */

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceEntry {
  id: string
  name: string
  priceMin: string
  priceMax: string
  unit: string
  desc: string
}

// ── Demo data (pre-filled for Sharma Kirana demo account) ────────────────────

const INITIAL_SERVICES: ServiceEntry[] = [
  { id: 's1', name: 'Grocery Delivery',    priceMin: '50',   priceMax: '100',  unit: 'per order', desc: 'Fresh groceries delivered within 2 km of store' },
  { id: 's2', name: 'Monthly Kirana Pack', priceMin: '800',  priceMax: '1500', unit: 'per month', desc: 'Customised monthly essentials box, home delivery' },
]

const INITIAL_HOURS: Record<string, { open: boolean; start: string; end: string }> = {
  Mon: { open: true,  start: '09:00', end: '18:00' },
  Tue: { open: true,  start: '09:00', end: '18:00' },
  Wed: { open: true,  start: '09:00', end: '18:00' },
  Thu: { open: true,  start: '09:00', end: '18:00' },
  Fri: { open: true,  start: '09:00', end: '17:00' },
  Sat: { open: true,  start: '10:00', end: '14:00' },
  Sun: { open: false, start: '',      end: ''       },
}

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// ── Small reusable pieces ─────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: '#f97316', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8, marginTop: 24 }}>
      {children}
    </div>
  )
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>{label}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: '#475569', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: '#111827', border: '1.5px solid #1e3a50',
  borderRadius: 8, padding: '9px 12px',
  fontSize: 13, color: '#e2e8f0', outline: 'none',
}

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: 'vertical' as const, minHeight: 80, fontFamily: 'inherit',
}

// ── Upload placeholder ────────────────────────────────────────────────────────

function UploadSlot({ label, aspect = 'square' }: { label: string; aspect?: 'square' | 'wide' }) {
  const [hovered, setHovered] = useState(false)
  const dim = aspect === 'wide' ? { width: '100%', height: 120 } : { width: 100, height: 100 }
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...dim,
        border: `2px dashed ${hovered ? '#f97316' : '#1e3a50'}`,
        borderRadius: 10, flexShrink: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', transition: 'border-color 0.15s',
        background: hovered ? '#f9731608' : '#111827',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={hovered ? '#f97316' : '#334155'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
      <div style={{ fontSize: 10, color: hovered ? '#f97316' : '#334155', marginTop: 4, textAlign: 'center', padding: '0 8px' }}>{label}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const [saved, setSaved]       = useState(false)
  const [tab, setTab]           = useState<'profile' | 'services' | 'listings' | 'hours'>('profile')
  const [services, setServices] = useState<ServiceEntry[]>(INITIAL_SERVICES)
  const [hours, setHours]       = useState(INITIAL_HOURS)
  const [bio, setBio]           = useState('Trusted neighbourhood kirana store serving Thanesar for 22 years. Fresh fruits, vegetables, daily essentials and home delivery within 2 km.')
  const [phone, setPhone]       = useState('+91 98765 43210')
  const [whatsapp, setWhatsapp] = useState('+91 98765 43210')
  const [gstin, setGstin]       = useState('06AAAPL0267H1Z3')

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function addService() {
    setServices(prev => [...prev, {
      id: `s${Date.now()}`, name: '', priceMin: '', priceMax: '', unit: 'per job', desc: '',
    }])
  }

  function updateService(id: string, field: keyof ServiceEntry, val: string) {
    setServices(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s))
  }

  function removeService(id: string) {
    setServices(prev => prev.filter(s => s.id !== id))
  }

  const tabs: { id: typeof tab; label: string }[] = [
    { id: 'profile',  label: 'Profile & Media' },
    { id: 'services', label: 'Services & Prices' },
    { id: 'listings', label: 'Listings / Products' },
    { id: 'hours',    label: 'Hours & Availability' },
  ]

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginBottom: 3 }}>Business Profile</div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: '#f1f5f9', margin: 0 }}>Edit Profile</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/business/sharma-kirana-store" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            border: '1.5px solid #334155', color: '#94a3b8',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View public page
          </Link>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: saved ? '#16a34a' : '#f97316', color: '#fff',
            fontSize: 13, fontWeight: 700, transition: 'background 0.2s',
          }}>
            {saved
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Make Live</>
            }
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '1.5px solid #1e2d3a' }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 16px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
            color: tab === t.id ? '#f97316' : '#64748b', background: 'transparent',
            border: 'none', borderBottom: tab === t.id ? '2px solid #f97316' : '2px solid transparent',
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: Profile & Media ───────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div>
          <SectionLabel>Cover Photo</SectionLabel>
          <UploadSlot label="Upload cover photo (recommended 1440×400)" aspect="wide" />

          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', marginTop: 24 }}>
            <div>
              <SectionLabel>Business Logo</SectionLabel>
              <UploadSlot label="Upload logo (square, min 400×400)" />
            </div>
            <div style={{ flex: 1 }}>
              <Field label="Business Name">
                <input style={inputStyle} defaultValue="Sharma Kirana Store" />
              </Field>
              <Field label="Tagline / Short description" hint="Shown under your name on the public profile">
                <input style={inputStyle} defaultValue="Your trusted neighbourhood store since 2002" />
              </Field>
            </div>
          </div>

          <SectionLabel>About Your Business</SectionLabel>
          <Field label="Full Description" hint="Tell customers what makes you different — experience, specialities, service area">
            <textarea style={textareaStyle} value={bio} onChange={e => setBio(e.target.value)} />
          </Field>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Phone number (customers can see this)">
              <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} />
            </Field>
            <Field label="WhatsApp number">
              <input style={inputStyle} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </Field>
            <Field label="Address / Area">
              <input style={inputStyle} defaultValue="Opp. Bus Stand, Thanesar, Kurukshetra 136118" />
            </Field>
            <Field label="GSTIN" hint="Optional — adds a 'GST Verified' badge to your profile">
              <input style={inputStyle} value={gstin} onChange={e => setGstin(e.target.value)} />
            </Field>
          </div>

          <SectionLabel>Expertise / Qualifications</SectionLabel>
          <Field label="Years in business">
            <input style={inputStyle} type="number" defaultValue="22" />
          </Field>
          <Field label="Certifications / Memberships" hint="e.g. FSSAI licence number, trade association">
            <input style={inputStyle} defaultValue="FSSAI: 13421076000043" />
          </Field>
          <Field label="Languages spoken">
            <input style={inputStyle} defaultValue="Hindi, English, Haryanvi" />
          </Field>

          <SectionLabel>Portfolio (photos + 1 video)</SectionLabel>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
            Add up to 5 photos and 1 video of your work, shop, or products. These appear on your public profile.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <UploadSlot label="Photo 1" />
            <UploadSlot label="Photo 2" />
            <UploadSlot label="Photo 3" />
            <UploadSlot label="Photo 4" />
            <UploadSlot label="Photo 5" />
            <UploadSlot label="Video (max 60s)" />
          </div>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>
            JPG/PNG up to 8 MB each · MP4/MOV up to 100 MB · Accepted formats
          </div>

          <SectionLabel>Ratings & Social Proof</SectionLabel>
          <div style={{
            background: '#111827', border: '1.5px solid #1e3a50', borderRadius: 10,
            padding: 14, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316' }}>4.7</div>
              <div style={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                {[1,2,3,4,5].map(n => (
                  <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={n <= 4 ? '#f97316' : 'none'} stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <div style={{ fontSize: 10, color: '#64748b', marginTop: 2 }}>38 reviews</div>
            </div>
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Rating is calculated automatically from verified customer reviews after completed orders. You cannot edit it directly — keeping it honest for buyers.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Services & Prices ─────────────────────────────────────────── */}
      {tab === 'services' && (
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            List the types of services you offer and an estimated price range. Customers see this on your public profile before contacting you.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {services.map((svc) => (
              <div key={svc.id} style={{
                background: '#1a2535', border: '1.5px solid #1e3a50', borderRadius: 10, padding: 14,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
                  <Field label="Service name">
                    <input style={inputStyle} value={svc.name} onChange={e => updateService(svc.id, 'name', e.target.value)} placeholder="e.g. Grocery Delivery" />
                  </Field>
                  <button onClick={() => removeService(svc.id)} style={{
                    alignSelf: 'flex-end', marginBottom: 14, padding: '8px 12px',
                    borderRadius: 8, border: '1.5px solid #3f1a1a', background: '#1a0f0f',
                    color: '#f87171', cursor: 'pointer', fontSize: 12,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <Field label="Min price (₹)">
                    <input style={inputStyle} type="number" value={svc.priceMin} onChange={e => updateService(svc.id, 'priceMin', e.target.value)} placeholder="50" />
                  </Field>
                  <Field label="Max price (₹)">
                    <input style={inputStyle} type="number" value={svc.priceMax} onChange={e => updateService(svc.id, 'priceMax', e.target.value)} placeholder="500" />
                  </Field>
                  <Field label="Unit">
                    <select style={inputStyle} value={svc.unit} onChange={e => updateService(svc.id, 'unit', e.target.value)}>
                      {['per job','per hour','per day','per month','per order','per sqft','per person','fixed'].map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Short description">
                  <input style={inputStyle} value={svc.desc} onChange={e => updateService(svc.id, 'desc', e.target.value)} placeholder="What's included, area covered, etc." />
                </Field>
              </div>
            ))}
          </div>

          <button onClick={addService} style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 12,
            padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
            border: '1.5px dashed #1e3a50', background: 'transparent',
            color: '#94a3b8', fontSize: 13, fontWeight: 600,
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add another service type
          </button>

          <div style={{
            marginTop: 16, padding: 12, borderRadius: 8,
            background: '#111827', border: '1px solid #1e3a50', fontSize: 12, color: '#64748b',
          }}>
            Price ranges are shown publicly as estimates only — actual price is agreed directly between you and the customer. My KKR charges no commission on any transaction.
          </div>
        </div>
      )}

      {/* ── TAB: Listings / Products ───────────────────────────────────────── */}
      {tab === 'listings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              Products and goods available in your shop. Customers can browse, add to cart, and place orders directly with you.
            </div>
            <button style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#f97316', color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add product
            </button>
          </div>

          {/* Sample listing rows */}
          {[
            { name: 'Basmati Rice 5 kg',   price: '₹385', stock: '48 in stock',  active: true  },
            { name: 'Amul Full Cream Milk', price: '₹62',  stock: 'Daily supply', active: true  },
            { name: 'Surf Excel 1 kg',      price: '₹195', stock: '12 in stock',  active: true  },
            { name: 'Seasonal Fruit Box',   price: '₹280', stock: 'Out of stock', active: false },
          ].map((p, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: '#1a2535', borderRadius: 10, marginBottom: 8,
              border: '1.5px solid #1e3a50',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                background: '#111827', border: '1px solid #1e3a50',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{p.price} · {p.stock}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                  background: p.active ? '#16a34a18' : '#37415130',
                  color: p.active ? '#4ade80' : '#64748b',
                  border: `1px solid ${p.active ? '#16a34a30' : '#37415150'}`,
                }}>{p.active ? 'Live' : 'Hidden'}</span>
                <button style={{ padding: '6px 10px', borderRadius: 7, border: '1.5px solid #1e3a50', background: '#111827', color: '#94a3b8', cursor: 'pointer', fontSize: 12 }}>Edit</button>
              </div>
            </div>
          ))}

          <div style={{ marginTop: 10, fontSize: 11, color: '#475569' }}>
            Up to unlimited listings on Business Plan (₹99+GST/month).
          </div>
        </div>
      )}

      {/* ── TAB: Hours & Availability ──────────────────────────────────────── */}
      {tab === 'hours' && (
        <div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
            Set your regular business hours. Customers see these on your profile. You can override them for public holidays.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DAYS.map((day) => {
              const h = hours[day]
              return (
                <div key={day} style={{
                  display: 'grid', gridTemplateColumns: '72px 1fr', gap: 12, alignItems: 'center',
                  padding: '10px 14px', background: '#1a2535', borderRadius: 10,
                  border: '1.5px solid #1e3a50',
                }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{day}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={h.open} onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.checked } }))} style={{ width: 16, height: 16, accentColor: '#f97316' }} />
                      <span style={{ fontSize: 12, color: h.open ? '#94a3b8' : '#475569', fontWeight: 600 }}>Open</span>
                    </label>
                    {h.open && (
                      <>
                        <input type="time" value={h.start} onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], start: e.target.value } }))}
                          style={{ ...inputStyle, width: 110, padding: '7px 10px', colorScheme: 'dark' }} />
                        <span style={{ color: '#475569', fontSize: 12 }}>to</span>
                        <input type="time" value={h.end} onChange={e => setHours(prev => ({ ...prev, [day]: { ...prev[day], end: e.target.value } }))}
                          style={{ ...inputStyle, width: 110, padding: '7px 10px', colorScheme: 'dark' }} />
                      </>
                    )}
                    {!h.open && (
                      <span style={{ fontSize: 12, color: '#475569', fontStyle: 'italic' }}>Closed</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{
            marginTop: 16, padding: 12, borderRadius: 8,
            background: '#111827', border: '1px solid #1e3a50', fontSize: 12, color: '#64748b',
          }}>
            Customers see &quot;Open now&quot; or &quot;Closed&quot; badges based on these hours in their local time (IST).
          </div>
        </div>
      )}

      {/* ── Floating save ─────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Link href="/business/sharma-kirana-store" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          border: '1.5px solid #334155', color: '#94a3b8',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View public page
        </Link>
        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px',
          borderRadius: 8, border: 'none', cursor: 'pointer',
          background: saved ? '#16a34a' : '#f97316', color: '#fff',
          fontSize: 13, fontWeight: 700, transition: 'background 0.2s',
        }}>
          {saved
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Make Live</>
          }
        </button>
      </div>
    </>
  )
}
