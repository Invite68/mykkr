/**
 * "City Updates & Promotions" — 10 admin-managed slots.
 * Content is static for now; the admin panel will feed this from the API.
 */

interface MediaSlot {
  tag: string
  title: string
  youtubeId?: string
  placeholder?: string
}

const SLOTS: MediaSlot[] = [
  { tag: 'Tourism', title: 'Brahmsarovar — Sacred Lake of Kurukshetra', youtubeId: 'LXb3EKWsInQ' },
  { tag: 'History', title: 'Jyotisar — Birthplace of the Bhagavad Gita', youtubeId: 'MBkAV-kp9gA' },
  { tag: '⭐ Ad slot', title: 'Promote your business here — ₹999/week', placeholder: '🏷️ Ad slot available' },
  { tag: 'City update', title: 'Managed from the admin panel', placeholder: '📺 Awaiting content' },
  { tag: '⭐ Ad slot', title: 'Premium position — contact admin', placeholder: '💒 Ad slot available' },
]

export default function MediaStrip() {
  return (
    <div className="media-track" tabIndex={0} aria-label="City updates and promotions">
      {SLOTS.map((s) => (
        <div className="media-card" key={s.title}>
          <div className="media-frame">
            {s.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${s.youtubeId}?rel=0&modestbranding=1`}
                title={s.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <span>{s.placeholder}</span>
            )}
          </div>
          <div className="media-body">
            <div className="media-tag">{s.tag}</div>
            <div className="media-title">{s.title}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
