'use client'

/**
 * SocialProofBar — scrolling ticker of recent platform activity.
 * Uses CSS animation (no JS runtime cost). Psychologically proven to
 * build trust and urgency ("others are using this right now").
 */

const PROOFS = [
  { icon: '🛒', text: 'Rahul from Sector 5 ordered groceries from Sharma Kirana' },
  { icon: '⚡', text: 'Sunita booked an electrician in Gandhi Nagar — fixed in 2 hrs' },
  { icon: '🎂', text: 'Brijwasi Sweets got 12 new orders today' },
  { icon: '🚗', text: 'Priya booked a cab from KU to Ambala in 4 min' },
  { icon: '🔧', text: 'Vikram hired a plumber — arrived same day' },
  { icon: '🏛️', text: 'New marriage venue listed in Pipli area' },
  { icon: '⭐', text: 'Deepak left a 5-star review for Hotel Natraj' },
  { icon: '📦', text: 'Sharma Kirana delivered an order in under 90 minutes' },
  { icon: '🧹', text: 'Nisha booked a home cleaning service for tomorrow' },
  { icon: '✓', text: 'City Cargo Services just got verified on My KKR' },
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
