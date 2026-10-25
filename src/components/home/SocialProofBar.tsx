'use client'

/**
 * SocialProofBar — scrolling ticker of recent platform activity.
 * Uses CSS animation (no JS runtime cost). Psychologically proven to
 * build trust and urgency ("others are using this right now").
 */
import type { ReactNode } from 'react'

const IcCart    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
const IcBolt    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
const IcCake    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
const IcCar     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>
const IcWrench  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
const IcBuilding= () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
const IcStar    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
const IcBox     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
const IcBroom   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 2L4 16"/><path d="M4 16c-1.5 3.5 1 6 3.5 4.5"/><path d="M4 16l3.5 4.5"/></svg>
const IcCheck   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>

const PROOFS: { icon: ReactNode; text: string }[] = [
  { icon: <IcCart />,     text: 'Rahul from Sector 5 ordered groceries from Sharma Kirana' },
  { icon: <IcBolt />,     text: 'Sunita booked an electrician in Gandhi Nagar — fixed in 2 hrs' },
  { icon: <IcCake />,     text: 'Brijwasi Sweets got 12 new orders today' },
  { icon: <IcCar />,      text: 'Priya booked a cab from KU to Ambala in 4 min' },
  { icon: <IcWrench />,   text: 'Vikram hired a plumber — arrived same day' },
  { icon: <IcBuilding />, text: 'New marriage venue listed in Pipli area' },
  { icon: <IcStar />,     text: 'Deepak left a 5-star review for Hotel Natraj' },
  { icon: <IcBox />,      text: 'Sharma Kirana delivered an order in under 90 minutes' },
  { icon: <IcBroom />,    text: 'Nisha booked a home cleaning service for tomorrow' },
  { icon: <IcCheck />,    text: 'City Cargo Services just got verified on My KKR' },
]

const DOUBLED = [...PROOFS, ...PROOFS]

export default function SocialProofBar() {
  return (
    <div className="sp-bar" aria-label="Recent activity on My KKR" aria-live="off">
      <div className="sp-track">
        {DOUBLED.map((p, i) => (
          <span className="sp-item" key={i}>
            <span className="sp-icon" aria-hidden="true">{p.icon}</span>
            {p.text}
          </span>
        ))}
      </div>
    </div>
  )
}
