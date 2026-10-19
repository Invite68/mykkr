/**
 * HARD-CODED MONETIZATION RULES — see deployment-status.md → Monetization.
 * Every price shown anywhere in the UI must come from this file.
 */

export const GST_RATE = 0.18

export const PLANS = {
  business: {
    id: 'business',
    name: 'Business Plan',
    priceInr: 99,
    period: 'month',
    trialDays: 0,
    features: [
      'Unlimited listings — goods, services, venues & properties',
      'Full business profile with photos, hours & map pin',
      'Live availability calendar for bookings',
      'Orders, bookings & analytics dashboard',
      'Verified business badge (optional KYC)',
      'Zero commission on every sale — ever',
    ],
  },
  customer: {
    id: 'customer',
    name: 'Customer Plan',
    priceInr: 9.99,
    period: 'month',
    trialDays: 7,
    features: [
      'Unlimited browsing & booking',
      'Unlock direct WhatsApp / call to businesses',
      'Post requirements and receive quotes',
      'Book rides, deliveries and services',
      'Cancel anytime',
    ],
  },
} as const

export type PlanId = keyof typeof PLANS

/** The platform takes ZERO commission on sales, bookings or deliveries. */
export const PLATFORM_COMMISSION_RATE = 0

/** Payment methods customers and businesses settle with DIRECTLY. */
export const DIRECT_PAYMENT_METHODS = ['UPI', 'Cards', 'Wallets', 'Cash on Delivery'] as const

/** Only subscription fees are collected by the platform, via Razorpay. */
export const SUBSCRIPTION_GATEWAY = 'Razorpay'

export const DISCLAIMER =
  'My KKR is only a connector. All disputes, quality, refunds and payments are solely between users.'

export function formatInr(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN', { minimumFractionDigits: amount % 1 ? 2 : 0, maximumFractionDigits: 2 })
}

export function withGst(amount: number): number {
  return Math.round(amount * (1 + GST_RATE) * 100) / 100
}

export const SITE = {
  name: 'My KKR',
  city: 'Kurukshetra',
  state: 'Haryana',
  url: 'https://mykkr.in',
  supportWhatsApp: 'https://wa.me/91XXXXXXXXXX',
  privacyEmail: 'privacy@mykkr.in',
  legalEmail: 'legal@mykkr.in',
} as const
