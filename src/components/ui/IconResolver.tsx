/**
 * IconResolver — maps icon slug keys to SVG components.
 * Used anywhere a data model stores an icon key (categories, roles).
 */
import React from 'react'
import {
  IconServices, IconVenues, IconShopping, IconFood, IconTransport, IconEvents, IconAll,
  IconBusiness, IconCustomer, IconDriver, IconDashboard, IconSearch,
} from '@/components/layout/NavIcons'

const MAP: Record<string, () => React.ReactElement> = {
  services: IconServices,
  venues: IconVenues,
  shopping: IconShopping,
  food: IconFood,
  transport: IconTransport,
  events: IconEvents,
  all: IconAll,
  other: IconAll,
  business: IconBusiness,
  customer: IconCustomer,
  driver: IconDriver,
  admin: IconDashboard,
  search: IconSearch,
}

export function getIconComponent(key: string): (() => React.ReactElement) {
  return MAP[key] ?? IconAll
}

interface IconProps {
  name: string
  className?: string
}

export default function Icon({ name, className }: IconProps): React.ReactElement {
  const Comp = getIconComponent(name)
  return <span className={className} aria-hidden="true"><Comp /></span>
}
