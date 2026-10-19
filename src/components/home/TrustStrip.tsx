const ITEMS = [
  { icon: '✓', title: 'Verified businesses', desc: 'Every business reviewed before going live' },
  { icon: '★', title: 'Real reviews', desc: 'Ratings after every transaction' },
  { icon: '🔒', title: 'OTP secured', desc: 'Phone login — no password needed' },
  { icon: '💸', title: 'Zero commission', desc: 'All payments direct buyer to seller' },
  { icon: '💬', title: 'Direct contact', desc: 'WhatsApp or call any business' },
  { icon: '🚴', title: 'Local delivery', desc: 'Self-delivery, partner driver or pickup' },
]

export default function TrustStrip() {
  return (
    <div className="trust-grid">
      {ITEMS.map((t) => (
        <div className="trust-item" key={t.title}>
          <div className="trust-icon" aria-hidden="true">{t.icon}</div>
          <div>
            <div className="trust-title">{t.title}</div>
            <div className="trust-desc">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
