/**
 * Firebase client SDK — safe to import in Client Components.
 *
 * Required env vars (add NEXT_PUBLIC_ prefix — these are safe to expose):
 *   NEXT_PUBLIC_FIREBASE_API_KEY
 *   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   NEXT_PUBLIC_FIREBASE_APP_ID
 *
 * These are public keys used by Firebase SDK to identify your app.
 * They are NOT secret — they are safe to ship in the browser bundle.
 * The actual security is enforced by Firebase Auth rules.
 *
 * Set them in Coolify → Environment Variables.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'

const firebaseConfig = {
  apiKey:    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId:     process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialise once — safe to call multiple times
export const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
