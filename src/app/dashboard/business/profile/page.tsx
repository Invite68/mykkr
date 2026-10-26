/**
 * Business Portal — Edit Profile
 * White background. Teal × Gold palette only.
 * Tabs filtered by business type (set at registration — read-only).
 * Categories from shared CATEGORY_GROUPS data file.
 * Kurukshetra areas + PIN validation.
 * Full e-commerce product edit form.
 * Business hours with toggle switches + availability calendar.
 */

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { CATEGORY_GROUPS } from '@/data/categories'

// ── Colour tokens ─────────────────────────────────────────────────────────────
const C = {
  teal:    '#12343b',
  tealMid: '#2d545e',
  gold:    '#e1b382',
  goldDim: '#c89666',
  goldBg:  'rgba(225,179,130,0.10)',
  goldB:   'rgba(225,179,130,0.25)',
  white:   '#ffffff',
  bg:      '#f8fafc',
  border:  '#e2e8f0',
  text1:   '#0f172a',
  text2:   '#475569',
  text3:   '#94a3b8',
  error:   '#dc2626',
  green:   '#16a34a',
  red:     '#dc2626',
}

// ── KKR data ──────────────────────────────────────────────────────────────────
const KKR_PINS = new Set([
  '136118','136119','136128','136129','136130','136131','136132','136133',
  '136034','136035','136038','136040','136041','136042','136043','136044',
  '136135','136136','136155','136156','136157',
])
const KKR_AREAS = [
  'Thanesar','Pipli','Pehowa','Shahabad','Ladwa','Ismailabad',
  'Babain','Kurukshetra (city)','Naraingarh','Jhansa','Sirsaganj',
  'Dhand','Kaithal Road Area','Ambala Road Area',
]

// ── Types ─────────────────────────────────────────────────────────────────────
type BizType = 'services' | 'goods' | 'venues'

interface ProductEntry {
  id: string
  name: string
  price: string
  discountPrice: string
  stock: string
  stockNum: string
  desc: string
  variants: string       // comma-separated e.g. "500g, 1kg, 5kg"
  photos: string[]       // object URLs from uploads
  active: boolean
  expanded: boolean
}
interface ServiceEntry {
  id: string; name: string; priceMin: string; priceMax: string; unit: string; desc: string
}

const UNITS = ['per job','per hour','per day','per month','per order','per sqft','per person','fixed']
const DAYS_FULL = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DAYS_SHORT = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Dummy initial data ────────────────────────────────────────────────────────
const INIT_PRODUCTS: ProductEntry[] = [
  { id:'p1', name:'Basmati Rice 5 kg',    price:'385',  discountPrice:'', stock:'in stock', stockNum:'48',       desc:'Premium aged Basmati, low glycaemic, aromatic.',             variants:'2 kg, 5 kg, 10 kg', photos:[], active:true,  expanded:false },
  { id:'p2', name:'Amul Full Cream Milk', price:'62',   discountPrice:'', stock:'daily',    stockNum:'',         desc:'Fresh Amul toned milk delivered daily.',                     variants:'500 ml, 1 L',        photos:[], active:true,  expanded:false },
  { id:'p3', name:'Surf Excel 1 kg',      price:'195',  discountPrice:'', stock:'in stock', stockNum:'12',       desc:'Detergent powder with stain-remover formula.',               variants:'500 g, 1 kg, 3 kg',  photos:[], active:true,  expanded:false },
  { id:'p4', name:'Seasonal Fruit Box',   price:'280',  discountPrice:'', stock:'out',      stockNum:'0',        desc:'Mixed seasonal fruits, sourced locally every morning.',      variants:'',                   photos:[], active:false, expanded:false },
]
const INIT_SERVICES: ServiceEntry[] = [
  { id:'s1', name:'Grocery Delivery',    priceMin:'50',  priceMax:'100',  unit:'per order', desc:'Fresh groceries delivered within 2 km of store.' },
  { id:'s2', name:'Monthly Kirana Pack', priceMin:'800', priceMax:'1500', unit:'per month', desc:'Customised monthly essentials box, home delivery.'  },
]

// ── Shared small components ───────────────────────────────────────────────────
const INP: React.CSSProperties = {
  width:'100%', boxSizing:'border-box',
  background:C.white, border:`1.5px solid ${C.border}`,
  borderRadius:8, padding:'9px 12px',
  fontSize:13, color:C.text1, outline:'none', fontFamily:'inherit',
}
const SEL: React.CSSProperties = { ...INP, cursor:'pointer' }
const TA: React.CSSProperties  = { ...INP, resize:'vertical', minHeight:80 }

function Field({ label, sub, hint, children }: { label:string; sub?:string; hint?:string; children:React.ReactNode }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.teal, marginBottom:5 }}>
        {label}
        {sub && <span style={{ fontWeight:400, color:C.text3, marginLeft:4 }}>{sub}</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize:11, color:C.text3, marginTop:4 }}>{hint}</div>}
    </div>
  )
}

function SectionHead({ children }: { children:React.ReactNode }) {
  return (
    <div style={{
      fontSize:11, fontWeight:800, color:C.teal, letterSpacing:0.8, textTransform:'uppercase',
      marginBottom:10, marginTop:24, paddingBottom:6, borderBottom:`1.5px solid ${C.goldB}`,
    }}>
      {children}
    </div>
  )
}

// Toggle switch component
function Toggle({ on, onChange }: { on:boolean; onChange:(v:boolean)=>void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width:42, height:24, borderRadius:12, cursor:'pointer', flexShrink:0,
        background: on ? C.teal : C.border, transition:'background 0.2s',
        position:'relative', display:'inline-block',
      }}
    >
      <div style={{
        width:18, height:18, borderRadius:'50%', background:C.white,
        position:'absolute', top:3, transition:'left 0.2s',
        left: on ? 21 : 3,
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  )
}

// Upload slot (click-to-upload UX)
function UploadSlot({
  label, aspect='square', preview, onFile,
}: {
  label:string; aspect?:'square'|'wide'; preview?:string; onFile?:(f:File)=>void
}) {
  const ref = useRef<HTMLInputElement>(null)
  const dim = aspect === 'wide'
    ? { width:'100%', height:120, borderRadius:12 }
    : { width:96, height:96, borderRadius:10 }
  return (
    <>
      <input ref={ref} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e => { if(e.target.files?.[0] && onFile) onFile(e.target.files[0]) }} />
      <div
        onClick={() => ref.current?.click()}
        style={{
          ...dim, border:`2px dashed ${preview ? 'transparent' : C.border}`,
          background: preview ? 'transparent' : C.bg,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          cursor:'pointer', overflow:'hidden', flexShrink:0, position:'relative',
        }}
      >
        {preview
          ? <img src={preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
              <div style={{ fontSize:10, color:C.text3, marginTop:5, textAlign:'center', padding:'0 8px' }}>{label}</div>
            </>
        }
        {preview && (
          <div style={{
            position:'absolute', bottom:4, right:4,
            background:'rgba(0,0,0,0.5)', color:'#fff', fontSize:10, borderRadius:4, padding:'2px 6px',
          }}>Change</div>
        )}
      </div>
    </>
  )
}

// ── Availability calendar ─────────────────────────────────────────────────────
function AvailCalendar() {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())   // 0-indexed
  // Map "YYYY-MM-DD" → 'available' | 'booked' | undefined (clear)
  const [marks, setMarks] = useState<Record<string, 'available'|'booked'>>({})
  const [mode,  setMode]  = useState<'available'|'booked'>('available')

  const firstDay = new Date(year, month, 1).getDay()  // 0=Sun
  const daysInMonth = new Date(year, month+1, 0).getDate()
  const offsetSun = firstDay  // blank cells before day 1

  function key(d:number) {
    return `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  }
  function toggle(d:number) {
    const k = key(d)
    setMarks(prev => {
      const copy = { ...prev }
      if (copy[k] === mode) { delete copy[k] } else { copy[k] = mode }
      return copy
    })
  }
  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y-1) } else { setMonth(m => m-1) }
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y+1) } else { setMonth(m => m+1) }
  }

  return (
    <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, padding:16, marginTop:20 }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <div style={{ fontWeight:800, fontSize:14, color:C.teal }}>{MONTHS[month]} {year}</div>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={prevMonth} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', color:C.teal, fontWeight:700 }}>‹</button>
          <button onClick={nextMonth} style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${C.border}`, background:C.white, cursor:'pointer', color:C.teal, fontWeight:700 }}>›</button>
        </div>
      </div>

      {/* Mode picker */}
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        <div style={{ fontSize:11, color:C.text3, alignSelf:'center', marginRight:2 }}>Tap to mark:</div>
        {(['available','booked'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding:'4px 12px', borderRadius:99, fontSize:11, fontWeight:700, cursor:'pointer', border:'none',
            background: mode === m ? (m==='available' ? '#dcfce7' : '#fee2e2') : C.bg,
            color: mode === m ? (m==='available' ? C.green : C.red) : C.text3,
          }}>
            <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:m==='available'?C.green:C.red, marginRight:5, verticalAlign:'middle' }} />
            {m === 'available' ? 'Available' : 'Booked / Closed'}
          </button>
        ))}
        <button onClick={() => setMarks({})} style={{
          marginLeft:'auto', padding:'4px 10px', borderRadius:6, fontSize:11, cursor:'pointer',
          border:`1px solid ${C.border}`, background:C.white, color:C.text3,
        }}>Clear all</button>
      </div>

      {/* Day-of-week labels */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:3 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:10, fontWeight:700, color:C.text3, padding:'2px 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
        {/* blank offset cells */}
        {Array.from({ length: offsetSun }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const d = i+1
          const k = key(d)
          const mark = marks[k]
          const isPast = new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate())
          const isToday = year===today.getFullYear() && month===today.getMonth() && d===today.getDate()
          return (
            <button
              key={d}
              onClick={() => !isPast && toggle(d)}
              style={{
                aspectRatio:'1', borderRadius:8, fontSize:12, fontWeight:600, cursor: isPast ? 'default':'pointer',
                border: isToday ? `2px solid ${C.teal}` : `1.5px solid ${C.border}`,
                background: mark==='available' ? '#dcfce7'
                          : mark==='booked'    ? '#fee2e2'
                          : isPast             ? C.bg
                          : C.white,
                color: mark==='available' ? C.green
                     : mark==='booked'    ? C.red
                     : isPast             ? C.text3
                     : C.text1,
                opacity: isPast ? 0.5 : 1,
              }}
            >{d}</button>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:14, marginTop:10, fontSize:11, color:C.text3 }}>
        <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:'#dcfce7', border:'1px solid #86efac', marginRight:4, verticalAlign:'middle' }} />Available</span>
        <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:'#fee2e2', border:'1px solid #fca5a5', marginRight:4, verticalAlign:'middle' }} />Booked / Closed</span>
        <span><span style={{ display:'inline-block', width:10, height:10, borderRadius:3, background:C.bg, border:`1px solid ${C.border}`, marginRight:4, verticalAlign:'middle' }} />Unmarked</span>
      </div>
      <div style={{ marginTop:8, fontSize:11, color:C.text3 }}>
        Customers will see a green/red indicator on your profile for the dates they browse.
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function EditProfilePage() {
  // In production this comes from auth/user record. Dropdown lets demo users switch type.
  const [bizType, setBizType] = useState<BizType>('goods')

  const [saved,    setSaved]    = useState(false)
  const [products, setProducts] = useState<ProductEntry[]>(INIT_PRODUCTS)
  const [services, setServices] = useState<ServiceEntry[]>(INIT_SERVICES)

  // Profile fields
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [logoPreview,  setLogoPreview]  = useState<string>('')
  const [bio,          setBio]          = useState('Trusted neighbourhood kirana store serving Thanesar for 22 years.')
  const [phone,        setPhone]        = useState('+91 98765 43210')
  const [whatsapp,     setWhatsapp]     = useState('+91 98765 43210')
  const [gstin,        setGstin]        = useState('06AAAPL0267H1Z3')
  const [catGroup,     setCatGroup]     = useState('')   // CATEGORY_GROUPS slug
  const [subcat,       setSubcat]       = useState('')
  const [otherSubcat,  setOtherSubcat]  = useState('')
  const [area,         setArea]         = useState('Thanesar')
  const [pin,          setPin]          = useState('136118')
  const [address,      setAddress]      = useState('Opp. Bus Stand, Thanesar')
  const [pinError,     setPinError]     = useState('')

  // Hours
  const [hours, setHours] = useState<Record<string, { open:boolean; start:string; end:string }>>({
    Monday:    { open:true,  start:'09:00', end:'18:00' },
    Tuesday:   { open:true,  start:'09:00', end:'18:00' },
    Wednesday: { open:true,  start:'09:00', end:'18:00' },
    Thursday:  { open:true,  start:'09:00', end:'18:00' },
    Friday:    { open:true,  start:'09:00', end:'17:00' },
    Saturday:  { open:true,  start:'10:00', end:'14:00' },
    Sunday:    { open:false, start:'',      end:''      },
  })

  // Tabs
  type Tab = 'profile' | 'services' | 'listings' | 'hours'
  const tabs: { id:Tab; label:string }[] = [
    { id:'profile',  label:'Profile & Media' },
    ...(bizType === 'services' || bizType === 'venues' ? [{ id:'services' as Tab, label:'Services & Prices' }] : []),
    ...(bizType === 'goods'    ? [{ id:'listings' as Tab, label:'Products & Stock'  }] : []),
    { id:'hours', label:'Hours & Availability' },
  ]
  const [tab, setTab] = useState<Tab>('profile')
  const activeTab = tabs.find(t => t.id === tab) ? tab : 'profile'

  function handleSave() {
    if (pin && !KKR_PINS.has(pin)) {
      setPinError('Not a valid Kurukshetra district PIN.')
      return
    }
    setPinError('')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  // Product helpers
  function updateProduct(id:string, patch:Partial<ProductEntry>) {
    setProducts(p => p.map(pr => pr.id === id ? { ...pr, ...patch } : pr))
  }
  function addProduct() {
    if (products.length >= 16) { alert('Maximum 16 products allowed.'); return }
    const newP: ProductEntry = { id:`p${Date.now()}`, name:'', price:'', discountPrice:'', stock:'in stock', stockNum:'', desc:'', variants:'', photos:[], active:true, expanded:true }
    setProducts(p => [...p, newP])
  }
  function removeProduct(id:string) { setProducts(p => p.filter(pr => pr.id !== id)) }
  function addProductPhoto(id:string, file:File) {
    const url = URL.createObjectURL(file)
    updateProduct(id, { photos: [...(products.find(p=>p.id===id)?.photos||[]), url].slice(0,5) })
  }

  // Service helpers
  function updateService(id:string, field:keyof ServiceEntry, val:string) {
    setServices(p => p.map(s => s.id === id ? { ...s, [field]:val } : s))
  }
  function addService() {
    if (services.length >= 5) { alert('Maximum 5 services allowed.'); return }
    setServices(p => [...p, { id:`s${Date.now()}`, name:'', priceMin:'', priceMax:'', unit:'per job', desc:'' }])
  }
  function removeService(id:string) { setServices(p => p.filter(s => s.id !== id)) }

  // Category data from shared file
  const selectedGroup = CATEGORY_GROUPS.find(g => g.slug === catGroup)

  // Biz type label
  const BIZ_LABEL: Record<BizType, string> = {
    services: 'Services business',
    goods:    'Goods / shop',
    venues:   'Venues & hospitality',
  }

  return (
    <>
      {/* ── Global CSS for toggle animation + hide scrollbar ───────────────── */}
      <style>{`
        .tab-scroll::-webkit-scrollbar { display: none; }
        .tab-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        input[type="time"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {/* Page header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:11, color:C.text3, fontWeight:600, marginBottom:3, textTransform:'uppercase', letterSpacing:0.5 }}>Business Portal</div>
          <h1 style={{ fontWeight:900, fontSize:22, color:C.teal, margin:0 }}>Edit Profile</h1>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Link href="/business/sharma-kirana-store" style={{
            display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
            borderRadius:8, textDecoration:'none', fontSize:13, fontWeight:600,
            border:`1.5px solid ${C.border}`, color:C.text2,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            View public page
          </Link>
          <button onClick={handleSave} style={{
            display:'flex', alignItems:'center', gap:6, padding:'8px 18px',
            borderRadius:8, border:'none', cursor:'pointer',
            background: saved ? C.green : C.teal, color: saved ? '#fff' : C.gold,
            fontSize:13, fontWeight:700,
          }}>
            {saved
              ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
              : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Make Live</>
            }
          </button>
        </div>
      </div>

      {/* Business type selector — changing this updates all tabs & forms below */}
      <div style={{ marginBottom:20 }}>
        <label style={{ display:'block', fontSize:12, fontWeight:700, color:C.teal, marginBottom:6, textTransform:'uppercase', letterSpacing:0.5 }}>
          Business Type
          <span style={{ fontWeight:400, color:C.text3, textTransform:'none', letterSpacing:0, marginLeft:6 }}>— select to update your profile form</span>
        </label>
        <div style={{ position:'relative', maxWidth:340 }}>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
            style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
          </svg>
          <select
            value={bizType}
            onChange={e => { setBizType(e.target.value as BizType); setTab('profile') }}
            style={{
              ...SEL,
              paddingLeft: 36,
              fontWeight: 700,
              color: C.teal,
              border: `2px solid ${C.goldB}`,
              background: C.goldBg,
            }}
          >
            <option value="goods">Goods / Shop — sell products online</option>
            <option value="services">Services business — bookings &amp; gigs</option>
            <option value="venues">Venues &amp; Hospitality — bookings &amp; events</option>
          </select>
        </div>
        <div style={{ fontSize:11, color:C.text3, marginTop:5 }}>
          Changing business type updates the tabs and fields shown below.
        </div>
      </div>

      {/* Scrollable tabs */}
      <div className="tab-scroll" style={{ overflowX:'auto', marginBottom:20, borderBottom:`1.5px solid ${C.border}` }}>
        <div style={{ display:'flex', whiteSpace:'nowrap' }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'10px 18px', fontSize:13,
              fontWeight: activeTab === t.id ? 700 : 500,
              color: activeTab === t.id ? C.teal : C.text3,
              background:'transparent', border:'none',
              borderBottom:`2.5px solid ${activeTab === t.id ? C.gold : 'transparent'}`,
              cursor:'pointer', whiteSpace:'nowrap', flexShrink:0,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: Profile & Media
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div>
          {/* Cover photo */}
          <SectionHead>Cover Photo</SectionHead>
          <div style={{ position:'relative', borderRadius:12, overflow:'hidden', marginBottom:-32 }}>
            {coverPreview
              ? <img src={coverPreview} alt="Cover" style={{ width:'100%', height:130, objectFit:'cover', display:'block' }} />
              : <div style={{ width:'100%', height:130, background:`linear-gradient(135deg, ${C.teal} 0%, ${C.tealMid} 100%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'rgba(225,179,130,0.3)', fontSize:11, letterSpacing:1 }}>COVER PHOTO</span>
                </div>
            }
            <button
              onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=(e:Event) => { const f=(e.target as HTMLInputElement).files?.[0]; if(f) setCoverPreview(URL.createObjectURL(f)) }; i.click() }}
              style={{
                position:'absolute', bottom:10, right:10,
                background:'rgba(0,0,0,0.55)', color:'#fff', border:'none', cursor:'pointer',
                borderRadius:6, padding:'5px 12px', fontSize:12, fontWeight:600,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ marginRight:5, verticalAlign:'middle' }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
              Upload cover
            </button>
          </div>

          {/* Logo + Name row */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:16, marginBottom:20 }}>
            {/* Circular logo */}
            <div style={{ position:'relative', zIndex:2 }}>
              <div style={{
                width:72, height:72, borderRadius:'50%', border:`3px solid ${C.white}`,
                overflow:'hidden', background:C.teal, flexShrink:0, marginLeft:16,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {logoPreview
                  ? <img src={logoPreview} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <span style={{ fontSize:22, fontWeight:900, color:C.gold }}>SK</span>
                }
              </div>
              <button
                onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='image/*'; i.onchange=(e:Event) => { const f=(e.target as HTMLInputElement).files?.[0]; if(f) setLogoPreview(URL.createObjectURL(f)) }; i.click() }}
                style={{
                  position:'absolute', bottom:-4, right:-4, width:22, height:22, borderRadius:'50%',
                  background:C.teal, border:`2px solid ${C.white}`, cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/></svg>
              </button>
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Business name">
              <input style={INP} defaultValue="Sharma Kirana Store" />
            </Field>
            <Field label="Tagline" sub="(shown under name)">
              <input style={INP} defaultValue="Your trusted neighbourhood store since 2002" />
            </Field>
          </div>

          {/* Category */}
          <SectionHead>Category &amp; Sub-category</SectionHead>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Category">
              <select style={SEL} value={catGroup} onChange={e => { setCatGroup(e.target.value); setSubcat('') }}>
                <option value="">Select category</option>
                {CATEGORY_GROUPS.map(g => (
                  <option key={g.slug} value={g.slug}>{g.label}</option>
                ))}
                <option value="__other__">Other / Enter manually</option>
              </select>
            </Field>
            <Field label="Sub-category">
              {catGroup === '__other__'
                ? <input style={INP} placeholder="Type your category" value={otherSubcat} onChange={e => setOtherSubcat(e.target.value)} />
                : selectedGroup
                  ? <select style={SEL} value={subcat} onChange={e => setSubcat(e.target.value)}>
                      <option value="">Select sub-category</option>
                      {selectedGroup.subcategories.filter(s => !s.startsWith('All ')).map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                      <option value="__other__">Other / Enter manually</option>
                    </select>
                  : <div style={{ ...INP, color:C.text3, fontStyle:'italic', userSelect:'none' }}>Select a category first</div>
              }
            </Field>
          </div>
          {subcat === '__other__' && (
            <Field label="Custom sub-category">
              <input style={INP} placeholder="e.g. Pet Supplies" value={otherSubcat} onChange={e => setOtherSubcat(e.target.value)} />
            </Field>
          )}

          {/* Location */}
          <SectionHead>Location — Kurukshetra District</SectionHead>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Area / Region">
              <select style={SEL} value={area} onChange={e => setArea(e.target.value)}>
                {KKR_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="PIN Code" hint="Valid Kurukshetra district PIN only">
              <input
                style={{ ...INP, borderColor: pinError ? C.error : C.border }}
                value={pin} maxLength={6}
                onChange={e => { setPin(e.target.value.replace(/\D/,'')); setPinError('') }}
                placeholder="136118"
              />
              {pinError && <div style={{ fontSize:11, color:C.error, marginTop:4 }}>{pinError}</div>}
            </Field>
          </div>
          <Field label="Full Address / Street" hint="Shop/house number, street, landmark">
            <input style={INP} value={address} onChange={e => setAddress(e.target.value)} />
          </Field>

          {/* About */}
          <SectionHead>About</SectionHead>
          <Field label="Business description">
            <textarea style={TA} value={bio} onChange={e => setBio(e.target.value)} />
          </Field>

          {/* Contact */}
          <SectionHead>Contact Details</SectionHead>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label="Phone">
              <input style={INP} value={phone} onChange={e => setPhone(e.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <input style={INP} value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
            </Field>
            <Field label="GSTIN" sub="(optional)">
              <input style={INP} value={gstin} onChange={e => setGstin(e.target.value)} />
            </Field>
            <Field label="Years in business">
              <input style={INP} type="number" defaultValue="22" />
            </Field>
          </div>

          {/* Portfolio photos */}
          <SectionHead>Portfolio Photos &amp; Video</SectionHead>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {['Shop front','Interior','Products','Work / Menu','Team'].map(l => (
              <UploadSlot key={l} label={l} />
            ))}
          </div>
          <div style={{ fontSize:11, color:C.text3, marginTop:6 }}>JPG/PNG up to 8 MB · MP4 up to 100 MB</div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: Products & Stock
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'listings' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <div style={{ fontSize:13, color:C.text2 }}>
              Manage your shop products.
              <span style={{ color:C.goldDim, fontWeight:700 }}> Max 16 listings.</span>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <div style={{ fontSize:11, fontWeight:700, color: products.length >= 16 ? C.error : C.text3, padding:'4px 10px', borderRadius:99, border:`1px solid ${C.border}`, background:C.bg }}>
                {products.length} / 16
              </div>
              {products.length < 16 && (
                <button onClick={addProduct} style={{
                  display:'flex', alignItems:'center', gap:6, padding:'8px 14px',
                  borderRadius:8, border:'none', cursor:'pointer',
                  background:C.teal, color:C.gold, fontSize:12, fontWeight:700,
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add product
                </button>
              )}
            </div>
          </div>

          {products.map((p) => (
            <div key={p.id} style={{ marginBottom:10, border:`1.5px solid ${C.border}`, borderRadius:12, background:C.white, overflow:'hidden' }}>
              {/* Collapsed row — fixed grid for symmetry */}
              <div style={{
                display:'grid',
                gridTemplateColumns:'56px 1fr auto auto auto auto',
                alignItems:'center', gap:10, padding:'11px 14px',
              }}>
                {/* Thumbnail — fixed 56×56 */}
                <div style={{ width:56, height:56, borderRadius:8, overflow:'hidden', flexShrink:0, background:C.bg, border:`1px solid ${C.border}` }}>
                  {p.photos[0]
                    ? <img src={p.photos[0]} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text3} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      </div>
                  }
                </div>
                {/* Name + price */}
                <div style={{ minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:C.text1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    {p.name || <span style={{ color:C.text3, fontStyle:'italic' }}>New product</span>}
                  </div>
                  <div style={{ fontSize:12, color:C.text2, marginTop:2, display:'flex', gap:6, alignItems:'center', flexWrap:'wrap' }}>
                    {p.price && <span style={{ fontWeight:700, color:C.teal }}>₹{p.price}</span>}
                    {p.discountPrice && <span style={{ textDecoration:'line-through', color:C.text3 }}>₹{p.discountPrice}</span>}
                    {p.stockNum && <span style={{ color:C.text3 }}>{p.stockNum} units</span>}
                  </div>
                </div>
                {/* Toggle + label */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <Toggle on={p.active} onChange={v => updateProduct(p.id, { active:v })} />
                  <span style={{ fontSize:11, color: p.active ? C.teal : C.text3, fontWeight:600, minWidth:30 }}>{p.active ? 'Live' : 'Off'}</span>
                </div>
                {/* Edit button */}
                <button onClick={() => updateProduct(p.id, { expanded:!p.expanded })} style={{
                  padding:'6px 14px', borderRadius:7, border:`1.5px solid ${C.border}`,
                  background: p.expanded ? C.teal : C.white,
                  color: p.expanded ? C.gold : C.text2,
                  cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
                }}>{p.expanded ? 'Close' : 'Edit'}</button>
                {/* Delete button */}
                <button onClick={() => removeProduct(p.id)} style={{ padding:'6px 10px', borderRadius:7, border:'1px solid #fca5a5', background:'#fff5f5', color:C.error, cursor:'pointer', flexShrink:0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>

              {/* Expanded edit form */}
              {p.expanded && (
                <div style={{ padding:'0 14px 16px', borderTop:`1px solid ${C.border}` }}>
                  <div style={{ paddingTop:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <Field label="Product name">
                      <input style={INP} value={p.name} onChange={e => updateProduct(p.id, { name:e.target.value })} placeholder="e.g. Basmati Rice 5 kg" />
                    </Field>
                    <Field label="Stock count" sub="(leave blank if unlimited)">
                      <input style={INP} type="number" value={p.stockNum} onChange={e => updateProduct(p.id, { stockNum:e.target.value })} placeholder="48" />
                    </Field>
                    <Field label="Selling price (₹)">
                      <input style={INP} type="number" value={p.price} onChange={e => updateProduct(p.id, { price:e.target.value })} placeholder="385" />
                    </Field>
                    <Field label="MRP / Original price (₹)" sub="(for discount display)">
                      <input style={INP} type="number" value={p.discountPrice} onChange={e => updateProduct(p.id, { discountPrice:e.target.value })} placeholder="420" />
                    </Field>
                  </div>
                  <Field label="Variants / Sizes" hint="Comma-separated. e.g. 500g, 1kg, 5kg — or leave blank">
                    <input style={INP} value={p.variants} onChange={e => updateProduct(p.id, { variants:e.target.value })} placeholder="500 g, 1 kg, 5 kg" />
                  </Field>
                  <Field label="Description">
                    <textarea style={TA} value={p.desc} onChange={e => updateProduct(p.id, { desc:e.target.value })} placeholder="What makes this product great — quality, origin, usage tips..." />
                  </Field>
                  {/* Product photos */}
                  <div style={{ fontSize:12, fontWeight:700, color:C.teal, marginBottom:8 }}>Product photos (max 5)</div>
                  <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                    {p.photos.map((src, i) => (
                      <div key={i} style={{ position:'relative' }}>
                        <img src={src} alt="" style={{ width:80, height:80, objectFit:'cover', borderRadius:8, border:`1px solid ${C.border}` }} />
                        <button
                          onClick={() => updateProduct(p.id, { photos: p.photos.filter((_,j)=>j!==i) })}
                          style={{ position:'absolute', top:-6, right:-6, width:18, height:18, borderRadius:'50%', background:C.error, border:'none', color:'#fff', cursor:'pointer', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}
                        >×</button>
                      </div>
                    ))}
                    {p.photos.length < 5 && (
                      <UploadSlot label="Add photo" onFile={f => addProductPhoto(p.id, f)} />
                    )}
                  </div>
                  {p.photos.length === 0 && (
                    <div style={{ fontSize:11, color:C.text3, marginTop:6 }}>No photos yet. Listings with photos get 3× more views.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: Services & Prices
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'services' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:13, color:C.text2 }}>Services you offer. <span style={{ color:C.goldDim, fontWeight:700 }}>Max 5.</span></div>
            <div style={{ fontSize:11, fontWeight:700, color: services.length >= 5 ? C.error : C.text3, padding:'4px 10px', borderRadius:99, border:`1px solid ${C.border}`, background:C.bg }}>{services.length} / 5</div>
          </div>
          {services.map(svc => (
            <div key={svc.id} style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:10, padding:14, marginBottom:10 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, marginBottom:10 }}>
                <Field label="Service name">
                  <input style={INP} value={svc.name} onChange={e => updateService(svc.id,'name',e.target.value)} placeholder="e.g. Home Cleaning" />
                </Field>
                <button onClick={() => removeService(svc.id)} style={{ alignSelf:'flex-end', marginBottom:14, padding:'8px 10px', borderRadius:8, border:'1.5px solid #fca5a5', background:'#fff5f5', color:C.error, cursor:'pointer' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
                <Field label="Min price (₹)"><input style={INP} type="number" value={svc.priceMin} onChange={e => updateService(svc.id,'priceMin',e.target.value)} /></Field>
                <Field label="Max price (₹)"><input style={INP} type="number" value={svc.priceMax} onChange={e => updateService(svc.id,'priceMax',e.target.value)} /></Field>
                <Field label="Unit"><select style={SEL} value={svc.unit} onChange={e => updateService(svc.id,'unit',e.target.value)}>{UNITS.map(u=><option key={u} value={u}>{u}</option>)}</select></Field>
              </div>
              <Field label="Description"><input style={INP} value={svc.desc} onChange={e => updateService(svc.id,'desc',e.target.value)} /></Field>
            </div>
          ))}
          {services.length < 5 && (
            <button onClick={addService} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:8, cursor:'pointer', border:`1.5px dashed ${C.border}`, background:C.bg, color:C.teal, fontSize:13, fontWeight:600 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add service ({services.length}/5 used)
            </button>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: Hours & Availability
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'hours' && (
        <div>
          <SectionHead>Business Hours</SectionHead>
          <div style={{ background:C.white, border:`1.5px solid ${C.border}`, borderRadius:12, overflow:'hidden' }}>
            {DAYS_FULL.map((day, i) => {
              const h = hours[day]
              return (
                <div key={day} style={{
                  display:'flex', alignItems:'center', gap:12,
                  padding:'13px 16px', flexWrap:'wrap',
                  borderBottom: i < 6 ? `1px solid ${C.border}` : 'none',
                  background: h.open ? C.white : C.bg,
                }}>
                  {/* Day name */}
                  <div style={{ width:84, fontSize:13, fontWeight:700, color: h.open ? C.teal : C.text3, flexShrink:0 }}>
                    {DAYS_SHORT[i]}
                    <span style={{ display:'block', fontSize:10, fontWeight:400, color:C.text3 }}>{day}</span>
                  </div>
                  {/* Toggle */}
                  <Toggle on={h.open} onChange={v => setHours(p => ({ ...p, [day]: { ...p[day], open:v } }))} />
                  {/* Open/closed label */}
                  <span style={{ fontSize:12, fontWeight:600, color: h.open ? C.teal : C.text3, width:44, flexShrink:0 }}>
                    {h.open ? 'Open' : 'Closed'}
                  </span>
                  {/* Time pickers */}
                  {h.open && (
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <input type="time" value={h.start}
                        onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], start:e.target.value } }))}
                        style={{ ...INP, width:108, padding:'7px 10px' }} />
                      <span style={{ color:C.text3, fontSize:12 }}>to</span>
                      <input type="time" value={h.end}
                        onChange={e => setHours(p => ({ ...p, [day]: { ...p[day], end:e.target.value } }))}
                        style={{ ...INP, width:108, padding:'7px 10px' }} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Availability calendar — for venues and services */}
          {(bizType === 'venues' || bizType === 'services') && (
            <>
              <SectionHead>Availability Calendar</SectionHead>
              <div style={{ fontSize:12, color:C.text2, marginBottom:8 }}>
                Mark dates as available (green) or fully booked / closed (red). Customers see this on your profile when checking availability.
              </div>
              <AvailCalendar />
            </>
          )}

          {/* For goods type — show calendar as optional */}
          {bizType === 'goods' && (
            <>
              <SectionHead>Special Closures (optional)</SectionHead>
              <div style={{ fontSize:12, color:C.text2, marginBottom:8 }}>
                Mark days you will be closed for holidays, stock-taking or other reasons. Customers will see these as closed on your profile.
              </div>
              <AvailCalendar />
            </>
          )}

          <div style={{ marginTop:14, padding:12, borderRadius:8, background:C.goldBg, border:`1px solid ${C.goldB}`, fontSize:12, color:C.goldDim }}>
            &ldquo;Open now&rdquo; / &ldquo;Closed&rdquo; badges are shown in real time on your public profile (IST).
          </div>
        </div>
      )}

      {/* Bottom save */}
      <div style={{ marginTop:28, display:'flex', gap:10, justifyContent:'flex-end', flexWrap:'wrap' }}>
        <Link href="/business/sharma-kirana-store" style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 18px', borderRadius:8, textDecoration:'none', fontSize:13, fontWeight:600, border:`1.5px solid ${C.border}`, color:C.text2 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          View public page
        </Link>
        <button onClick={handleSave} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 22px', borderRadius:8, border:'none', cursor:'pointer', background: saved ? C.green : C.teal, color: saved ? '#fff' : C.gold, fontSize:13, fontWeight:700 }}>
          {saved
            ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>Saved!</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Make Live</>
          }
        </button>
      </div>
    </>
  )
}
