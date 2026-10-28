/**
 * Firebase Admin SDK — server-side helpers for Server Components.
 *
 * This exports the adminAuth object directly for use in Server Components
 * (layout, page, auth-guard) that need to verify session cookies.
 *
 * Do NOT import this in Client Components or API routes that use requireAuth().
 */

import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth }                       from 'firebase-admin/auth'

function initFirebaseAdmin() {
  if (getApps().length > 0) return

  const projectId   = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    // In dev without Firebase configured, return a stub
    if (process.env.NODE_ENV !== 'production') return
    throw new Error('Missing Firebase Admin env vars')
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  })
}

function getAdminAuth() {
  initFirebaseAdmin()
  return getAuth()
}

// Lazy singleton
let _adminAuth: ReturnType<typeof getAuth> | null = null

export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop) {
    if (!_adminAuth) _adminAuth = getAdminAuth()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (_adminAuth as unknown as Record<string | symbol, unknown>)[prop]
  },
})
