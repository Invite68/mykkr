'use client'

import { useRef } from 'react' // ref kept for future programmatic scroll if needed

interface MediaSlot {
  tag: string
  tagColor?: string
  title: string
  youtubeId?: string
  placeholder?: string
  placeholderIcon?: string | null
  placeholderBg?: string
  cta?: string
  ctaHref?: string
}

const SLOTS: MediaSlot[] = [
  {
    tag: 'Tourism',
    tagColor: '#16a34a',
    title: 'Brahmsarovar — Sacred Lake of Kurukshetra',
    youtubeId: 'LXb3EKWsInQ',
  },
  {
    tag: 'History',
    tagColor: '#2563eb',
    title: 'Jyotisar — Birthplace of the Bhagavad Gita',
    youtubeId: 'MBkAV-kp9gA',
  },
  {
    tag: 'Ad Slot',
    tagColor: '#d97706',
    title: 'Promote your business here',
    placeholder: 'Your ad here',
    placeholderIcon: null,
    placeholderBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    cta: '₹999/week · Contact admin',
    ctaHref: '/about#advertise',
  },
  {
    tag: 'City Update',
    tagColor: '#12343b',
    title: 'Managed from the admin panel',
    placeholder: 'Awaiting content',
    placeholderIcon: null,
    placeholderBg: 'linear-gradient(135deg, #eef3f4 0%, #d8e8ec 100%)',
    cta: 'Check back soon',
  },
  {
    tag: 'Premium Spot',
    tagColor: '#7c3aed',
    title: 'Premium position — contact admin',
    placeholder: 'Premium ad slot',
    placeholderIcon: null,
    placeholderBg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    cta: '₹1,499/week · Contact admin',
    ctaHref: '/about#advertise',
  },
]

export default function MediaStrip() {
  const trackRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ position: 'relative' }}>
      <div
        className="media-track"
        ref={trackRef}
        tabIndex={0}
        aria-label="City updates and promotions"
      >
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
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
                  style={{ contain: 'strict' }}
                />
              ) : (
                <div
                  className="media-placeholder"
                  style={{ background: s.placeholderBg ?? 'var(--night-l)' }}
                >
                  <span className="media-ph-icon" aria-hidden="true">
                    {s.placeholderIcon ?? (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    )}
                  </span>
                  <span className="media-ph-text">{s.placeholder}</span>
                  {s.cta && (
                    s.ctaHref ? (
                      <a href={s.ctaHref} className="media-ph-cta">{s.cta}</a>
                    ) : (
                      <span className="media-ph-cta">{s.cta}</span>
                    )
                  )}
                </div>
              )}
            </div>
            <div className="media-body">
              <div
                className="media-tag"
                style={{ color: s.tagColor ?? 'var(--night)' }}
              >{s.tag}</div>
              <div className="media-title">{s.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
