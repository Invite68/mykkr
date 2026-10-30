/**
 * firebase-client.ts
 *
 * Client-side Firebase initialiser — safe to import from client components.
 * Uses NEXT_PUBLIC_ env vars (public config values, rate-limited by Firebase to
 * authorised domains only).
 *
 * NEVER import firebase-admin here. NEVER put secrets in NEXT_PUBLIC_ vars.
 *
 * Usage:
 *   import { firebaseApp, getFirebaseAuth } from '@/lib/firebase-client'
 *   import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
 *
 * IMPORTANT: Use getFirebaseAuth() (lazy) instead of a top-level firebaseAuth
 * export to avoid SSR/build-time errors when env vars are not set.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
}

// Singleton — safe to call multiple times (Next.js hot-reload safe)
export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

/**
 * Lazy auth getter — call this inside event handlers or useEffect, never at
 * module top-level. Avoids "auth/invalid-api-key" during SSR/build prerender.
 */
let _auth: Auth | null = null
export function getFirebaseAuth(): Auth {
  if (!_auth) _auth = getAuth(firebaseApp)
  return _auth
}

/**
 * @deprecated Use getFirebaseAuth() instead to avoid SSR errors.
 * Kept only for gradual migration — do not use in new code.
 */
export const firebaseAuth: Auth = (typeof window !== 'undefined')
  ? getAuth(firebaseApp)
  : ({} as Auth)  // empty placeholder during SSR; only Auth methods used in useEffect are safe
