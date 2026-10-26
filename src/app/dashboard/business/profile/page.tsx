/**
 * Business Portal — Edit Profile
 * White background. Teal × Gold palette only.
 * Tabs are scrollable (overflow-x). Filtered by business type.
 * Category → Sub-category dropdowns with manual entry fallback.
 * Kurukshetra areas only. PIN validated against KKR district.
 * Listing limits: Services max 5, Goods max 16.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  teal:     '#12343b',
  tealMid:  '#2d545e',
  gold:     '#e1b382',
  goldDim:  '#c89666',
  goldBg:   'rgba(225,179,130,0.10)',
  goldB:    'rgba(225,179,130,0.25)',
  white:    '#ffffff',
  bg:       '#f8fafc',
  border:   '#e2e8f0',
  text1:    '#0f172a',
  text2:    '#475569',
  text3:    '#94a3b8',
  error:    '#dc2626',
}

// ── Kurukshetra PIN codes (valid district PINs) ────────────────────────────
const KKR_PINS = new Set([
  '136118','136119','136128','136129','136130','136131','136132','136133',
  '136034','136035','136038','136040','136041','136042','136043','136044',
  '136135','136136','136155','136156','136157',
])

// ── Kurukshetra areas ──────────────────────────────────────────────────────
const KKR_AREAS = [
  'Thanesar','Pipli','Pehowa','Shahabad','Ladwa','Ismailabad',
  'Babain','Kurukshetra (city)','Naraingarh','Jhansa','Sirsaganj',
  'Dhand','Kaithal Road Area','Ambala Road Area',
]

// ── Category hierarchy ────────────────────────────────────────────────────
const CATEGORIES: { label: string; subcats: string[] }[] = [
  { label: 'Groceries & Daily Essentials', subcats: ['Groceries','Fruits & Vegetables','Stationery & Office Supplies'] },
  { label: 'Food & Beverages',             subcats: ['Sweets & Ice Creams','Street Foods','Restaurants'] },
  { label: 'Fashion & Lifestyle',          subcats: ['Clothing','Footwear','Accessories'] },
  { label: 'Hospitality & Venues',         subcats: ['Hotels & Guest Houses','Marriage & Event Venues'] },
  { label: 'Transportation',               subcats: ['Taxis / Cabs','Auto Rickshaws','Goods Transport'] },
  { label: 'Home & Professional Services', subcats: ['Cleaning Services','Electrician','Plumber','Carpenter','Painter','Other Handyman'] },
  { label: 'Real Estate & Commercial',     subcats: ['Shops/Offices for Rent','Shops/Offices for Sale','Residential for Rent','Residential for Sale'] },
]

// ── Business type ─────────────────────────────────────────────────────────
type BizType = 'services' | 'goods'

// ── Types ─────────────────────────────────────────────────────────────────
interface ServiceEntry {
  id: string; name: string; priceMin: string; priceMax: string; unit: string; desc: string
}
interface ProductEntry {
  id: string; name: string; price: string; stock: string; active: boolean
}

const UNITS = ['per job','per hour','per day','per month','per order','per sqft','per person','fixed']
const DAYS  = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// ── Initial data ──────────────────────────────────────────────────────────
const INIT_SERVICES: ServiceEntry[] = [
  { id: 's1', name: 'Grocery Delivery',    priceMin: '50',  priceMax: '100',  unit: 'per order', desc: 'Fresh groceries delivered within 2 km of store' },
  { id: 's2', name: 'Monthly Kirana Pack', priceMin: '800', priceMax: '1500', unit: 'per month', desc: 'Customised monthly essentials box, home delivery'  },
]

const INIT_PRODUCTS: ProductEntry[] = [
  { id: 'p1', name: 'Basmati Rice 5 kg',   price: '₹385', stock: '48 in stock',  active: true  },
  { id: 'p2', name: 'Amul Full Cream Milk', price: '₹62',  stock: 'Daily supply', active: true  },
  { id: 'p3', name: 'Surf Excel 1 kg',      price: '₹195', stock: '12 in stock',  active: true  },
  { id: 'p4', name: 'Seasonal Fruit Box',   price: '₹280', stock: 'Out of stock', active: false },
]

const INIT_HOURS: Record<string, { open: boolean; start: string; end: string }> = {
  Mon: { open: true,  start: '09:00', end: '18:00' },
  Tue: { open: true,  start: '09:00', end: '18:00' },
  Wed: { open: true,  start: '09:00', end: '18:00' },
  Thu: { open: true,  start: '09:00', end: '18:00' },
  Fri: { open: true,  start: '09:00', end: '17:00' },
  Sat: { open: true,  start: '10:00', end: '14:00' },
  Sun: { open: false, start: '',      end: ''       },
}

// ── Shared field components ───────────────────────────────────────────────

const INP: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: C.white, border: `1.5px solid ${C.border}`,
  borderRadius: 8, padding: '9px 12px',
  fontSize: 13, color: C.text1, outline: 'none',
}

const SEL: React.CSSProperties = { ...INP, cursor: 'pointer' }

function Label({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 5 }}>
      {children}
      {sub && <span style={{ fontWeight: 400, color: C.text3, marginLeft: 4 }}>{sub}</span>}
    </label>
  )
}

function Field({ label, sub, hint, children }: { label: string; sub?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <Label sub={sub}>{label}</Label>
      {children}
      {hint && <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{hint}</div>}
    </div>
  )
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, color: C.teal,
      letterSpacing: 0.8, textTransform: 'uppercase',
      marginBottom: 10, marginTop: 24,
      paddingBottom: 6, borderBottom: `1.5px solid ${C.goldB}`,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      {children}
    </div>
  )
}

function UploadSlot({ label, aspect = 'square' }: { label: string; aspect?: 'square' | 'wide' }) {
  const dim = aspect === 'wide' ? { width: '100%', height: 110 } : { width: 96, height: 96 }
  return (
    <div style={{
      ...dim, border: `2px dashed ${C.border}`, borderRadius: 10, flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', background: C.bg,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
      <div style={{ fontSize: 10, color: C.text3, marginTop: 5, textAlign: 'center', padding: '0 8px' }}>{label}</div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  // Business type — in real app loaded from user record
  const [bizType, setBizType] = useState<BizType>('goods')

  const [saved,    setSaved]    = useState(false)
  const [services, setServices] = useState<ServiceEntry[]>(INIT_SERVICES)
  const [products, setProducts] = useState<ProductEntry[]>(INIT_PRODUCTS)
  const [hours,    setHours]    = useState(INIT_HOURS)

  // Profile fields
  const [bio,       setBio]      = useState('Trusted neighbourhood kirana store serving Thanesar for 22 years.')
  const [phone,     setPhone]    = useState('+91 98765 43210')
  const [whatsapp,  setWhatsapp] = useState('+91 98765 43210')
  const [gstin,     setGstin]    = useState('06AAAPL0267H1Z3')
  const [catIdx,    setCatIdx]   = useState<number | null>(null)
  const [subcat,    setSubcat]   = useState('')
  const [otherCat,  setOtherCat] = useState('')
  const [area,      setArea]     = useState('Thanesar')
  const [pin,       setPin]      = useState('136118')
  const [address,   setAddress]  = useState('Opp. Bus Stand, Thanesar')
  const [pinError,  setPinError] = useState('')

  // Tab: profile is always shown; services tab only for services type; listings only for goods type
  type Tab = 'profile' | 'services' | 'listings' | 'hours'
  const availTabs: { id: Tab; label: string }[] = [
    { id: 'profile',  label: 'Profile & Media'   },
    ...(bizType === 'services' ? [{ id: 'services' as Tab, label: 'Services & Prices' }] : []),
    ...(bizType === 'goods'    ? [{ id: 'listings' as Tab, label: 'Products & Stock'  }] : []),
    { id: 'hours', label: 'Hours & Availability' },
  ]
  const [tab, setTab] = useState<Tab>('profile')
  // If bizType changes and current tab is no longer valid, reset to profile
  const activeTab = availTabs.find(t => t.id === tab) ? tab : 'profile'

  function handleSave() {
    if (pin && !KKR_PINS.has(pin)) {
      setPinError('This PIN code is not in Kurukshetra district. Only KKR-area businesses can register.')
      return
    }
    setPinError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function addService() {
    if (services.length >= 5) { alert('Maximum 5 services allowed on this plan.'); return }
    setServices(p => [...p, { id: `s${Date.now()}`, name: '', priceMin: '', priceMax: '', unit: 'per job', desc: '' }])
  }
  function updateService(id: string, field: keyof ServiceEntry, val: string) {
    setServices(p => p.map(s => s.id === id ? { ...s, [field]: val } : s))
  }
  function removeService(id: string) { setServices(p => p.filter(s => s.id !== id)) }

  function addProduct() {
    if (products.length >= 16) { alert('Maximum 16 products allowed on this plan.'); return }
    setProducts(p => [...p, { id: `p${Date.now()}`, name: '', price: '', stock: '', active: true }])
  }
  function removeProduct(id: string) { setProducts(p => p.filter(pr => pr.id !== id)) }

  const activeCat = catIdx !== null ? CATEGORIES[catIdx] : null

  // ── Shared input/textarea style ──────────────────────────────────────────
  const TA: React.CSSProperties = { ...INP, resize: 'vertical', minHeight: 80, fontFamily: 'inherit' }

  return (
    <>
      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: C.text3, fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>Business Portal</div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: C.teal, margin: 0 }}>Edit Profile</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Link href="/business/sharma-kirana-store" style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            border: `1.5px solid ${C.border}`, color: C.text2,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View public page
          </Link>
          <button onClick={handleSave} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px',
            borderRadius: 8, border: 'none', cursor: 'pointer',
            background: saved ? '#16a34a' : C.teal, color: saved ? '#fff' : C.gold,
            fontSize: 13, fontWeight: 700, transition: 'background 0.2s',
          }}>
            {saved
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Saved!</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Make Live</>
            }
          </button>
        </div>
      </div>

      {/* Business type toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
        padding: '12px 16px', borderRadius: 10,
        background: C.bg, border: `1.5px solid ${C.border}`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: C.teal, marginRight: 4 }}>Business type:</div>
        {(['services','goods'] as BizType[]).map(t => (
          <button key={t} onClick={() => { setBizType(t); setTab('profile') }} style={{
            padding: '6px 14px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: bizType === t ? C.teal : C.white,
            color: bizType === t ? C.gold : C.text2,
            border: `1.5px solid ${bizType === t ? C.teal : C.border}`,
          }}>
            {t === 'services' ? 'Services business' : 'Goods / shop'}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', fontSize: 11, color: C.text3 }}>
          {bizType === 'services' ? 'Max 5 service listings' : 'Max 16 product listings'}
        </div>
      </div>

      {/* Scrollable tabs */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', marginBottom: 20, borderBottom: `1.5px solid ${C.border}` }}>
        <div style={{ display: 'flex', gap: 0, whiteSpace: 'nowrap' }}>
          {availTabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 18px', fontSize: 13, fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? C.teal : C.text3, background: 'transparent',
              border: 'none', borderBottom: `2.5px solid ${activeTab === t.id ? C.gold : 'transparent'}`,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ── TAB: Profile & Media ───────────────────────────────────────────── */}
      {activeTab === 'profile' && (
        <div>
          <SectionHead>Cover Photo</SectionHead>
          <UploadSlot label="Upload cover photo (1440×400 recommended)" aspect="wide" />

          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, alignItems: 'flex-start', marginTop: 20 }}>
            <div>
              <SectionHead>Logo</SectionHead>
              <UploadSlot label="Upload logo (min 400×400)" />
              <div style={{ fontSize: 10, color: C.text3, marginTop: 4, textAlign: 'center' }}>Square, shown circular</div>
            </div>
            <div>
              <SectionHead>Business Name &amp; Tagline</SectionHead>
              <Field label="Business name">
                <input style={INP} defaultValue="Sharma Kirana Store" />
              </Field>
              <Field label="Tagline" sub="(shown under name on public profile)">
                <input style={INP} defaultValue="Your trusted neighbourhood store since 2002" />
              </Field>
            </div>
          </div>

          <SectionHead>Category &amp; Location</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Category">
              <select style={SEL} value={catIdx ?? ''} onChange={e => { setCatIdx(e.target.value === '' ? null : Number(e.target.value)); setSubcat(''); }}>
                <option value="">Select category</option>
                {CATEGORIES.map((c, i) => <option key={i} value={i}>{c.label}</option>)}
                <option value="-1">Other / Enter manually</option>
              </select>
            </Field>
            <Field label="Sub-category">
              {catIdx !== null && catIdx >= 0 && activeCat ? (
                <select style={SEL} value={subcat} onChange={e => setSubcat(e.target.value)}>
                  <option value="">Select sub-category</option>
                  {activeCat.subcats.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="__other__">Other / Enter manually</option>
                </select>
              ) : catIdx === -1 ? (
                <input style={INP} placeholder="Enter your category manually" value={otherCat} onChange={e => setOtherCat(e.target.value)} />
              ) : (
                <div style={{ ...INP, color: C.text3, fontStyle: 'italic' }}>Select a category first</div>
              )}
            </Field>
          </div>
          {subcat === '__other__' && (
            <Field label="Custom sub-category">
              <input style={INP} placeholder="e.g. Pet Supplies, Book Store" value={otherCat} onChange={e => setOtherCat(e.target.value)} />
            </Field>
          )}

          <SectionHead>Location — Kurukshetra District Only</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Area / Region">
              <select style={SEL} value={area} onChange={e => setArea(e.target.value)}>
                <option value="">Select area</option>
                {KKR_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="PIN Code" hint="Must be a valid Kurukshetra district PIN">
              <input
                style={{ ...INP, borderColor: pinError ? C.error : C.border }}
                value={pin} maxLength={6}
                onChange={e => { setPin(e.target.value.replace(/\D/g,'')); setPinError('') }}
                placeholder="136118"
              />
              {pinError && <div style={{ fontSize: 11, color: C.error, marginTop: 4 }}>{pinError}</div>}
            </Field>
          </div>
          <Field label="Full Address / Street" hint="House/shop number, street name, landmark">
            <input style={INP} value={address} onChange={e => setAddress(e.target.value)} placeholder="Opp. Bus Stand, Near Old Court" />
          </Field>

          <SectionHead>About Your Business</SectionHead>
          <Field label="Full description" hint="Tell customers what makes you different — experience, specialities, service area">
            <textarea style={TA} value={bio} onChange={e => setBio(e.target.value)} />
          </Field>

          <SectionHead>Contact Details</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Phone (visible on public profile)">
              <input style={INP} value={phone} onChange={e => setPhone(e.target.value)} />
            </Field>
            <Field label="WhatsApp number">
              <input style={INP} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </Field>
            <Field label="GSTIN" sub="(optional — adds GST Verified badge)">
              <input style={INP} value={gstin} onChange={e => setGstin(e.target.value)} />
            </Field>
          </div>

          <SectionHead>Expertise &amp; Credentials</SectionHead>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Field label="Years in business">
              <input style={INP} type="number" defaultValue="22" />
            </Field>
            <Field label="Languages spoken">
              <input style={INP} defaultValue="Hindi, English, Haryanvi" />
            </Field>
          </div>
          <Field label="Certifications / Licences" hint="e.g. FSSAI licence, trade association membership">
            <input style={INP} defaultValue="FSSAI: 13421076000043" />
          </Field>

          <SectionHead>Portfolio Photos &amp; Video</SectionHead>
          <div style={{ fontSize: 12, color: C.text2, marginBottom: 10 }}>
            Add up to 5 photos and 1 short video of your shop, work, or products. These appear on your public profile.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {['Photo 1','Photo 2','Photo 3','Photo 4','Photo 5','Video (max 60s)'].map(l => (
              <UploadSlot key={l} label={l} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>JPG/PNG up to 8 MB each · MP4/MOV up to 100 MB</div>

          <SectionHead>Rating &amp; Reviews</SectionHead>
          <div style={{
            background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 10,
            padding: 14, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.teal }}>4.7</div>
              <div style={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                {[1,2,3,4,5].map(n => (
                  <svg key={n} width="12" height="12" viewBox="0 0 24 24" fill={n <= 4 ? C.gold : 'none'} stroke={C.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>38 reviews</div>
            </div>
            <div style={{ fontSize: 12, color: C.text2 }}>
              Rating is calculated automatically from verified customer reviews. It cannot be edited directly — keeping it honest for buyers.
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Services & Prices (services type only) ───────────────────── */}
      {activeTab === 'services' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 13, color: C.text2 }}>
              List services you offer with estimated price ranges.
              <span style={{ color: C.goldDim, fontWeight: 700 }}> Max 5 services.</span>
            </div>
            <div style={{
              fontSize: 11, fontWeight: 700, color: services.length >= 5 ? C.error : C.text3,
              padding: '4px 10px', borderRadius: 99, border: `1px solid ${C.border}`,
              background: C.bg,
            }}>{services.length} / 5</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services.map((svc) => (
              <div key={svc.id} style={{
                background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: 14,
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 10 }}>
                  <Field label="Service name">
                    <input style={INP} value={svc.name} onChange={e => updateService(svc.id,'name',e.target.value)} placeholder="e.g. Grocery Delivery" />
                  </Field>
                  <button onClick={() => removeService(svc.id)} style={{
                    alignSelf: 'flex-end', marginBottom: 14, padding: '8px 12px',
                    borderRadius: 8, border: '1.5px solid #fca5a5', background: '#fff5f5',
                    color: C.error, cursor: 'pointer', fontSize: 12,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <Field label="Min price (₹)">
                    <input style={INP} type="number" value={svc.priceMin} onChange={e => updateService(svc.id,'priceMin',e.target.value)} placeholder="50" />
                  </Field>
                  <Field label="Max price (₹)">
                    <input style={INP} type="number" value={svc.priceMax} onChange={e => updateService(svc.id,'priceMax',e.target.value)} placeholder="500" />
                  </Field>
                  <Field label="Unit">
                    <select style={SEL} value={svc.unit} onChange={e => updateService(svc.id,'unit',e.target.value)}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </Field>
                </div>
                <Field label="Short description">
                  <input style={INP} value={svc.desc} onChange={e => updateService(svc.id,'desc',e.target.value)} placeholder="What's included, area covered, etc." />
                </Field>
              </div>
            ))}
          </div>

          {services.length < 5 && (
            <button onClick={addService} style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: 10,
              padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
              border: `1.5px dashed ${C.border}`, background: C.bg,
              color: C.teal, fontSize: 13, fontWeight: 600,
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add service ({services.length}/5 used)
            </button>
          )}

          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: C.goldBg, border: `1px solid ${C.goldB}`, fontSize: 12, color: C.goldDim }}>
            Price ranges are shown publicly as estimates only. Actual price is agreed directly between you and the customer. My KKR charges no commission.
          </div>
        </div>
      )}

      {/* ── TAB: Products & Stock (goods type only) ───────────────────────── */}
      {activeTab === 'listings' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 13, color: C.text2 }}>
              Products available in your shop.
              <span style={{ color: C.goldDim, fontWeight: 700 }}> Max 16 listings.</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: products.length >= 16 ? C.error : C.text3,
                padding: '4px 10px', borderRadius: 99, border: `1px solid ${C.border}`,
                background: C.bg,
              }}>{products.length} / 16</div>
              {products.length < 16 && (
                <button onClick={addProduct} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: C.teal, color: C.gold, fontSize: 12, fontWeight: 700,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add product
                </button>
              )}
            </div>
          </div>

          {products.map((p) => (
            <div key={p.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
              background: C.white, borderRadius: 10, marginBottom: 8,
              border: `1.5px solid ${C.border}`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                background: C.bg, border: `1px solid ${C.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.text1 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{p.price} · {p.stock}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99,
                  background: p.active ? 'rgba(18,52,59,0.08)' : C.bg,
                  color: p.active ? C.teal : C.text3,
                  border: `1px solid ${p.active ? 'rgba(18,52,59,0.20)' : C.border}`,
                }}>{p.active ? 'Live' : 'Hidden'}</span>
                <button style={{ padding: '6px 10px', borderRadius: 7, border: `1.5px solid ${C.border}`, background: C.white, color: C.teal, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Edit</button>
                <button onClick={() => removeProduct(p.id)} style={{ padding: '6px 8px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff5f5', color: C.error, cursor: 'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: Hours & Availability ──────────────────────────────────────── */}
      {activeTab === 'hours' && (
        <div>
          <div style={{ fontSize: 13, color: C.text2, marginBottom: 16 }}>
            Set your regular business hours. Customers see these on your public profile.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DAYS.map((day) => {
              const h = hours[day]
              return (
                <div key={day} style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr', gap: 12, alignItems: 'center',
                  padding: '10px 14px', background: C.white, borderRadius: 10,
                  border: `1.5px solid ${C.border}`,
                }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: C.teal }}>{day}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={h.open}
                        onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], open: e.target.checked } }))}
                        style={{ width: 16, height: 16, accentColor: C.teal }}
                      />
                      <span style={{ fontSize: 12, color: h.open ? C.teal : C.text3, fontWeight: 600 }}>Open</span>
                    </label>
                    {h.open && (
                      <>
                        <input type="time" value={h.start}
                          onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], start: e.target.value } }))}
                          style={{ ...INP, width: 110, padding: '7px 10px' }} />
                        <span style={{ color: C.text3, fontSize: 12 }}>to</span>
                        <input type="time" value={h.end}
                          onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], end: e.target.value } }))}
                          style={{ ...INP, width: 110, padding: '7px 10px' }} />
                      </>
                    )}
                    {!h.open && <span style={{ fontSize: 12, color: C.text3, fontStyle: 'italic' }}>Closed</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{
            marginTop: 16, padding: 12, borderRadius: 8,
            background: C.goldBg, border: `1px solid ${C.goldB}`, fontSize: 12, color: C.goldDim,
          }}>
            Customers see &ldquo;Open now&rdquo; or &ldquo;Closed&rdquo; badges based on these hours in IST.
          </div>
        </div>
      )}

      {/* Floating save */}
      <div style={{ marginTop: 28, display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <Link href="/business/sharma-kirana-store" style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px',
          borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
          border: `1.5px solid ${C.border}`, color: C.text2,
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View public page
        </Link>
        <button onClick={handleSave} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '10px 22px',
          borderRadius: 8, border: 'none', cursor: 'pointer',
          background: saved ? '#16a34a' : C.teal, color: saved ? '#fff' : C.gold,
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
