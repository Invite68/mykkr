/**
 * User database helpers — server-side only.
 *
 * All operations use parameterised queries via src/lib/db.ts.
 * Phone numbers are AES-256-GCM encrypted before storage.
 */

import { query, transaction } from '@/lib/db'
import { encryptPII }         from '@/lib/encrypt'

export type UserRole = 'business' | 'customer' | 'driver' | 'admin'

export interface DbUser {
  id:           string
  firebase_uid: string
  phone:        string   // encrypted in DB, not returned to client
  role:         UserRole
  display_name: string | null
  avatar_url:   string | null
  is_active:    boolean
  created_at:   string
  updated_at:   string
}

/**
 * Find a user by Firebase UID. Returns null if not found.
 */
export async function findUserByUid(firebaseUid: string): Promise<DbUser | null> {
  const rows = await query<DbUser>(
    'SELECT * FROM users WHERE firebase_uid = $1 LIMIT 1',
    [firebaseUid]
  )
  return rows[0] ?? null
}

/**
 * Create a new user record.
 * Phone is encrypted before insert.
 */
export async function createUser(params: {
  firebaseUid: string
  phone:       string   // plain text — encrypted here
  role:        UserRole
  displayName?: string
}): Promise<DbUser> {
  const encPhone = encryptPII(params.phone)

  const rows = await query<DbUser>(
    `INSERT INTO users (firebase_uid, phone, role, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [params.firebaseUid, encPhone, params.role, params.displayName ?? null]
  )
  return rows[0]
}

/**
 * Find or create a user — used during OTP login.
 * On first login, creates a minimal user record (no profile yet).
 */
export async function upsertUserOnLogin(params: {
  firebaseUid: string
  phone:       string
  role:        UserRole
}): Promise<{ user: DbUser; isNew: boolean }> {
  return transaction(async (client) => {
    const existing = await client.query<DbUser>(
      'SELECT * FROM users WHERE firebase_uid = $1 FOR UPDATE',
      [params.firebaseUid]
    )

    if (existing.rows.length > 0) {
      return { user: existing.rows[0], isNew: false }
    }

    const encPhone = encryptPII(params.phone)
    const inserted = await client.query<DbUser>(
      `INSERT INTO users (firebase_uid, phone, role)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [params.firebaseUid, encPhone, params.role]
    )
    return { user: inserted.rows[0], isNew: true }
  })
}

/**
 * Check if a user has an active or trialing subscription.
 * Returns true if subscription is active, false otherwise.
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const rows = await query<{ status: string }>(
    `SELECT status FROM subscriptions
     WHERE user_id = $1
       AND status IN ('active', 'trialing')
       AND (current_period_end IS NULL OR current_period_end > NOW())
       AND (trial_ends_at IS NULL OR trial_ends_at > NOW())
     LIMIT 1`,
    [userId]
  )
  return rows.length > 0
}

/**
 * Safe user object for API responses — omits encrypted phone.
 */
export function toPublicUser(user: DbUser) {
  const { phone: _phone, ...rest } = user
  void _phone
  return rest
}
