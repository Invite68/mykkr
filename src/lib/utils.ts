import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format Indian currency */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format price range */
export function formatPriceRange(min: number, max: number): string {
  if (min === max) return formatINR(min)
  return `${formatINR(min)} – ${formatINR(max)}`
}

/** Format Indian phone number */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `+91 ${digits.slice(0,5)} ${digits.slice(5)}`
  }
  return phone
}

/** Generate WhatsApp link */
export function whatsappLink(phone: string, message?: string): string {
  const digits = phone.replace(/\D/g, '')
  const num = digits.startsWith('91') ? digits : `91${digits}`
  const text = message ? encodeURIComponent(message) : ''
  return `https://wa.me/${num}${text ? `?text=${text}` : ''}`
}

/** Generate Google Maps link */
export function mapsLink(address: string, lat?: number, lng?: number): string {
  if (lat && lng) {
    return `https://maps.google.com/?q=${lat},${lng}`
  }
  return `https://maps.google.com/?q=${encodeURIComponent(address)}`
}

/** Time slot helpers */
export function timeSlots(from = 7, to = 22): string[] {
  const slots = []
  for (let h = from; h <= to; h++) {
    slots.push(`${h.toString().padStart(2, '0')}:00`)
    if (h < to) slots.push(`${h.toString().padStart(2, '0')}:30`)
  }
  return slots
}

/** Check if two time ranges overlap */
export function timesOverlap(
  s1: string, e1: string,
  s2: string, e2: string
): boolean {
  const toMin = (t: string) => {
    const [h, m] = t.split(':').map(Number)
    return h * 60 + m
  }
  return toMin(s1) < toMin(e2) && toMin(e1) > toMin(s2)
}

/** Format date for display */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/** Get days in month */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

/** Get first day of month (0=Sun) */
export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}

/** Truncate text */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/** Debounce */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** Generate slug */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Star rating array */
export function starArray(rating: number): ('full' | 'half' | 'empty')[] {
  return [1, 2, 3, 4, 5].map(i => {
    if (i <= Math.floor(rating)) return 'full'
    if (i === Math.ceil(rating) && rating % 1 >= 0.5) return 'half'
    return 'empty'
  })
}
