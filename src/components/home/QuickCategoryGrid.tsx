/**
 * QuickCategoryGrid — 3×3 visual icon grid below the hero.
 * Gives users instant one-tap access to top categories.
 * Replaces the text-only pill row for better visual hierarchy.
 * Psychology: icon + label grids beat text lists for exploration (Hick's Law
 * — each category has its own distinct visual anchor, reducing choice paralysis).
 */
import Link from 'next/link'

const CATS = [
  { href: '/c/services',  emoji: '🔧', label: 'Services',      sub: 'Electrician, plumber…' },
  { href: '/c/food',      emoji: '🍛', label: 'Food & Sweets', sub: 'Restaurants, mithai…' },
  { href: '/c/shopping',  emoji: '🛍️', label: 'Shopping',      sub: 'Groceries, fashion…' },
  { href: '/rides',       emoji: '🚗', label: 'Rides & Cabs',  sub: 'Book a cab now' },
  { href: '/c/venues',    emoji: '🏛️', label: 'Venues',        sub: 'Halls, hotels…' },
  { href: '/c/realestate',emoji: '🏢', label: 'Real Estate',   sub: 'Rent or buy a shop' },
  { href: '/c/transport', emoji: '🚚', label: 'Delivery',      sub: 'Couriers, cargo' },
  { href: '/find-book',   emoji: '📋', label: 'Post a Task',   sub: 'Get quotes fast' },
  { href: '/categories',  emoji: '🗂️', label: 'All Categories',sub: 'See everything' },
]

export default function QuickCategoryGrid() {
  return (
    <div className="qcat-grid">
      {CATS.map((c) => (
        <Link key={c.href} href={c.href} className="qcat-card">
          <span className="qcat-emoji" aria-hidden="true">{c.emoji}</span>
          <span className="qcat-label">{c.label}</span>
          <span className="qcat-sub">{c.sub}</span>
        </Link>
      ))}
    </div>
  )
}
