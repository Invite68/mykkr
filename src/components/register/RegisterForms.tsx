'use client'

import Link from 'next/link'
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import OtpField from './OtpField'
import { CATEGORY_GROUPS } from '@/data/categories'
import { DELIVERY_VEHICLES } from '@/data/vehicles'
import { ROLES, type UserRole } from '@/config/roles'
import { PLANS, formatInr } from '@/config/platform'
import { DELIVERY_LABELS, type DeliveryOption } from '@/types'
import { isValidPin } from '@/lib/sanitize'

type SignupRole = Exclude<UserRole, 'admin'>
const SIGNUP_ROLES = ROLES.filter((r) => r.selfSignup)

const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

function Errors({ list }: { list: string[] }) {
  if (!list.length) return null
  return (
    <div className="banner banner-err" role="alert">
      <span aria-hidden="true">⚠️</span>
      <ul style={{ paddingLeft: 16 }}>{list.map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  )
}

function Terms({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        I agree to the <Link href="/terms" target="_blank">Terms of Service</Link> and{' '}
        <Link href="/privacy" target="_blank">Privacy Policy</Link>. {children}
      </span>
    </label>
  )
}

function Success({ role }: { role: SignupRole }) {
  const copy: Record<SignupRole, string> = {
    business: "Your business profile has been submitted for review. You'll get an SMS once it's verified and live.",
    customer: `Your ${PLANS.customer.trialDays}-day free trial is ready to start. Browse and contact any business.`,
    driver: "Your driver application has been submitted. We'll verify your licence and ID, then start sending you jobs.",
  }
  return (
    <div className="panel" style={{ textAlign: 'center' }} role="status">
      <div style={{ fontSize: 40 }} aria-hidden="true">🎉</div>
      <h2 className="page-title" style={{ fontSize: 20 }}>Registration received</h2>
      <p className="muted" style={{ margin: '6px 0 16px' }}>{copy[role]}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={`/dashboard/${role}`} className="btn btn-primary">Open my dashboard →</Link>
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
    </div>
  )
}

/* ── Business ─────────────────────────────────────────── */

const OTHER_SLUG = '__other__'

/**
 * Two-tier category picker for business registration.
 *
 * Step 1 — L1 grid: choose a main category (or "Other")
 * Step 2 — L2 chips: choose a subcategory within that group
 *   If "Other" was picked in step 1, a free-text input appears instead.
 *
 * The parent receives { catSlug, subSlug, otherLabel } via onSelect.
 */
function CategoryPicker({
  catSlug,
  subSlug,
  otherLabel,
  onSelect,
}: {
  catSlug: string | null
  subSlug: string | null
  otherLabel: string
  onSelect: (catSlug: string | null, subSlug: string | null, otherLabel: string) => void
}) {
  const activeGroup = CATEGORY_GROUPS.find((g) => g.slug === catSlug) ?? null
  const isOther = catSlug === OTHER_SLUG

  function pickL1(slug: string | null) {
    onSelect(slug, null, '')
  }

  function pickL2(sub: string | null) {
    onSelect(catSlug, sub, otherLabel)
  }

  return (
    <div className="reg-cat-picker">
      {/* ── Step 1: L1 category grid ── */}
      <div className="reg-cat-l1" role="radiogroup" aria-label="Main category">
        {CATEGORY_GROUPS.map((g) => (
          <button
            type="button"
            key={g.slug}
            role="radio"
            aria-checked={catSlug === g.slug}
            className={`reg-cat-l1-tile${catSlug === g.slug ? ' active' : ''}`}
            onClick={() => pickL1(g.slug)}
          >
            <span className="reg-cat-icon" aria-hidden="true">{g.icon}</span>
            <span className="reg-cat-name">{g.label}</span>
          </button>
        ))}
        {/* Other tile */}
        <button
          type="button"
          role="radio"
          aria-checked={isOther}
          className={`reg-cat-l1-tile${isOther ? ' active' : ''}`}
          onClick={() => pickL1(OTHER_SLUG)}
        >
          <span className="reg-cat-icon" aria-hidden="true">➕</span>
          <span className="reg-cat-name">Other</span>
        </button>
      </div>

      {/* ── Step 2a: L2 subcategory chips (when a real group is selected) ── */}
      {activeGroup && (
        <div className="reg-cat-l2" role="group" aria-label={`${activeGroup.label} subcategories`}>
          <div className="muted" style={{ marginBottom: 6, fontSize: 13 }}>
            Pick the closest subcategory in <strong>{activeGroup.label}</strong>:
          </div>
          <div className="chips" style={{ flexWrap: 'wrap', gap: 8 }}>
            {activeGroup.subcategories.slice(1).map((s) => (
              <button
                type="button"
                key={s}
                className={`chip${subSlug === s ? ' active' : ''}`}
                aria-pressed={subSlug === s}
                onClick={() => pickL2(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2b: Free-text entry when "Other" is selected ── */}
      {isOther && (
        <div className="reg-cat-l2">
          <label className="label" htmlFor="b-other-cat">
            Describe your category <span className="muted">(e.g. "Book Store", "Yoga Studio")</span>
          </label>
          <input
            id="b-other-cat"
            className="input"
            maxLength={80}
            placeholder="Type your business category"
            value={otherLabel}
            onChange={(e) => onSelect(OTHER_SLUG, null, e.target.value)}
            autoFocus
          />
        </div>
      )}
    </div>
  )
}

function BusinessForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: '', owner: '', email: '', phone: '', otp: '', area: '', pin: '', street: '', gstin: '', hours: '9:00 AM – 8:00 PM' })
  // Category selection: catSlug (L1), subSlug (L2), otherLabel (free text when catSlug === OTHER_SLUG)
  const [catSlug, setCatSlug] = useState<string | null>(null)
  const [subSlug, setSubSlug] = useState<string | null>(null)
  const [otherLabel, setOtherLabel] = useState('')
  const [delivery, setDelivery] = useState<DeliveryOption[]>(['pickup'])
  const [photos, setPhotos] = useState<File[]>([])
  const [photoErr, setPhotoErr] = useState('')
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const up = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))

  function handleCategorySelect(cs: string | null, ss: string | null, ol: string) {
    setCatSlug(cs)
    setSubSlug(ss)
    setOtherLabel(ol)
  }

  function toggleDelivery(d: DeliveryOption) {
    setDelivery((c) => (c.includes(d) ? c.filter((x) => x !== d) : [...c, d]))
  }
  function onPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotoErr('')
    if (files.length > MAX_PHOTOS) return setPhotoErr(`Maximum ${MAX_PHOTOS} photos.`), setPhotos([])
    const bad = files.find((x) => !PHOTO_TYPES.includes(x.type) || x.size > MAX_PHOTO_BYTES)
    if (bad) return setPhotoErr(`${bad.name}: JPG, PNG or WebP only, max 5 MB.`), setPhotos([])
    setPhotos(files)
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (f.name.trim().length < 2) errs.push('Enter your business name.')
    if (!catSlug) errs.push('Pick a category for your business.')
    if (catSlug === OTHER_SLUG && otherLabel.trim().length < 2) errs.push('Enter your custom category name.')
    if (catSlug && catSlug !== OTHER_SLUG && !subSlug) errs.push('Pick a subcategory.')
    if (!EMAIL_RE.test(f.email)) errs.push('Enter a valid email.')
    if (f.otp.length !== 6) errs.push('Verify your WhatsApp number with the 6-digit OTP.')
    if (!f.area) errs.push('Choose your area.')
    if (!isValidPin(f.pin)) errs.push('Enter a valid 6-digit pin code.')
    if (f.gstin && !GSTIN_RE.test(f.gstin.toUpperCase())) errs.push('GSTIN format looks wrong (15 characters).')
    if (f.owner.trim().length < 2) errs.push("Enter the owner's name.")
    if (!terms) errs.push('Accept the terms to continue.')
    if (photoErr) errs.push(photoErr)
    setErrors(errs)
    if (!errs.length) onDone() // TODO(backend): POST /api/businesses with photos → Firebase Storage
  }

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <div className="field">
        <label className="label" htmlFor="b-name">Business name</label>
        <input id="b-name" className="input" maxLength={100} value={f.name} onChange={(e) => up('name')(e.target.value)} placeholder="e.g. Sharma Electricals" />
      </div>

      <fieldset className="field" style={{ border: 'none', padding: 0 }}>
        <legend className="label" style={{ marginBottom: 8 }}>Business category</legend>
        <CategoryPicker
          catSlug={catSlug}
          subSlug={subSlug}
          otherLabel={otherLabel}
          onSelect={handleCategorySelect}
        />
      </fieldset>

      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="b-email">Business email</label>
          <input id="b-email" className="input" type="email" maxLength={100} value={f.email} onChange={(e) => up('email')(e.target.value)} autoComplete="email" />
        </div>
        <div className="field">
          <label className="label" htmlFor="b-gstin">GSTIN (optional)</label>
          <input id="b-gstin" className="input" maxLength={15} value={f.gstin} onChange={(e) => up('gstin')(e.target.value.toUpperCase())} placeholder="06ABCDE1234F1Z5" />
        </div>
      </div>

      <OtpField id="b-phone" label="WhatsApp number" phone={f.phone} onPhone={up('phone')} otp={f.otp} onOtp={up('otp')} />

      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="b-area">Area / tehsil</label>
          <AreaSelect id="b-area" value={f.area} onChange={up('area')} placeholder="Select" />
        </div>
        <div className="field">
          <label className="label" htmlFor="b-pin">Pin code</label>
          <input id="b-pin" className="input" inputMode="numeric" maxLength={6} value={f.pin} onChange={(e) => up('pin')(e.target.value.replace(/\D/g, ''))} placeholder="136118" />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="b-street">Street / landmark</label>
        <input id="b-street" className="input" maxLength={200} value={f.street} onChange={(e) => up('street')(e.target.value)} placeholder="e.g. Near Bus Stand" />
      </div>

      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="b-owner">Owner name</label>
          <input id="b-owner" className="input" maxLength={80} value={f.owner} onChange={(e) => up('owner')(e.target.value)} autoComplete="name" />
        </div>
        <div className="field">
          <label className="label" htmlFor="b-hours">Operating hours</label>
          <input id="b-hours" className="input" maxLength={60} value={f.hours} onChange={(e) => up('hours')(e.target.value)} />
        </div>
      </div>

      <fieldset className="field" style={{ border: 'none' }}>
        <legend className="label" style={{ marginBottom: 6 }}>Delivery options you offer</legend>
        <div className="chips" style={{ flexWrap: 'wrap' }}>
          {(Object.keys(DELIVERY_LABELS) as DeliveryOption[]).map((d) => (
            <button type="button" key={d} className={`chip${delivery.includes(d) ? ' active' : ''}`} aria-pressed={delivery.includes(d)} onClick={() => toggleDelivery(d)}>
              {DELIVERY_LABELS[d]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="field">
        <label className="label" htmlFor="b-photos">Business photos (optional)</label>
        <input id="b-photos" className="input" type="file" accept={PHOTO_TYPES.join(',')} multiple onChange={onPhotos} />
        <span className="muted">JPG, PNG or WebP · max 5 MB each · up to {MAX_PHOTOS} photos{photos.length ? ` · ${photos.length} selected` : ''}</span>
        {photoErr && <span className="field-error">{photoErr}</span>}
      </div>

      <Terms checked={terms} onChange={setTerms}>All transactions are directly between buyers and sellers.</Terms>
      <Errors list={errors} />
      <button type="submit" className="btn btn-primary btn-block">
        List my business — {formatInr(PLANS.business.priceInr)} + GST/month
      </button>
    </form>
  )
}

/* ── Customer ─────────────────────────────────────────── */
function CustomerForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', otp: '', area: '', pin: '' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const up = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))
  const plan = PLANS.customer

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (f.name.trim().length < 2) errs.push('Enter your name.')
    if (f.email && !EMAIL_RE.test(f.email)) errs.push('Enter a valid email or leave it blank.')
    if (f.otp.length !== 6) errs.push('Verify your mobile number with the 6-digit OTP.')
    if (!f.area) errs.push('Choose your area.')
    if (f.pin && !isValidPin(f.pin)) errs.push('Enter a valid 6-digit pin code.')
    if (!terms) errs.push('Accept the terms to continue.')
    setErrors(errs)
    if (!errs.length) onDone() // TODO(backend): create user + Razorpay subscription with trial
  }

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <div className="field">
        <label className="label" htmlFor="c-name">Your full name</label>
        <input id="c-name" className="input" maxLength={80} value={f.name} onChange={(e) => up('name')(e.target.value)} autoComplete="name" />
      </div>
      <div className="field">
        <label className="label" htmlFor="c-email">Email (optional)</label>
        <input id="c-email" className="input" type="email" maxLength={100} value={f.email} onChange={(e) => up('email')(e.target.value)} autoComplete="email" />
      </div>
      <OtpField id="c-phone" label="Mobile number" phone={f.phone} onPhone={up('phone')} otp={f.otp} onOtp={up('otp')} />
      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="c-area">Area / sector</label>
          <AreaSelect id="c-area" value={f.area} onChange={up('area')} placeholder="Select" />
        </div>
        <div className="field">
          <label className="label" htmlFor="c-pin">Pin code (optional)</label>
          <input id="c-pin" className="input" inputMode="numeric" maxLength={6} value={f.pin} onChange={(e) => up('pin')(e.target.value.replace(/\D/g, ''))} placeholder="136118" />
        </div>
      </div>
      <Terms checked={terms} onChange={setTerms}>All payments are made directly to businesses.</Terms>
      <Errors list={errors} />
      <button type="submit" className="btn btn-primary btn-block">Start {plan.trialDays}-day free trial</button>
      <p className="muted" style={{ textAlign: 'center' }}>
        No payment during trial · then {formatInr(plan.priceInr)} + GST/month · cancel anytime
      </p>
    </form>
  )
}

/* ── Driver ───────────────────────────────────────────── */
function DriverForm({ onDone }: { onDone: () => void }) {
  const [f, setF] = useState({ name: '', phone: '', otp: '', area: '', vehicle: DELIVERY_VEHICLES[0].id, regNo: '', licence: '', idType: 'Aadhaar', idLast4: '' })
  const [terms, setTerms] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const up = (k: keyof typeof f) => (v: string) => setF((s) => ({ ...s, [k]: v }))

  function submit(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (f.name.trim().length < 2) errs.push('Enter your name.')
    if (f.otp.length !== 6) errs.push('Verify your mobile number with the 6-digit OTP.')
    if (!f.area) errs.push('Choose the area you mostly work in.')
    if (f.regNo.trim().length < 6) errs.push('Enter your vehicle registration number.')
    if (f.licence.trim().length < 8) errs.push('Enter your driving licence number.')
    if (!/^[0-9A-Z]{4}$/.test(f.idLast4.toUpperCase())) errs.push(`Enter the last 4 characters of your ${f.idType}.`)
    if (!terms) errs.push('Accept the terms to continue.')
    setErrors(errs)
    if (!errs.length) onDone() // TODO(backend): POST /api/drivers → KYC verification queue
  }

  return (
    <form className="form-grid" onSubmit={submit} noValidate>
      <div className="field">
        <label className="label" htmlFor="d-name">Full name (as on licence)</label>
        <input id="d-name" className="input" maxLength={80} value={f.name} onChange={(e) => up('name')(e.target.value)} autoComplete="name" />
      </div>
      <OtpField id="d-phone" label="Mobile number" phone={f.phone} onPhone={up('phone')} otp={f.otp} onOtp={up('otp')} />
      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="d-vehicle">Vehicle type</label>
          <select id="d-vehicle" className="select" value={f.vehicle} onChange={(e) => up('vehicle')(e.target.value)}>
            {DELIVERY_VEHICLES.map((v) => <option key={v.id} value={v.id}>{v.icon} {v.name} ({v.capacity})</option>)}
            <option value="auto">🛺 Auto (rides)</option>
            <option value="cab">🚗 Cab (rides)</option>
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="d-reg">Vehicle registration no.</label>
          <input id="d-reg" className="input" maxLength={13} value={f.regNo} onChange={(e) => up('regNo')(e.target.value.toUpperCase())} placeholder="HR07 AB 1234" />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="d-lic">Driving licence number</label>
        <input id="d-lic" className="input" maxLength={20} value={f.licence} onChange={(e) => up('licence')(e.target.value.toUpperCase())} placeholder="HR07 20190012345" />
      </div>
      <div className="form-row">
        <div className="field">
          <label className="label" htmlFor="d-idtype">ID for verification</label>
          <select id="d-idtype" className="select" value={f.idType} onChange={(e) => up('idType')(e.target.value)}>
            <option>Aadhaar</option>
            <option>PAN</option>
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="d-id4">Last 4 characters</label>
          <input id="d-id4" className="input" maxLength={4} value={f.idLast4} onChange={(e) => up('idLast4')(e.target.value.toUpperCase())} placeholder="1234" />
        </div>
      </div>
      <p className="muted">We never store your full Aadhaar number. Full ID is checked once during verification.</p>
      <div className="field">
        <label className="label" htmlFor="d-area">Main working area</label>
        <AreaSelect id="d-area" value={f.area} onChange={up('area')} placeholder="Select" />
      </div>
      <Terms checked={terms} onChange={setTerms}>I am an independent partner, not an employee of My KKR, and I collect payment directly from customers.</Terms>
      <Errors list={errors} />
      <button type="submit" className="btn btn-primary btn-block">Apply as a driver partner</button>
    </form>
  )
}

/* ── Tabs ─────────────────────────────────────────────── */
export default function RegisterForms({ initialRole }: { initialRole: SignupRole }) {
  const [role, setRole] = useState<SignupRole>(initialRole)
  const [done, setDone] = useState(false)

  if (done) return <Success role={role} />

  return (
    <div className="panel">
      <div className="tabs" role="tablist" aria-label="Account type" style={{ marginBottom: 18 }}>
        {SIGNUP_ROLES.map((r) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={role === r.id}
            className={`tab${role === r.id ? ' active' : ''}`}
            onClick={() => setRole(r.id as SignupRole)}
          >
            {r.icon} {r.id === 'business' ? 'Business' : r.id === 'customer' ? 'Customer' : 'Driver'}
          </button>
        ))}
      </div>
      <p className="muted" style={{ marginBottom: 14 }}>{SIGNUP_ROLES.find((r) => r.id === role)?.summary}</p>
      {role === 'business' && <BusinessForm onDone={() => setDone(true)} />}
      {role === 'customer' && <CustomerForm onDone={() => setDone(true)} />}
      {role === 'driver' && <DriverForm onDone={() => setDone(true)} />}
    </div>
  )
}
