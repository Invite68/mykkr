/**
 * env-check.ts — startup environment variable validation.
 *
 * Call this once at app startup (in middleware or instrumentation.ts).
 * Throws with a clear message listing ALL missing vars so they can be fixed in one go.
 *
 * Security note: NEVER log the values, only the names.
 */

type EnvSpec = {
  name: string
  description: string
  minLength?: number
}

// Server-side required vars
const REQUIRED_SERVER_VARS: EnvSpec[] = [
  { name: 'DATABASE_URL',                description: 'PostgreSQL connection string',           minLength: 20 },
  { name: 'STREAM_TOKEN_SECRET',         description: 'HMAC secret for SSE stream tokens',      minLength: 32 },
  { name: 'ENCRYPTION_KEY',             description: 'AES-256-GCM key for PII (hex 64 chars)', minLength: 64 },
  { name: 'FIREBASE_ADMIN_PROJECT_ID',  description: 'Firebase Admin SDK project ID'                           },
  { name: 'FIREBASE_ADMIN_CLIENT_EMAIL',description: 'Firebase Admin SDK client email'                        },
  { name: 'FIREBASE_ADMIN_PRIVATE_KEY', description: 'Firebase Admin SDK private key',          minLength: 100 },
]

// Public vars (NEXT_PUBLIC_ prefix) that must exist at build time
const REQUIRED_PUBLIC_VARS: EnvSpec[] = [
  { name: 'NEXT_PUBLIC_FIREBASE_API_KEY',              description: 'Firebase Web API Key'             },
  { name: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',          description: 'Firebase Auth Domain'             },
  { name: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID',           description: 'Firebase Project ID'              },
  { name: 'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',  description: 'Firebase Messaging Sender ID'    },
  { name: 'NEXT_PUBLIC_FIREBASE_APP_ID',               description: 'Firebase App ID'                  },
]

// Vars that must NOT exist in production (safety check)
const BANNED_IN_PRODUCTION: string[] = [
  'DEMO_ENABLED',
]

type CheckResult = {
  ok: boolean
  missing: string[]
  tooShort: string[]
  bannedPresent: string[]
  warnings: string[]
}

export function checkEnvVars(): CheckResult {
  const missing:       string[] = []
  const tooShort:      string[] = []
  const bannedPresent: string[] = []
  const warnings:      string[] = []

  const isProd = process.env.NODE_ENV === 'production'

  // Server-side required
  for (const spec of REQUIRED_SERVER_VARS) {
    const value = process.env[spec.name]
    if (!value) {
      missing.push(`${spec.name} (${spec.description})`)
    } else if (spec.minLength && value.length < spec.minLength) {
      tooShort.push(`${spec.name} — expected ≥ ${spec.minLength} chars, got ${value.length}`)
    }
  }

  // Public vars — only warn in production (they're needed at build time, not runtime)
  if (isProd) {
    for (const spec of REQUIRED_PUBLIC_VARS) {
      const value = process.env[spec.name]
      if (!value) {
        warnings.push(`${spec.name} (${spec.description}) — may have been inlined at build time`)
      }
    }
  }

  // Banned in production
  if (isProd) {
    for (const name of BANNED_IN_PRODUCTION) {
      if (process.env[name]) {
        bannedPresent.push(name)
      }
    }
  }

  const ok = missing.length === 0 && tooShort.length === 0 && bannedPresent.length === 0

  return { ok, missing, tooShort, bannedPresent, warnings }
}

/**
 * assertEnvVars — throws if any required env vars are missing.
 * Call from instrumentation.ts or the startup of any API route.
 */
export function assertEnvVars(): void {
  const result = checkEnvVars()

  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      console.warn(`[env-check] WARN: ${w}`)
    }
  }

  if (!result.ok) {
    const lines: string[] = ['[env-check] FATAL: Missing or invalid environment variables:']
    if (result.missing.length > 0) {
      lines.push('  MISSING:')
      result.missing.forEach(m => lines.push(`    - ${m}`))
    }
    if (result.tooShort.length > 0) {
      lines.push('  TOO SHORT / INVALID:')
      result.tooShort.forEach(m => lines.push(`    - ${m}`))
    }
    if (result.bannedPresent.length > 0) {
      lines.push('  BANNED IN PRODUCTION (remove these):')
      result.bannedPresent.forEach(m => lines.push(`    - ${m}`))
    }
    const msg = lines.join('\n')
    console.error(msg)
    throw new Error(msg)
  }
}
