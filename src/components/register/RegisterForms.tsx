'use client'

/**
 * RegisterForms — Two-phase registration wizard
 *
 * Phase 1 (OTP Login): Phone number + OTP only. Quick, low-friction.
 * Phase 2 (Profile Wizard): Step-by-step collection of all profile data
 *   after the user has verified their phone. Each step validates only
 *   its own fields before advancing. Progress bar shows position.
 *
 * No backend wiring yet — replace sendOtp() with Firebase signInWithPhoneNumber
 * and submit() with the relevant POST calls when backend is ready.
 */

import Link from 'next/link'
import { useState, useEffect, useRef, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { CATEGORY_GROUPS } from '@/data/categories'
import { DELIVERY_VEHICLES } from '@/data/vehicles'
import { ROLES, type UserRole } from '@/config/roles'
import { PLANS, formatInr } from '@/config/platform'
import { DELIVERY_LABELS, type DeliveryOption } from '@/types'
import { isValidIndianMobile, isValidPin } from '@/lib/sanitize'
import {
  getAuth,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  type ConfirmationResult,
} from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

type SignupRole = Exclude<UserRole, 'admin'>
const SIGNUP_ROLES = ROLES.filter((r) => r.selfSignup)

const MAX_PHOTOS = 5
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/
const OTHER_SLUG = '__other__'

/* ── Shared helpers ──────────────────────────────────── */

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
      <h2 className="page-title" style={{ fontSize: 20 }}>Registration complete</h2>
      <p className="muted" style={{ margin: '6px 0 16px' }}>{copy[role]}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={`/dashboard/${role}`} className="btn btn-primary">Open my dashboard →</Link>
        <Link href="/" className="btn btn-outline">Back to home</Link>
      </div>
    </div>
  )
}

/* ── Progress bar ────────────────────────────────────── */

function ProgressBar({ current, total, label }: { current: number; total: number; label: string }) {
  const pct = Math.round((current / total) * 100)
  return (
    <div className="wizard-progress" aria-label={`Step ${current} of ${total}: ${label}`}>
      <div className="wizard-progress-track">
        <div className="wizard-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="wizard-progress-label">
        <span>{label}</span>
        <span className="muted">{current} / {total}</span>
      </div>
    </div>
  )
}

/* ── Step wrapper ────────────────────────────────────── */

function StepCard({
  children,
  onNext,
  nextLabel = 'Continue →',
  onBack,
  errors,
  loading,
}: {
  children: ReactNode
  onNext: (e: FormEvent) => void
  nextLabel?: string
  onBack?: () => void
  errors: string[]
  loading?: boolean
}) {
  return (
    <form className="form-grid" onSubmit={onNext} noValidate>
      {children}
      <Errors list={errors} />
      <div className="wizard-actions">
        {onBack && (
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            ← Back
          </button>
        )}
        <button type="submit" className="btn btn-primary wizard-next-btn" disabled={loading}>
          {loading ? 'Please wait…' : nextLabel}
        </button>
      </div>
    </form>
  )
}

/* ── Phase 1: OTP Login ──────────────────────────────── */

function OtpLoginStep({
  role,
  onRole,
  onVerified,
}: {
  role: SignupRole
  onRole: (r: SignupRole) => void
  onVerified: (phone: string, idToken: string) => void
}) {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [msg, setMsg] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const confirmRef = useRef<ConfirmationResult | null>(null)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Clean up reCAPTCHA on unmount
  useEffect(() => {
    return () => { recaptchaRef.current?.clear() }
  }, [])

  async function sendOtp() {
    if (!isValidIndianMobile(phone)) {
      setErrors(['Enter a valid 10-digit Indian mobile number.'])
      return
    }
    setErrors([])
    setSending(true)
    try {
      const auth = getAuth(firebaseApp)

      // Create invisible reCAPTCHA verifier (required by Firebase)
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: () => { /* auto-solved */ },
        })
      }

      const fullPhone = `+91${phone}`
      confirmRef.current = await signInWithPhoneNumber(auth, fullPhone, recaptchaRef.current)
      setSent(true)
      setCooldown(60)
      setMsg('OTP sent. Enter the 6-digit code below.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP'
      setErrors([`Could not send OTP: ${msg}`])
      recaptchaRef.current?.clear()
      recaptchaRef.current = null
    } finally {
      setSending(false)
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault()
    if (!isValidIndianMobile(phone)) {
      setErrors(['Enter a valid 10-digit Indian mobile number.'])
      return
    }
    if (!sent || !confirmRef.current) {
      setErrors(['Send the OTP first.'])
      return
    }
    if (otp.length !== 6) {
      setErrors(['Enter the 6-digit OTP you received.'])
      return
    }
    setErrors([])
    setVerifying(true)
    try {
      const result = await confirmRef.current.confirm(otp)
      const idToken = await result.user.getIdToken()
      onVerified(`+91${phone}`, idToken)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Verification failed'
      setErrors([`Wrong OTP or it has expired. ${msg}`])
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div>
      {/* Role tabs */}
      <div className="tabs" role="tablist" aria-label="Account type" style={{ marginBottom: 18 }}>
        {SIGNUP_ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            role="tab"
            aria-selected={role === r.id}
            className={`tab${role === r.id ? ' active' : ''}`}
            onClick={() => onRole(r.id as SignupRole)}
          >
            {r.icon} {r.id === 'business' ? 'Business' : r.id === 'customer' ? 'Customer' : 'Driver'}
          </button>
        ))}
      </div>

      {/* Role summary */}
      <div className="wizard-role-card">
        <span className="wizard-role-icon" aria-hidden="true">
          {SIGNUP_ROLES.find((r) => r.id === role)?.icon}
        </span>
        <p className="muted">{SIGNUP_ROLES.find((r) => r.id === role)?.summary}</p>
      </div>

      <form className="form-grid" onSubmit={verify} noValidate style={{ marginTop: 20 }}>
        <div className="field">
          <label className="label" htmlFor="login-phone">
            {role === 'customer' ? 'Your mobile number' : role === 'business' ? 'Business WhatsApp number' : 'Driver mobile number'}
          </label>
          <div className="inline-group">
            <span className="input-prefix" aria-hidden="true">+91</span>
            <input
              id="login-phone"
              className="input"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              autoComplete="tel"
              autoFocus
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={sendOtp}
              disabled={cooldown > 0 || sending}
            >
              {sending ? '⏳ Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : sent ? 'Resend OTP' : 'Send OTP'}
            </button>
          </div>
          {msg && <span className="muted" role="status">{msg}</span>}
        </div>

        {sent && (
          <div className="field">
            <label className="label" htmlFor="login-otp">6-digit OTP</label>
            <input
              id="login-otp"
              className="input otp-input"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="• • • • • •"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            />
          </div>
        )}

        <Errors list={errors} />

        {/* Invisible reCAPTCHA mount point — required by Firebase */}
        <div id="recaptcha-container" />

        <button type="submit" className="btn btn-primary btn-block" disabled={!sent || verifying}>
          {verifying ? '⏳ Verifying…' : 'Verify & Continue →'}
        </button>

        <p className="muted" style={{ textAlign: 'center', fontSize: 12 }}>
          By continuing, you agree to our{' '}
          <Link href="/terms" target="_blank">Terms</Link> &amp;{' '}
          <Link href="/privacy" target="_blank">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  )
}

/* ── Business wizard ─────────────────────────────────── */

type BizData = {
  name: string
  owner: string
  catSlug: string | null
  subSlug: string | null
  otherLabel: string
  email: string
  area: string
  pin: string
  street: string
  hours: string
  delivery: DeliveryOption[]
  gstin: string
  photos: File[]
  terms: boolean
}

const BIZ_STEPS = ['Business basics', 'Your location', 'Contact & hours', 'Delivery & photos', 'Review & submit']
const BIZ_TOTAL = BIZ_STEPS.length

function BusinessWizard({ phone, idToken, onDone }: { phone: string; idToken: string; onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [d, setD] = useState<BizData>({
    name: '', owner: '', catSlug: null, subSlug: null, otherLabel: '',
    email: '', area: '', pin: '', street: '', hours: '9:00 AM – 8:00 PM',
    delivery: ['pickup'], gstin: '', photos: [], terms: false,
  })
  const [photoErr, setPhotoErr] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  function up<K extends keyof BizData>(k: K, v: BizData[K]) {
    setD((s) => ({ ...s, [k]: v }))
  }

  function goNext() { setErrors([]); setStep((s) => s + 1) }
  function goBack() { setErrors([]); setStep((s) => s - 1) }

  /* Step 1 — Business basics */
  function step1(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (d.name.trim().length < 2) errs.push('Enter your business name.')
    if (!d.catSlug) errs.push('Pick a category.')
    if (d.catSlug === OTHER_SLUG && d.otherLabel.trim().length < 2) errs.push('Enter your custom category name.')
    if (d.catSlug && d.catSlug !== OTHER_SLUG && !d.subSlug) errs.push('Pick a subcategory.')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  /* Step 2 — Location */
  function step2(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!d.area) errs.push('Choose your area.')
    if (!isValidPin(d.pin)) errs.push('Enter a valid 6-digit pin code.')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  /* Step 3 — Contact & hours */
  function step3(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (d.owner.trim().length < 2) errs.push("Enter the owner's name.")
    if (d.email && !EMAIL_RE.test(d.email)) errs.push('Enter a valid email or leave it blank.')
    if (d.gstin && !GSTIN_RE.test(d.gstin.toUpperCase())) errs.push('GSTIN format looks wrong (15 characters).')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  /* Step 4 — Delivery & photos */
  function step4(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (photoErr) errs.push(photoErr)
    setErrors(errs)
    if (!errs.length) goNext()
  }

  /* Step 5 — Review & submit */
  function step5(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!d.terms) errs.push('Accept the terms to continue.')
    setErrors(errs)
    if (errs.length) return

    setErrors([])
    submitBusiness()
  }

  async function submitBusiness() {
    setErrors(['Submitting…'])
    try {
      const res = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          businessName:  d.name.trim(),
          category:      activeGroup?.label ?? d.otherLabel.trim(),
          subCategory:   d.subSlug ?? undefined,
          description:   undefined,
          addressLine:   d.street.trim() || undefined,
          area:          d.area || undefined,
          city:          d.area || 'Kurukshetra',
          pinCode:       d.pin || undefined,
          contactEmail:  d.email.trim() || undefined,
          gstin:         d.gstin.trim() || undefined,
          openingTime:   d.hours.split('–')[0]?.trim() || undefined,
          closingTime:   d.hours.split('–')[1]?.trim() || undefined,
          deliveryModes: d.delivery,
        }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setErrors([json.error ?? 'Submission failed. Please try again.'])
        return
      }
      onDone()
    } catch {
      setErrors(['Network error — please check your connection and try again.'])
    }
  }

  function onPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setPhotoErr('')
    up('photos', [])
    if (files.length > MAX_PHOTOS) { setPhotoErr(`Max ${MAX_PHOTOS} photos.`); return }
    const bad = files.find((x) => !PHOTO_TYPES.includes(x.type) || x.size > MAX_PHOTO_BYTES)
    if (bad) { setPhotoErr(`${bad.name}: JPG/PNG/WebP only, max 5 MB each.`); return }
    up('photos', files)
  }

  function toggleDelivery(opt: DeliveryOption) {
    up('delivery', d.delivery.includes(opt) ? d.delivery.filter((x) => x !== opt) : [...d.delivery, opt])
  }

  const activeGroup = CATEGORY_GROUPS.find((g) => g.slug === d.catSlug) ?? null

  return (
    <div>
      <ProgressBar current={step} total={BIZ_TOTAL} label={BIZ_STEPS[step - 1]} />

      {/* Step 1 — Business basics */}
      {step === 1 && (
        <StepCard onNext={step1} errors={errors}>
          <div className="step-heading">🏪 Tell us about your business</div>
          <div className="field">
            <label className="label" htmlFor="b-name">Business name <span className="req">*</span></label>
            <input id="b-name" className="input" maxLength={100} value={d.name}
              onChange={(e) => up('name', e.target.value)} placeholder="e.g. Sharma Electricals" autoFocus />
          </div>

          {/* Category L1 */}
          <div className="field">
            <label className="label" htmlFor="b-cat">Category <span className="req">*</span></label>
            <select id="b-cat" className="select" value={d.catSlug ?? ''}
              onChange={(e) => { up('catSlug', e.target.value || null); up('subSlug', null); up('otherLabel', '') }}>
              <option value="">Select a category</option>
              {CATEGORY_GROUPS.map((g) => <option key={g.slug} value={g.slug}>{g.icon} {g.label}</option>)}
              <option value={OTHER_SLUG}>➕ Other</option>
            </select>
          </div>

          {/* Category L2 */}
          {activeGroup && (
            <div className="field">
              <label className="label" htmlFor="b-sub">Sub-category <span className="req">*</span></label>
              <select id="b-sub" className="select" value={d.subSlug ?? ''}
                onChange={(e) => up('subSlug', e.target.value || null)}>
                <option value="">Select</option>
                {activeGroup.subcategories.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Other category free text */}
          {d.catSlug === OTHER_SLUG && (
            <div className="field">
              <label className="label" htmlFor="b-other">Describe your category <span className="req">*</span></label>
              <input id="b-other" className="input" maxLength={80} value={d.otherLabel}
                onChange={(e) => up('otherLabel', e.target.value)} placeholder="e.g. Book Store, Yoga Studio" />
            </div>
          )}
        </StepCard>
      )}

      {/* Step 2 — Location */}
      {step === 2 && (
        <StepCard onNext={step2} onBack={goBack} errors={errors}>
          <div className="step-heading">📍 Where is your business?</div>
          <div className="field">
            <label className="label" htmlFor="b-area">Area / tehsil <span className="req">*</span></label>
            <AreaSelect id="b-area" value={d.area} onChange={(v) => up('area', v)} placeholder="Select your area" />
          </div>
          <div className="form-row">
            <div className="field">
              <label className="label" htmlFor="b-pin">Pin code <span className="req">*</span></label>
              <input id="b-pin" className="input" inputMode="numeric" maxLength={6} value={d.pin}
                onChange={(e) => up('pin', e.target.value.replace(/\D/g, ''))} placeholder="136118" />
            </div>
            <div className="field">
              <label className="label" htmlFor="b-street">Street / landmark</label>
              <input id="b-street" className="input" maxLength={200} value={d.street}
                onChange={(e) => up('street', e.target.value)} placeholder="Near Bus Stand" />
            </div>
          </div>
          <div className="wizard-map-hint">
            <span aria-hidden="true">🗺️</span>
            <span className="muted">Exact map pin can be added from your dashboard after signup.</span>
          </div>
        </StepCard>
      )}

      {/* Step 3 — Contact & hours */}
      {step === 3 && (
        <StepCard onNext={step3} onBack={goBack} errors={errors}>
          <div className="step-heading">📞 Contact & operating hours</div>
          <p className="muted" style={{ marginBottom: 12 }}>Verified phone: <strong>+91 {phone}</strong></p>
          <div className="field">
            <label className="label" htmlFor="b-owner">Owner / manager name <span className="req">*</span></label>
            <input id="b-owner" className="input" maxLength={80} value={d.owner}
              onChange={(e) => up('owner', e.target.value)} autoComplete="name" placeholder="Your full name" />
          </div>
          <div className="field">
            <label className="label" htmlFor="b-email">Business email <span className="muted">(optional)</span></label>
            <input id="b-email" className="input" type="email" maxLength={100} value={d.email}
              onChange={(e) => up('email', e.target.value)} autoComplete="email" placeholder="shop@example.com" />
          </div>
          <div className="field">
            <label className="label" htmlFor="b-hours">Operating hours</label>
            <input id="b-hours" className="input" maxLength={60} value={d.hours}
              onChange={(e) => up('hours', e.target.value)} placeholder="9:00 AM – 8:00 PM" />
          </div>
          <div className="field">
            <label className="label" htmlFor="b-gstin">GSTIN <span className="muted">(optional)</span></label>
            <input id="b-gstin" className="input" maxLength={15} value={d.gstin}
              onChange={(e) => up('gstin', e.target.value.toUpperCase())} placeholder="06ABCDE1234F1Z5" />
          </div>
        </StepCard>
      )}

      {/* Step 4 — Delivery & photos */}
      {step === 4 && (
        <StepCard onNext={step4} onBack={goBack} errors={errors}>
          <div className="step-heading">🚚 Delivery options & photos</div>

          <fieldset className="field" style={{ border: 'none' }}>
            <legend className="label" style={{ marginBottom: 6 }}>How can customers receive their orders?</legend>
            <div className="chips" style={{ flexWrap: 'wrap' }}>
              {(Object.keys(DELIVERY_LABELS) as DeliveryOption[]).map((opt) => (
                <button type="button" key={opt}
                  className={`chip${d.delivery.includes(opt) ? ' active' : ''}`}
                  aria-pressed={d.delivery.includes(opt)}
                  onClick={() => toggleDelivery(opt)}>
                  {DELIVERY_LABELS[opt]}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="field">
            <label className="label" htmlFor="b-photos">
              Business photos <span className="muted">(optional — add up to {MAX_PHOTOS})</span>
            </label>
            <input id="b-photos" className="input" type="file"
              accept={PHOTO_TYPES.join(',')} multiple onChange={onPhotos} />
            <span className="muted">JPG, PNG or WebP · max 5 MB each{d.photos.length ? ` · ${d.photos.length} selected` : ''}</span>
          </div>
        </StepCard>
      )}

      {/* Step 5 — Review & submit */}
      {step === 5 && (
        <StepCard onNext={step5} onBack={goBack} nextLabel={`List my business — ${formatInr(PLANS.business.priceInr)} + GST/month`} errors={errors}>
          <div className="step-heading">✅ Review your details</div>

          <div className="wizard-review">
            <ReviewRow label="Business" value={d.name} />
            <ReviewRow label="Category" value={d.catSlug === OTHER_SLUG ? d.otherLabel : `${d.catSlug ?? ''}${d.subSlug ? ' → ' + d.subSlug : ''}`} />
            <ReviewRow label="Location" value={`${d.area}, ${d.pin}${d.street ? ' · ' + d.street : ''}`} />
            <ReviewRow label="Phone" value={`+91 ${phone}`} />
            <ReviewRow label="Owner" value={d.owner} />
            {d.email && <ReviewRow label="Email" value={d.email} />}
            <ReviewRow label="Hours" value={d.hours} />
            <ReviewRow label="Delivery" value={d.delivery.map((o) => DELIVERY_LABELS[o]).join(', ') || '—'} />
            {d.photos.length > 0 && <ReviewRow label="Photos" value={`${d.photos.length} photo${d.photos.length > 1 ? 's' : ''} selected`} />}
          </div>

          <div className="wizard-plan-box">
            <div className="wizard-plan-name">Business Plan</div>
            <div className="wizard-plan-price">{formatInr(PLANS.business.priceInr)}<span className="wizard-plan-period">+ GST/month</span></div>
            <p className="muted" style={{ fontSize: 12.5 }}>Unlimited listings · 0% commission · 0% on sales ever</p>
          </div>

          <Terms checked={d.terms} onChange={(v) => up('terms', v)}>
            All transactions are directly between buyers and sellers.
          </Terms>
        </StepCard>
      )}
    </div>
  )
}

/* ── Customer wizard ─────────────────────────────────── */

type CustData = { name: string; email: string; area: string; pin: string; terms: boolean }
const CUST_STEPS = ['Your details', 'Your location', 'Start trial']
const CUST_TOTAL = CUST_STEPS.length

function CustomerWizard({ phone, idToken, onDone }: { phone: string; idToken: string; onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [d, setD] = useState<CustData>({ name: '', email: '', area: '', pin: '', terms: false })
  const [errors, setErrors] = useState<string[]>([])
  const plan = PLANS.customer

  function up<K extends keyof CustData>(k: K, v: CustData[K]) { setD((s) => ({ ...s, [k]: v })) }
  function goNext() { setErrors([]); setStep((s) => s + 1) }
  function goBack() { setErrors([]); setStep((s) => s - 1) }

  function step1(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (d.name.trim().length < 2) errs.push('Enter your name.')
    if (d.email && !EMAIL_RE.test(d.email)) errs.push('Enter a valid email or leave it blank.')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  function step2(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!d.area) errs.push('Choose your area.')
    if (d.pin && !isValidPin(d.pin)) errs.push('Enter a valid 6-digit pin code.')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  function step3(e: FormEvent) {
    e.preventDefault()
    if (!d.terms) { setErrors(['Accept the terms to continue.']); return }
    setErrors([])
    submitCustomer()
  }

  async function submitCustomer() {
    setErrors(['Submitting…'])
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fullName: d.name.trim(),
          email:    d.email.trim() || undefined,
          area:     d.area || undefined,
          city:     d.area || 'Kurukshetra',
          pinCode:  d.pin || undefined,
        }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setErrors([json.error ?? 'Submission failed. Please try again.'])
        return
      }
      onDone()
    } catch {
      setErrors(['Network error — please check your connection and try again.'])
    }
  }

  return (
    <div>
      <ProgressBar current={step} total={CUST_TOTAL} label={CUST_STEPS[step - 1]} />

      {step === 1 && (
        <StepCard onNext={step1} errors={errors}>
          <div className="step-heading">👋 Tell us your name</div>
          <p className="muted" style={{ marginBottom: 12 }}>Verified phone: <strong>+91 {phone}</strong></p>
          <div className="field">
            <label className="label" htmlFor="c-name">Your full name <span className="req">*</span></label>
            <input id="c-name" className="input" maxLength={80} value={d.name}
              onChange={(e) => up('name', e.target.value)} autoComplete="name" autoFocus placeholder="e.g. Ankit Sharma" />
          </div>
          <div className="field">
            <label className="label" htmlFor="c-email">Email <span className="muted">(optional — for order receipts)</span></label>
            <input id="c-email" className="input" type="email" maxLength={100} value={d.email}
              onChange={(e) => up('email', e.target.value)} autoComplete="email" placeholder="ankit@example.com" />
          </div>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard onNext={step2} onBack={goBack} errors={errors}>
          <div className="step-heading">📍 Where are you based?</div>
          <p className="muted" style={{ marginBottom: 12 }}>Helps us show businesses near you first.</p>
          <div className="field">
            <label className="label" htmlFor="c-area">Area / sector <span className="req">*</span></label>
            <AreaSelect id="c-area" value={d.area} onChange={(v) => up('area', v)} placeholder="Select your area" />
          </div>
          <div className="field">
            <label className="label" htmlFor="c-pin">Pin code <span className="muted">(optional)</span></label>
            <input id="c-pin" className="input" inputMode="numeric" maxLength={6} value={d.pin}
              onChange={(e) => up('pin', e.target.value.replace(/\D/g, ''))} placeholder="136118" />
          </div>
        </StepCard>
      )}

      {step === 3 && (
        <StepCard onNext={step3} onBack={goBack} nextLabel={`Start ${plan.trialDays}-day free trial`} errors={errors}>
          <div className="step-heading">🎁 Your free trial</div>

          <div className="wizard-plan-box">
            <div className="wizard-plan-name">Customer Plan</div>
            <div className="wizard-plan-price">{formatInr(plan.priceInr)}<span className="wizard-plan-period">+ GST/month</span></div>
            <p className="muted" style={{ fontSize: 12.5 }}>
              First {plan.trialDays} days free · no card needed · cancel anytime
            </p>
          </div>

          <div className="wizard-review">
            <ReviewRow label="Name" value={d.name} />
            <ReviewRow label="Phone" value={`+91 ${phone}`} />
            {d.email && <ReviewRow label="Email" value={d.email} />}
            <ReviewRow label="Area" value={d.area} />
          </div>

          <Terms checked={d.terms} onChange={(v) => up('terms', v)}>
            All payments are made directly to businesses.
          </Terms>
        </StepCard>
      )}
    </div>
  )
}

/* ── Driver wizard ───────────────────────────────────── */

type DriverData = {
  name: string
  vehicle: string
  regNo: string
  licence: string
  idType: string
  idLast4: string
  area: string
  terms: boolean
}
const DRV_STEPS = ['Personal details', 'Vehicle details', 'ID verification', 'Working area']
const DRV_TOTAL = DRV_STEPS.length

function DriverWizard({ phone, idToken, onDone }: { phone: string; idToken: string; onDone: () => void }) {
  const [step, setStep] = useState(1)
  const [d, setD] = useState<DriverData>({
    name: '', vehicle: DELIVERY_VEHICLES[0].id, regNo: '', licence: '',
    idType: 'Aadhaar', idLast4: '', area: '', terms: false,
  })
  const [errors, setErrors] = useState<string[]>([])

  function up<K extends keyof DriverData>(k: K, v: DriverData[K]) { setD((s) => ({ ...s, [k]: v })) }
  function goNext() { setErrors([]); setStep((s) => s + 1) }
  function goBack() { setErrors([]); setStep((s) => s - 1) }

  function step1(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (d.name.trim().length < 2) errs.push('Enter your full name (as on driving licence).')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  function step2(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (d.regNo.trim().length < 6) errs.push('Enter a valid vehicle registration number.')
    if (d.licence.trim().length < 8) errs.push('Enter your driving licence number.')
    setErrors(errs)
    if (!errs.length) goNext()
  }

  function step3(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!/^[0-9A-Z]{4}$/.test(d.idLast4.toUpperCase())) errs.push(`Enter the last 4 characters of your ${d.idType}.`)
    setErrors(errs)
    if (!errs.length) goNext()
  }

  function step4(e: FormEvent) {
    e.preventDefault()
    const errs: string[] = []
    if (!d.area) errs.push('Choose the area you mostly work in.')
    if (!d.terms) errs.push('Accept the terms to continue.')
    setErrors(errs)
    if (!errs.length) submitDriver()
  }

  async function submitDriver() {
    setErrors(['Submitting…'])
    try {
      const res = await fetch('/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          fullName:      d.name.trim(),
          vehicleType:   d.vehicle,
          vehicleNumber: d.regNo.trim(),
          licenseNumber: d.licence.trim() || undefined,
          aadhaarLast4:  d.idLast4.trim() || undefined,
          workingArea:   d.area || undefined,
          city:          d.area || 'Kurukshetra',
        }),
      })
      if (!res.ok) {
        const json = await res.json() as { error?: string }
        setErrors([json.error ?? 'Submission failed. Please try again.'])
        return
      }
      onDone()
    } catch {
      setErrors(['Network error — please check your connection and try again.'])
    }
  }

  return (
    <div>
      <ProgressBar current={step} total={DRV_TOTAL} label={DRV_STEPS[step - 1]} />

      {step === 1 && (
        <StepCard onNext={step1} errors={errors}>
          <div className="step-heading">🏍️ Your personal details</div>
          <p className="muted" style={{ marginBottom: 12 }}>Verified phone: <strong>+91 {phone}</strong></p>
          <div className="field">
            <label className="label" htmlFor="d-name">Full name (as on driving licence) <span className="req">*</span></label>
            <input id="d-name" className="input" maxLength={80} value={d.name}
              onChange={(e) => up('name', e.target.value)} autoComplete="name" autoFocus placeholder="e.g. Rajesh Kumar" />
          </div>
        </StepCard>
      )}

      {step === 2 && (
        <StepCard onNext={step2} onBack={goBack} errors={errors}>
          <div className="step-heading">🚗 Your vehicle details</div>
          <div className="field">
            <label className="label" htmlFor="d-vehicle">Vehicle type <span className="req">*</span></label>
            <select id="d-vehicle" className="select" value={d.vehicle}
              onChange={(e) => up('vehicle', e.target.value)}>
              {DELIVERY_VEHICLES.map((v) => (
                <option key={v.id} value={v.id}>{v.icon} {v.name} ({v.capacity})</option>
              ))}
              <option value="auto">🛺 Auto (rides)</option>
              <option value="cab">🚗 Cab (rides)</option>
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="d-reg">Vehicle registration number <span className="req">*</span></label>
            <input id="d-reg" className="input" maxLength={13} value={d.regNo}
              onChange={(e) => up('regNo', e.target.value.toUpperCase())} placeholder="HR07 AB 1234" />
          </div>
          <div className="field">
            <label className="label" htmlFor="d-lic">Driving licence number <span className="req">*</span></label>
            <input id="d-lic" className="input" maxLength={20} value={d.licence}
              onChange={(e) => up('licence', e.target.value.toUpperCase())} placeholder="HR07 20190012345" />
          </div>
        </StepCard>
      )}

      {step === 3 && (
        <StepCard onNext={step3} onBack={goBack} errors={errors}>
          <div className="step-heading">🪪 ID verification</div>
          <p className="muted" style={{ marginBottom: 12 }}>
            We only store the last 4 characters — your full ID is checked once during verification and never stored.
          </p>
          <div className="form-row">
            <div className="field">
              <label className="label" htmlFor="d-idtype">ID type <span className="req">*</span></label>
              <select id="d-idtype" className="select" value={d.idType}
                onChange={(e) => up('idType', e.target.value)}>
                <option>Aadhaar</option>
                <option>PAN</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="d-id4">Last 4 characters <span className="req">*</span></label>
              <input id="d-id4" className="input" maxLength={4} value={d.idLast4}
                onChange={(e) => up('idLast4', e.target.value.toUpperCase())} placeholder="1234" />
            </div>
          </div>
        </StepCard>
      )}

      {step === 4 && (
        <StepCard onNext={step4} onBack={goBack} nextLabel="Apply as driver partner" errors={errors}>
          <div className="step-heading">📍 Your working area</div>

          <div className="wizard-review">
            <ReviewRow label="Name" value={d.name} />
            <ReviewRow label="Phone" value={`+91 ${phone}`} />
            <ReviewRow label="Vehicle" value={`${d.vehicle} · ${d.regNo}`} />
            <ReviewRow label="Licence" value={d.licence} />
            <ReviewRow label="ID" value={`${d.idType} ····${d.idLast4}`} />
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label className="label" htmlFor="d-area">Main working area <span className="req">*</span></label>
            <AreaSelect id="d-area" value={d.area} onChange={(v) => up('area', v)} placeholder="Select your primary area" />
          </div>

          <Terms checked={d.terms} onChange={(v) => up('terms', v)}>
            I am an independent partner, not an employee of My KKR, and I collect payment directly from customers.
          </Terms>
        </StepCard>
      )}
    </div>
  )
}

/* ── Review row helper ───────────────────────────────── */

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div className="wizard-review-row">
      <span className="wizard-review-label">{label}</span>
      <span className="wizard-review-value">{value}</span>
    </div>
  )
}

/* ── Root component ──────────────────────────────────── */

export default function RegisterForms({ initialRole }: { initialRole: SignupRole }) {
  const [role, setRole] = useState<SignupRole>(initialRole)
  // null = Phase 1, { phone, idToken } = Phase 2
  const [session, setSession] = useState<{ phone: string; idToken: string } | null>(null)
  const [done, setDone] = useState(false)

  if (done) return <Success role={role} />

  return (
    <div className="panel">
      {session === null ? (
        /* Phase 1 — OTP login */
        <>
          <h2 className="page-title" style={{ fontSize: 20, marginBottom: 4 }}>Create your account</h2>
          <p className="muted" style={{ marginBottom: 18 }}>Enter your phone number to get started — takes under a minute.</p>
          <OtpLoginStep
            role={role}
            onRole={setRole}
            onVerified={(phone, idToken) => setSession({ phone, idToken })}
          />
        </>
      ) : (
        /* Phase 2 — profile wizard */
        <>
          <h2 className="page-title" style={{ fontSize: 20, marginBottom: 4 }}>
            {role === 'business' ? '🏪 Complete your business profile'
              : role === 'customer' ? '👋 Complete your profile'
              : '🏍️ Complete your driver profile'}
          </h2>
          <p className="muted" style={{ marginBottom: 18 }}>
            {role === 'business' ? 'A few more details and your shop goes live.'
              : role === 'customer' ? 'Just a couple more details to get you started.'
              : 'Submit your application — we verify and activate within 24 hours.'}
          </p>
          {role === 'business' && <BusinessWizard phone={session.phone} idToken={session.idToken} onDone={() => setDone(true)} />}
          {role === 'customer' && <CustomerWizard phone={session.phone} idToken={session.idToken} onDone={() => setDone(true)} />}
          {role === 'driver'   && <DriverWizard   phone={session.phone} idToken={session.idToken} onDone={() => setDone(true)} />}
        </>
      )}
    </div>
  )
}
