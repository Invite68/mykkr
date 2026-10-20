/**
 * Supabase client singletons.
 *
 * Two clients:
 *   supabase        — browser/anon key (safe to import in Client Components)
 *   getAdminClient  — service_role key (SERVER ONLY — bypasses RLS)
 *
 * Environment variables (add to .env.local and Coolify):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY   ← never expose to browser
 */
import { createClient } from '@supabase/supabase-js'

const url  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? 'https://placeholder.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key'

/** Browser-safe client — use in Client Components and customer-facing pages */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(url, anon)

/** Server-only admin client — bypasses Row Level Security */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient<any>(url, serviceKey, {
    auth: { persistSession: false },
  })
}
