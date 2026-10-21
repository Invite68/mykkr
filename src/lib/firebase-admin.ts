/**
 * Firebase Admin SDK — server-side only.
 *
 * Used to verify Firebase ID tokens sent from the client.
 * Never import this in Client Components.
 *
 * Required env vars (set in Coolify → Environment Variables):
 *   FIREBASE_PROJECT_ID       — from Firebase console
 *   FIREBASE_CLIENT_EMAIL     — service account email
 *   FIREBASE_PRIVATE_KEY      — service account private key (newlines as \n)
 *
 * Token flow:
 *   1. Client calls signInWithPhoneNumber → gets Firebase ID token
 *   2. Client sends token in Authorization: Bearer <token> header
 *   3. Server calls verifyIdToken() → gets uid, phone_number
 *   4. Server uses uid to look up / create user in our DB
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth }                       from 'firebase-admin/auth'

function initFirebaseAdmin() {
  if (getApps().length > 0) return

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Missing Firebase Admin env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
    )
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
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
  const decoded = await getAuth().verifyIdToken(token)

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
