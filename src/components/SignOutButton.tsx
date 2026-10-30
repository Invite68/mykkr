'use client'

/**
 * SignOutButton — clears the Firebase client session + __session cookie.
 *
 * 1. Signs out of Firebase Auth (client-side)
 * 2. Calls DELETE /api/auth/session (clears the httpOnly cookie)
 * 3. Redirects to /register
 *
 * Usage:
 *   <SignOutButton />
 *   <SignOutButton label="Log out" style={{ color: 'red' }} />
 */

import { useState } from 'react'
import { getAuth, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'

interface Props {
  label?: string
  style?: React.CSSProperties
  className?: string
}

export default function SignOutButton({ label = 'Sign out', style, className }: Props) {
  const router  = useRouter()
  const [busy, setBusy] = useState(false)

  async function handleSignOut() {
    if (busy) return
    setBusy(true)
    try {
      // 1. Sign out Firebase client
      const auth = getAuth()
      await signOut(auth)

      // 2. Clear server-side session cookie
      await fetch('/api/auth/session', { method: 'DELETE' })
    } catch {
      // Best-effort — still redirect even if one step fails
    } finally {
      setBusy(false)
      router.push('/register')
    }
  }

  return (
    <button
      onClick={handleSignOut}
      disabled={busy}
      style={{
        background: 'none',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        padding: '6px 14px',
        fontSize: 13,
        cursor: busy ? 'not-allowed' : 'pointer',
        color: busy ? '#94a3b8' : '#475569',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        ...style,
      }}
      className={className}
      aria-label="Sign out"
    >
      {/* logout icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      {busy ? 'Signing out…' : label}
    </button>
  )
}
