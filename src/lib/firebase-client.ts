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
 *   import { firebaseApp, firebaseAuth } from '@/lib/firebase-client'
 *   import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

// Singleton — safe to call multiple times (Next.js hot-reload safe)
export const firebaseApp: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)

export const firebaseAuth: Auth = getAuth(firebaseApp)
