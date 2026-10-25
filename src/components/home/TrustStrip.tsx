import type { ReactNode } from 'react'

const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
)
const IcStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
)
const IcLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
)
const IcZero = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)
const IcChat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
)
const IcBike = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 0 0-1-1h-1"/><path d="M13 6 8.5 14M13 6l2 5.5"/><path d="M5.5 14l3-8H9"/><line x1="18.5" y1="17.5" x2="14" y2="11.5"/></svg>
)

const ITEMS: { icon: ReactNode; title: string; desc: string }[] = [
  { icon: <IcCheck />, title: 'Verified businesses', desc: 'Every business reviewed before going live' },
  { icon: <IcStar />,  title: 'Real reviews',        desc: 'Ratings after every transaction' },
  { icon: <IcLock />,  title: 'OTP secured',         desc: 'Phone login — no password needed' },
  { icon: <IcZero />,  title: 'Zero commission',     desc: 'All payments direct buyer to seller' },
  { icon: <IcChat />,  title: 'Direct contact',      desc: 'WhatsApp or call any business' },
  { icon: <IcBike />,  title: 'Local delivery',      desc: 'Self-delivery, partner driver or pickup' },
]

// Duplicate items for seamless infinite scroll
const DOUBLED = [...ITEMS, ...ITEMS]

export default function TrustStrip() {
  return (
    <div className="trust-ticker-wrap" aria-label="Platform features">
      <div className="trust-ticker">
        {DOUBLED.map((t, i) => (
          <div className="trust-chip" key={i}>
            <span className="trust-chip-icon" aria-hidden="true">{t.icon}</span>
            <span className="trust-chip-title">{t.title}</span>
            <span className="trust-chip-sep" aria-hidden="true">&middot;</span>
            <span className="trust-chip-desc">{t.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
