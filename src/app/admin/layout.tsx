'use client'

/**
 * Admin panel layout — sidebar + main content area.
 * Protected: redirects to /register if not logged in as admin.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth'
import { firebaseApp } from '@/lib/firebase-client'

const NAV = [
  { href: '/admin/dashboard',    label: '📊 Dashboard'      },
  { href: '/admin/users',        label: '👥 Users'           },
  { href: '/admin/businesses',   label: '🏪 Businesses'      },
  { href: '/admin/subscriptions',label: '💳 Subscriptions'   },
  { href: '/admin/jobs',         label: '🚗 Jobs'            },
  { href: '/admin/fare-rates',   label: '💰 Fare Rates'      },
  { href: '/admin/audit',        label: '📋 Audit Log'       },
  { href: '/admin/system',       label: '⚙️  System'         },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser]     = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const auth = getAuth(firebaseApp)
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Verify admin role via API
        const token = await u.getIdToken()
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` },
        })
        setIsAdmin(res.status !== 403)
      } else {
        setIsAdmin(false)
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading…</p>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <h2>Admin access required</h2>
        <Link href="/register" className="btn btn-primary">Back to app</Link>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <nav style={{
        width: 220, background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', padding: '24px 0', flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, fontSize: 18 }}>MyKKR Admin</span>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Platform control</div>
        </div>
        {NAV.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: 'block',
              padding: '10px 20px',
              color: pathname === href ? 'var(--primary)' : 'var(--text)',
              background: pathname === href ? 'var(--primary-faint, #f0f4ff)' : 'transparent',
              borderLeft: pathname === href ? '3px solid var(--primary)' : '3px solid transparent',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: pathname === href ? 600 : 400,
            }}
          >
            {label}
          </Link>
        ))}
        <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)' }}>
          {user.phoneNumber ?? user.email}
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, padding: '32px 28px', overflowY: 'auto', maxWidth: 1200 }}>
        {children}
      </main>
    </div>
  )
}
