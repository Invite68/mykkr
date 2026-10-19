'use client'

import { useRef } from 'react'

interface MediaSlot {
  tag: string
  tagColor?: string
  title: string
  youtubeId?: string
  placeholder?: string
  placeholderIcon?: string
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
    placeholderIcon: '⭐',
    placeholderBg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    cta: '₹999/week · Contact admin',
    ctaHref: '/about#advertise',
  },
  {
    tag: 'City Update',
    tagColor: '#12343b',
    title: 'Managed from the admin panel',
    placeholder: 'Awaiting content',
    placeholderIcon: '📢',
    placeholderBg: 'linear-gradient(135deg, #eef3f4 0%, #d8e8ec 100%)',
    cta: 'Check back soon',
  },
  {
    tag: 'Premium Spot',
    tagColor: '#7c3aed',
    title: 'Premium position — contact admin',
    placeholder: 'Premium ad slot',
    placeholderIcon: '💒',
    placeholderBg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
    cta: '₹1,499/week · Contact admin',
    ctaHref: '/about#advertise',
  },
]

export default function MediaStrip() {
  const trackRef = useRef<HTMLDivElement>(null)

  function scroll(dir: 'prev' | 'next') {
    if (!trackRef.current) return
    const card = trackRef.current.querySelector('.media-card') as HTMLElement
    const step = card ? card.offsetWidth + 12 : 280
    trackRef.current.scrollBy({ left: dir === 'next' ? step : -step, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Scroll controls */}
      <div className="media-controls" aria-hidden="true">
        <button
          className="media-arrow"
          onClick={() => scroll('prev')}
          aria-label="Scroll left"
          type="button"
        >‹</button>
        <button
          className="media-arrow"
          onClick={() => scroll('next')}
          aria-label="Scroll right"
          type="button"
        >›</button>
      </div>

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
                />
              ) : (
                <div
                  className="media-placeholder"
                  style={{ background: s.placeholderBg ?? 'var(--night-l)' }}
                >
                  <span className="media-ph-icon" aria-hidden="true">{s.placeholderIcon ?? '📺'}</span>
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
