/**
 * QuickCategoryGrid — 3×3 visual icon grid below the hero.
 * Gives users instant one-tap access to top categories.
 * All icons are inline SVG — zero emoji.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

function IcWrench()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> }
function IcFood()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg> }
function IcShopping()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> }
function IcRide()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="9" width="22" height="10" rx="2" ry="2"/><path d="M16 9V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4"/><circle cx="8.5" cy="14.5" r="1.5"/><circle cx="15.5" cy="14.5" r="1.5"/></svg> }
function IcVenue()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> }
function IcBuilding()  { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="2"/><line x1="14" y1="7" x2="14" y2="7.01"/><line x1="14" y1="12" x2="14" y2="12.01"/><line x1="19" y1="7" x2="19" y2="7.01"/><line x1="19" y1="12" x2="19" y2="12.01"/></svg> }
function IcTruck()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> }
function IcTask()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> }
function IcGrid()      { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }

const CATS: { href: string; icon: ReactNode; label: string; sub: string }[] = [
  { href: '/c/services',  icon: <IcWrench />,   label: 'Services',       sub: 'Electrician, plumber…' },
  { href: '/c/food',      icon: <IcFood />,      label: 'Food & Sweets',  sub: 'Restaurants, mithai…' },
  { href: '/c/shopping',  icon: <IcShopping />,  label: 'Shopping',       sub: 'Groceries, fashion…' },
  { href: '/rides',       icon: <IcRide />,      label: 'Rides & Cabs',   sub: 'Book a cab now' },
  { href: '/c/venues',    icon: <IcVenue />,     label: 'Venues',         sub: 'Halls, hotels…' },
  { href: '/c/venues',    icon: <IcBuilding />,  label: 'Real Estate',    sub: 'Rent or buy a shop' },
  { href: '/c/transport', icon: <IcTruck />,     label: 'Delivery',       sub: 'Couriers, cargo' },
  { href: '/find-book',   icon: <IcTask />,      label: 'Post a Task',    sub: 'Get quotes fast' },
  { href: '/categories',  icon: <IcGrid />,      label: 'All Categories', sub: 'See everything' },
]

export default function QuickCategoryGrid() {
  return (
    <div className="qcat-grid">
      {CATS.map((c) => (
        <Link key={c.href + c.label} href={c.href} className="qcat-card">
          <span className="qcat-icon" aria-hidden="true">{c.icon}</span>
          <span className="qcat-label">{c.label}</span>
          <span className="qcat-sub">{c.sub}</span>
        </Link>
      ))}
    </div>
  )
}
