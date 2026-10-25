'use client'

import Link from 'next/link'
import { useState } from 'react'
import AreaSelect from '@/components/ui/AreaSelect'
import { CATEGORY_GROUPS } from '@/data/categories'
import { stripContactDetails } from '@/lib/sanitize'

const FLEX = ['This exact date only', '±1–2 days', '±1 week', 'Any date this month']
const STEP_TITLES = ['What do you need?', 'When & where?', 'Budget & details', 'Review & post']

interface Draft {
  sub: string
  description: string
  date: string
  flexibility: string
  area: string
  budgetMin: string
  budgetMax: string
  extra: string
}

export default function PostRequirementWizard({ initialSub = '' }: { initialSub?: string }) {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>({
    sub: initialSub,
    description: '',
    date: '',
    flexibility: FLEX[0],
    area: '',
    budgetMin: '',
    budgetMax: '',
    extra: '',
  })
  const [warning, setWarning] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  /** Free-text fields: contact details are removed as the user types */
  function setText(key: 'description' | 'extra', raw: string) {
    const { value, removed } = stripContactDetails(raw)
    if (removed) setWarning('Contact details removed. Don’t include phone numbers, emails, links or social handles — businesses reply through My KKR.')
    set(key, value)
  }

  function validate(s: number): string {
    if (s === 0 && !draft.sub) return 'Choose a category.'
    if (s === 0 && draft.description.trim().length < 15) return 'Describe what you need (at least 15 characters).'
    if (s === 1 && !draft.area) return 'Choose an area.'
    if (s === 2) {
      const min = Number(draft.budgetMin.replace(/,/g, '') || 0)
      const max = Number(draft.budgetMax.replace(/,/g, '') || 0)
      if (Number.isNaN(min) || Number.isNaN(max)) return 'Budget must be a number.'
      if (max && min > max) return 'Minimum budget is higher than maximum.'
    }
    return ''
  }

  function next() {
    const err = validate(step)
    setError(err)
    if (!err) setStep((s) => Math.min(s + 1, 3))
  }

  function back() {
    setError('')
    setStep((s) => Math.max(s - 1, 0))
  }

  // subInfo removed — draft.sub now stores human-readable category label directly

  if (done) {
    return (
      <div className="panel" style={{ textAlign: 'center' }} role="status">
        <div style={{ color: 'var(--night-d)', marginBottom: 8 }} aria-hidden="true">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <h2 className="page-title" style={{ fontSize: 20 }}>Requirement ready</h2>
        <p className="muted" style={{ margin: '6px 0 16px' }}>
          Sign in or start your free trial to publish it. Only verified, subscribed businesses will see it and send quotes.
        </p>
        <Link href="/register?role=customer" className="btn btn-primary">Sign in / start free trial →</Link>
      </div>
    )
  }

  return (
    <div className="panel">
      <div className="progress" aria-label={`Step ${step + 1} of 4`}>
        {STEP_TITLES.map((t, i) => <span key={t} className={i <= step ? 'done' : ''} />)}
      </div>
      <h2 className="sec-title" style={{ marginBottom: 14 }}>{STEP_TITLES[step]}</h2>

      {step === 0 && (
        <div className="form-grid">
          <div className="field">
            <label className="label" htmlFor="pw-sub">Category</label>
            <select id="pw-sub" className="select" value={draft.sub} onChange={(e) => set('sub', e.target.value)}>
              <option value="">Select a category</option>
              {CATEGORY_GROUPS.map((g) => (
                <optgroup key={g.slug} label={g.label}>
                  {g.subcategories.slice(1).map((s) => <option key={s} value={s}>{s}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="pw-desc">Describe your requirement</label>
            <textarea
              id="pw-desc"
              className="textarea"
              maxLength={1000}
              value={draft.description}
              onChange={(e) => setText('description', e.target.value)}
              placeholder="e.g. Need a painter for a 2BHK interior next week, walls only, ~1,100 sq ft."
            />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="form-grid">
          <div className="form-row">
            <div className="field">
              <label className="label" htmlFor="pw-date">Date needed</label>
              <input id="pw-date" className="input" type="date" value={draft.date} onChange={(e) => set('date', e.target.value)} />
            </div>
            <div className="field">
              <label className="label" htmlFor="pw-flex">Flexibility</label>
              <select id="pw-flex" className="select" value={draft.flexibility} onChange={(e) => set('flexibility', e.target.value)}>
                {FLEX.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="pw-area">Area in Kurukshetra</label>
            <AreaSelect id="pw-area" value={draft.area} onChange={(v) => set('area', v)} placeholder="Select area" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="form-grid">
          <div className="form-row">
            <div className="field">
              <label className="label" htmlFor="pw-min">Budget from (₹)</label>
              <input id="pw-min" className="input" inputMode="numeric" maxLength={10} value={draft.budgetMin} onChange={(e) => set('budgetMin', e.target.value.replace(/[^\d,]/g, ''))} placeholder="5,000" />
            </div>
            <div className="field">
              <label className="label" htmlFor="pw-max">Budget to (₹)</label>
              <input id="pw-max" className="input" inputMode="numeric" maxLength={10} value={draft.budgetMax} onChange={(e) => set('budgetMax', e.target.value.replace(/[^\d,]/g, ''))} placeholder="15,000" />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="pw-extra">Additional requirements</label>
            <textarea id="pw-extra" className="textarea" maxLength={1000} value={draft.extra} onChange={(e) => setText('extra', e.target.value)} placeholder="e.g. Pure veg only · parking for 50 cars" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="form-grid">
          <dl className="kv panel" style={{ background: 'var(--bg)' }}>
            <dt>Category</dt><dd>{draft.sub || '—'}</dd>
            <dt>Description</dt><dd>{draft.description}</dd>
            <dt>When</dt><dd>{draft.date || 'Flexible'} · {draft.flexibility}</dd>
            <dt>Area</dt><dd>{draft.area}</dd>
            <dt>Budget</dt><dd>{draft.budgetMin || draft.budgetMax ? `₹${draft.budgetMin || '0'} – ₹${draft.budgetMax || 'open'}` : 'Open to quotes'}</dd>
            {draft.extra && (<><dt>Extra</dt><dd>{draft.extra}</dd></>)}
          </dl>
          <div className="banner banner-info"><span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span><div>Only verified, subscribed businesses can see your requirement.</div></div>
        </div>
      )}

      {warning && (
        <div className="banner banner-warn" role="alert" style={{ marginTop: 12 }}>
          <span aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></span>
          <div>{warning}</div>
        </div>
      )}
      {error && <p className="field-error" role="alert" style={{ marginTop: 10 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        {step > 0 && <button type="button" className="btn btn-outline" onClick={back}>← Back</button>}
        {step < 3 ? (
          <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={next}>Next →</button>
        ) : (
          <button type="button" className="btn btn-accent" style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => setDone(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Post requirement
          </button>
        )}
      </div>
    </div>
  )
}
