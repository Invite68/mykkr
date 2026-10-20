/**
 * PII encryption for phone numbers stored in the jobs table.
 *
 * Uses AES-256-GCM via Node.js `crypto` (built-in — no dependencies).
 *
 * Environment variables required (server-side only, never NEXT_PUBLIC_):
 *   ENCRYPTION_KEY  — 32-byte key, base64-encoded
 *                     generate: openssl rand -base64 32
 *
 * If ENCRYPTION_KEY is not set (e.g. local dev without .env.local),
 * the value is stored as-is with a "plain:" prefix so you can tell
 * the difference in the DB. Set the key in production — always.
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'
const KEY_ENV = 'ENCRYPTION_KEY'

function getKey(): Buffer | null {
  const k = process.env[KEY_ENV]
  if (!k) return null
  const buf = Buffer.from(k, 'base64')
  if (buf.length !== 32) throw new Error(`${KEY_ENV} must be 32 bytes (got ${buf.length})`)
  return buf
}

/**
 * Encrypt a string. Returns a base64 string: iv:authTag:ciphertext
 * Falls back to plain-text prefixed with "plain:" if no key is set.
 */
export function encryptPII(value: string): string {
  const key = getKey()
  if (!key) return `plain:${value}`

  const iv  = randomBytes(12)           // 96-bit IV for GCM
  const cipher = createCipheriv(ALGO, key, iv)
  const enc  = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const tag  = cipher.getAuthTag()

  return [
    iv.toString('base64'),
    tag.toString('base64'),
    enc.toString('base64'),
  ].join(':')
}

/**
 * Decrypt a value produced by encryptPII.
 * Returns the original string, or null if decryption fails.
 */
export function decryptPII(stored: string): string | null {
  if (stored.startsWith('plain:')) return stored.slice(6)

  const key = getKey()
  if (!key) return null

  try {
    const [ivB64, tagB64, encB64] = stored.split(':')
    const iv      = Buffer.from(ivB64,  'base64')
    const tag     = Buffer.from(tagB64, 'base64')
    const encData = Buffer.from(encB64, 'base64')

    const decipher = createDecipheriv(ALGO, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(encData) + decipher.final('utf8')
  } catch {
    return null
  }
}
