/**
 * Input sanitization helpers — server and client safe.
 *
 * Rules:
 *   - Strip contact details (phone/UPI/email) from free-text fields
 *     so users can't bypass the platform's connector model.
 *   - All functions are pure and have no side effects.
 */

// Patterns that look like contact details
const CONTACT_PATTERNS = [
  /\b\d{10,}\b/g,                                          // 10+ digit phone numbers
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,    // email addresses
  /\b[A-Za-z0-9]{3,}\.[A-Za-z0-9]{3,}@[a-z]+\b/g,       // UPI handles
  /(https?:\/\/[^\s]+)/g,                                  // URLs
  /\bwa\.me\/[^\s]+/gi,                                    // WhatsApp links
  /\bt\.me\/[^\s]+/gi,                                     // Telegram links
]

/**
 * Strip contact details from a free-text field.
 * Returns { value: cleaned string, removed: true if anything was stripped }.
 * Used in: job notes, service descriptions, task posts.
 */
export function stripContactDetails(text: string): { value: string; removed: boolean } {
  let result = text
  let removed = false
  for (const pattern of CONTACT_PATTERNS) {
    const next = result.replace(pattern, '[contact removed]')
    if (next !== result) removed = true
    result = next
  }
  return { value: result.trim(), removed }
}

/**
 * Sanitize a display name — trim whitespace, collapse multiple spaces.
 */
export function sanitizeName(name: string): string {
  return name.replace(/\s+/g, ' ').trim()
}

/**
 * Normalise an Indian mobile number to 10 digits (strip +91 / 0 prefix).
 * Returns null if the number looks invalid.
 */
export function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0'))  return digits.slice(1)
  if (digits.length === 10) return digits
  return null
}

/**
 * Validate an Indian mobile number (10 digits, starts with 6-9).
 */
export function isValidIndianMobile(raw: string): boolean {
  const normalised = normalisePhone(raw)
  if (!normalised) return false
  return /^[6-9]\d{9}$/.test(normalised)
}

/**
 * Validate a PIN code (4-6 digits).
 */
export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin.trim())
}

/**
 * Generate a human-readable job reference code.
 * Format: KKR-XXXXXXXX (8 uppercase alphanumeric chars).
 */
export function jobRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no 0/O/1/I to avoid confusion
  let result = 'KKR-'
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
