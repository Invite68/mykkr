const ITEMS = [
  { icon: '✓', title: 'Verified businesses', desc: 'Every business reviewed before going live' },
  { icon: '★', title: 'Real reviews', desc: 'Ratings after every transaction' },
  { icon: '🔒', title: 'OTP secured', desc: 'Phone login — no password needed' },
  { icon: '💸', title: 'Zero commission', desc: 'All payments direct buyer to seller' },
  { icon: '💬', title: 'Direct contact', desc: 'WhatsApp or call any business' },
  { icon: '🚴', title: 'Local delivery', desc: 'Self-delivery, partner driver or pickup' },
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
