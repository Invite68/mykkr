/**
 * Strip contact details from public requirement posts so users can't bypass
 * the subscription by posting phone numbers, emails, handles or links.
 */
const PHONE = /(\+91|0)?[\s\-.]?[6-9]\d{4}[\s\-.]?\d{5}/g
const EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
const URL = /https?:\/\/[^\s]+/gi
const SOCIAL = /@[a-zA-Z0-9_.]{2,}|wa\.me|whatsapp|instagram\.com|facebook\.com|t\.me/gi

export function stripContactDetails(text: string): { value: string; removed: boolean } {
  let value = text
    .replace(PHONE, '[phone removed]')
    .replace(EMAIL, '[email removed]')
    .replace(URL, '[link removed]')
  value = value.replace(SOCIAL, '[handle removed]')
  return { value, removed: value !== text }
}

const INDIAN_MOBILE = /^(\+91[\s-]?)?[6-9]\d{9}$/

export function isValidIndianMobile(phone: string): boolean {
  return INDIAN_MOBILE.test(phone.replace(/[\s-]/g, '').replace(/^\+91/, '+91'))
}

export function isValidPin(pin: string): boolean {
  return /^1\d{5}$/.test(pin) // Haryana pin codes start with 1
}

export function jobRef(prefix = 'KKR'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let out = ''
  const buf = new Uint32Array(6)
  crypto.getRandomValues(buf)
  for (const n of buf) out += chars[n % chars.length]
  return `${prefix}-${out}`
}

/**
 * Lightweight PII stub — in production replace with AES-256-GCM
 * using the ENCRYPTION_KEY env var. For v1 we store as-is and flag it.
 * TODO: wire up real encryption before storing real phone numbers.
 */
export function encryptPII(value: string): string {
  // Real implementation: use Node crypto with ENCRYPTION_KEY
  // For now: marker so we know it's unencrypted in dev
  return value
}
