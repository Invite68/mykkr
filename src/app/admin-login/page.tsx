/**
 * /admin-login — Admin sign-in page
 *
 * Redirects here when someone tries to access /admin/* without
 * a valid admin session cookie.
 */

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Login — My KKR',
  robots: 'noindex,nofollow',
}

export default function AdminLoginPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f0f4f8', padding: 16,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 32px',
        boxShadow: '0 4px 32px rgba(0,0,0,.1)', maxWidth: 380, width: '100%',
        textAlign: 'center',
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: '#12343b',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: '#e1b382', fontWeight: 900, fontSize: 18,
        }}>
          MK
        </div>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 6px', color: '#12343b' }}>
          Admin Access
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 28px' }}>
          Sign in with your admin account to access the platform dashboard.
        </p>

        <div style={{
          background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
          padding: '12px 16px', marginBottom: 24, textAlign: 'left',
        }}>
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600, marginBottom: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 4 }}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Admin authentication
          </div>
          <p style={{ fontSize: 12, color: '#92400e', margin: 0 }}>
            Admin sign-in will be active once Firebase Phone Auth is configured and your account is set to role = admin in the database.
          </p>
        </div>

        <a href="/" style={{
          display: 'block', padding: '12px 24px', background: '#12343b', color: '#fff',
          borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none',
          textAlign: 'center',
        }}>
          Return to home
        </a>
      </div>
    </main>
  )
}
