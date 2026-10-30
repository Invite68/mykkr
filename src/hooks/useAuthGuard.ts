'use client'

/**
 * useAuthGuard — redirects unauthenticated users to /register.
 *
 * Call at the top of any dashboard page. On mount, checks Firebase Auth state.
 * If no user is found within the grace period, redirects to /register?next=<current-path>.
 *
 * Returns { uid, idToken, loading } for use by the page.
 */

import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useRouter, usePathname } from 'next/navigation'

interface AuthState {
  uid: string | null
  idToken: string | null
  loading: boolean
}

export function useAuthGuard(): AuthState {
  const router   = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<AuthState>({ uid: null, idToken: null, loading: true })

  useEffect(() => {
    const auth = getAuth()
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // Not signed in — redirect to register with next param
        const next = encodeURIComponent(pathname ?? '/dashboard')
        router.replace(`/register?next=${next}`)
        return
      }
      try {
        const idToken = await user.getIdToken()
        setState({ uid: user.uid, idToken, loading: false })
      } catch {
        // Token fetch failed — treat as unauthenticated
        const next = encodeURIComponent(pathname ?? '/dashboard')
        router.replace(`/register?next=${next}`)
      }
    })
    return unsub
  }, [router, pathname])

  return state
}
