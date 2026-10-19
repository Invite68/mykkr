export type DeliveryOption = 'self' | 'driver' | 'pickup'

export const DELIVERY_LABELS: Record<DeliveryOption, string> = {
  self: 'Business self-delivery',
  driver: 'Partner driver',
  pickup: 'Customer pickup',
}

export type { UserRole } from '@/config/roles'
