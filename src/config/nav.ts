/** Single source of truth for navigation. Every href here is checked by scripts/check-links.mjs. */

export interface NavItem {
  href: string
  label: string
  icon: string
}

export const NAV_DISCOVER: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/categories', label: 'All Categories', icon: '🗂️' },
  { href: '/find-book', label: 'Find & Book', icon: '🗺️' },
  { href: '/rides', label: 'Rides & Delivery', icon: '🚗' },
  { href: '/post', label: 'Post Requirement', icon: '📋' },
]

export const NAV_EXPLORE: NavItem[] = [{ href: '/about', label: 'About Kurukshetra', icon: '🏛️' }]

export const NAV_ACCOUNT: NavItem[] = [
  { href: '/pricing', label: 'Pricing', icon: '💳' },
  { href: '/register', label: 'Sign in / Register', icon: '👤' },
  { href: '/dashboard', label: 'Dashboards', icon: '📊' },
]

export const BOTTOM_NAV: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/categories', label: 'Browse', icon: '🔍' },
  { href: '/post', label: 'Post', icon: '+' },
  { href: '/rides', label: 'Rides', icon: '🚗' },
  { href: '/register', label: 'Account', icon: '👤' },
]

export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(href + '/')
}
