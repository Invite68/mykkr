/**
 * Firebase Admin SDK — server-side only.
 *
 * Used to verify Firebase ID tokens sent from the client.
 * Never import this in Client Components.
 *
 * Required env vars (set in Coolify → Environment Variables):
 *   FIREBASE_ADMIN_PROJECT_ID   — from Firebase console
 *   FIREBASE_ADMIN_CLIENT_EMAIL — service account email
 *   FIREBASE_ADMIN_PRIVATE_KEY  — service account private key (newlines as \n)
 *
 * Token flow:
 *   1. Client calls signInWithPhoneNumber → gets Firebase ID token
 *   2. Client sends token in Authorization: Bearer <token> header
 *   3. Server calls verifyIdToken() → gets uid, phone_number
 *   4. Server uses uid to look up / create user in our DB
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth, type Auth }            from 'firebase-admin/auth'

function initFirebaseAdmin() {
  if (getApps().length > 0) return

  // Support both naming conventions (FIREBASE_ADMIN_* preferred, FIREBASE_* legacy)
  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID   ?? process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL ?? process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = (process.env.FIREBASE_ADMIN_PRIVATE_KEY ?? process.env.FIREBASE_PRIVATE_KEY)
                        ?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    )
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

/**
 * Returns the Firebase Admin Auth instance (initialising the app first if needed).
 * Use this for session cookie creation / verification.
 */
export function getAdminAuth(): Auth {
  initFirebaseAdmin()
  return getAuth()
}

/**
 * Verify a Firebase ID token from the Authorization header.
 * Returns { uid, phone } or throws on invalid/expired token.
 */
export async function verifyFirebaseToken(
  authHeader: string | null
): Promise<{ uid: string; phone: string }> {
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or malformed Authorization header')
  }

  const token = authHeader.slice(7)
  if (!token) throw new Error('Empty token')

  initFirebaseAdmin()
  const decoded = await getAdminAuth().verifyIdToken(token)

  if (!decoded.uid) throw new Error('Token missing uid')
  if (!decoded.phone_number) throw new Error('Token missing phone_number')

  return {
    uid:   decoded.uid,
    phone: decoded.phone_number,
  }
}

/**
 * Auth middleware helper — use in any API route that requires login.
 *
 * Usage:
 *   const auth = await requireAuth(req)
 *   // auth.uid, auth.phone are now available
 */
export async function requireAuth(req: Request): Promise<{ uid: string; phone: string }> {
  const authHeader = req.headers.get('authorization')
  return verifyFirebaseToken(authHeader)
}
