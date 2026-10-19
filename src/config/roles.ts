/** The four user roles — see deployment-status.md → User Roles. */

export type UserRole = 'business' | 'customer' | 'driver' | 'admin'

export interface RoleInfo {
  id: UserRole
  name: string
  icon: string
  summary: string
  /** Admin accounts are never self-registered */
  selfSignup: boolean
}

export const ROLES: RoleInfo[] = [
  {
    id: 'business',
    name: 'Business Owner',
    icon: '🏪',
    summary: 'Create a profile, list goods, services, venues or properties, and manage orders & bookings.',
    selfSignup: true,
  },
  {
    id: 'customer',
    name: 'Customer / Buyer',
    icon: '🙋',
    summary: 'Browse, buy goods, book services and post requirements.',
    selfSignup: true,
  },
  {
    id: 'driver',
    name: 'Delivery Driver / Partner',
    icon: '🏍️',
    summary: 'Accept delivery and ride jobs, navigate, and complete with photo proof.',
    selfSignup: true,
  },
  {
    id: 'admin',
    name: 'Platform Admin',
    icon: '🛡️',
    summary: 'Manage subscriptions, verify businesses and view analytics.',
    selfSignup: false,
  },
]

export function getRole(id: string): RoleInfo | undefined {
  return ROLES.find((r) => r.id === id)
}
