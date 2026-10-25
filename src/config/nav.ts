/** Single source of truth for navigation. Every href here is checked by scripts/check-links.mjs. */
import React from 'react'

export interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
}

const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

const IcHome = () => React.createElement('svg', s, React.createElement('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' }), React.createElement('polyline', { points: '9 22 9 12 15 12 15 22' }))
const IcGrid = () => React.createElement('svg', s, React.createElement('rect', { x: 3, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 3, width: 7, height: 7 }), React.createElement('rect', { x: 14, y: 14, width: 7, height: 7 }), React.createElement('rect', { x: 3, y: 14, width: 7, height: 7 }))
const IcSearch = () => React.createElement('svg', s, React.createElement('circle', { cx: 11, cy: 11, r: 8 }), React.createElement('line', { x1: 21, y1: 21, x2: 16.65, y2: 16.65 }))
const IcCar = () => React.createElement('svg', s, React.createElement('rect', { x: 1, y: 3, width: 15, height: 13 }), React.createElement('polygon', { points: '16 8 20 8 23 11 23 16 16 16 16 8' }), React.createElement('circle', { cx: 5.5, cy: 18.5, r: 2.5 }), React.createElement('circle', { cx: 18.5, cy: 18.5, r: 2.5 }))
const IcClipboard = () => React.createElement('svg', s, React.createElement('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }), React.createElement('rect', { x: 8, y: 2, width: 8, height: 4, rx: 1, ry: 1 }))
const IcInfo = () => React.createElement('svg', s, React.createElement('circle', { cx: 12, cy: 12, r: 10 }), React.createElement('line', { x1: 12, y1: 8, x2: 12, y2: 12 }), React.createElement('line', { x1: 12, y1: 16, x2: 12.01, y2: 16 }))
const IcTag = () => React.createElement('svg', s, React.createElement('line', { x1: 12, y1: 1, x2: 12, y2: 23 }), React.createElement('path', { d: 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' }))
const IcUser = () => React.createElement('svg', s, React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }), React.createElement('circle', { cx: 12, cy: 7, r: 4 }))
const IcBar = () => React.createElement('svg', s, React.createElement('line', { x1: 18, y1: 20, x2: 18, y2: 10 }), React.createElement('line', { x1: 12, y1: 20, x2: 12, y2: 4 }), React.createElement('line', { x1: 6, y1: 20, x2: 6, y2: 14 }))
const IcCalendar = () => React.createElement('svg', s, React.createElement('rect', { x: 3, y: 4, width: 18, height: 18, rx: 2, ry: 2 }), React.createElement('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), React.createElement('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), React.createElement('line', { x1: 3, y1: 10, x2: 21, y2: 10 }))
const IcPlus = () => React.createElement('svg', s, React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }), React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 }))

export const NAV_DISCOVER: NavItem[] = [
  { href: '/', label: 'Home', icon: React.createElement(IcHome) },
  { href: '/categories', label: 'All Categories', icon: React.createElement(IcGrid) },
  { href: '/find-book', label: 'Find & Book', icon: React.createElement(IcSearch) },
  { href: '/rides', label: 'Rides & Delivery', icon: React.createElement(IcCar) },
  { href: '/post', label: 'Post Requirement', icon: React.createElement(IcClipboard) },
]

export const NAV_EXPLORE: NavItem[] = [{ href: '/about', label: 'About Kurukshetra', icon: React.createElement(IcInfo) }]

export const NAV_ACCOUNT: NavItem[] = [
  { href: '/pricing', label: 'Pricing', icon: React.createElement(IcTag) },
  { href: '/register', label: 'Sign in / Register', icon: React.createElement(IcUser) },
  { href: '/dashboard', label: 'Dashboards', icon: React.createElement(IcBar) },
]

export const BOTTOM_NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: React.createElement(IcHome) },
  { href: '/find-book', label: 'Find & Book', icon: React.createElement(IcCalendar) },
  { href: '/post', label: 'Post', icon: React.createElement(IcPlus) },
  { href: '/rides', label: 'Rides', icon: React.createElement(IcCar) },
  { href: '/register', label: 'Account', icon: React.createElement(IcUser) },
]

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}
