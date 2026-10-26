/**
 * /demo-login — Temporary test accounts for pre-launch review.
 *
 * Lets you experience the app exactly as a real Business Owner or Customer
 * would. Sets a demo cookie so every page knows who "you" are.
 *
 * REMOVE THIS ROUTE before going live — it bypasses real auth.
 * Guarded by NEXT_PUBLIC_DEMO_ENABLED=true (not set in production).
 */

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Demo Login — My KKR', robots: 'noindex,nofollow' }

// ── Demo account profiles ──────────────────────────────────────────────────

const ACCOUNTS = [
  {
    role: 'business',
    name: 'Sharma Kirana Store',
    person: 'Ramesh Sharma',
    phone: '+91 98765 43210',
    plan: 'Business Plan — Active',
    planColor: '#16a34a',
    area: 'Thanesar, Kurukshetra',
    desc: 'Experience the platform as a local grocery shop owner — manage orders, check bookings, set hours, and see your public shop page.',
    avatar: 'RS',
    avatarBg: '#12343b',
    href: '/dashboard/business',
    secondaryHref: '/business/sharma-kirana-store',
    secondaryLabel: 'View public shop page',
    bullets: [
      '3 pending bookings waiting for confirmation',
      '2 orders need a driver assigned',
      'Shop shows as Open now (Mon–Sat 9 am–6 pm)',
      'Public profile live at /business/sharma-kirana-store',
    ],
  },
  {
    role: 'customer',
    name: 'Priya Mehta',
    person: 'Priya Mehta',
    phone: '+91 91234 56789',
    plan: 'Free Trial — 7 days left',
    planColor: '#d97706',
    area: 'Pipli, Kurukshetra',
    desc: 'Experience the platform as a local customer — track active orders, browse businesses, book a service, or post a requirement.',
    avatar: 'PM',
    avatarBg: '#0f766e',
    href: '/dashboard/customer',
    secondaryHref: '/categories',
    secondaryLabel: 'Browse businesses',
    bullets: [
      '1 grocery order out for delivery right now',
      '1 painting booking confirmed for tomorrow 10am',
      'Past orders from 3 local businesses',
      '7 days free — no card needed',
    ],
  },
] as const

// ── Page ──────────────────────────────────────────────────────────────────

export default function DemoLoginPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px 64px' }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#fef3c7', color: '#92400e',
          border: '1px solid #fde68a', borderRadius: 6,
          fontSize: 12, fontWeight: 700, padding: '4px 10px', marginBottom: 14,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Pre-launch review only — not live to public
        </div>
        <h1 className="page-title">Test the app as a real user</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          Pick an account below to explore the full experience — exactly what a real business owner or customer would see and do.
        </p>
      </div>

      {/* Account cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {ACCOUNTS.map((a) => (
          <div key={a.role} className="panel" style={{ padding: 0, overflow: 'hidden' }}>

            {/* Card header */}
            <div style={{
              display: 'flex', gap: 14, alignItems: 'flex-start',
              padding: '20px 20px 16px', borderBottom: '1px solid var(--border)',
            }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: a.avatarBg, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, fontWeight: 800, letterSpacing: 0.5,
              }}>
                {a.avatar}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{a.name}</div>
                    <div className="muted" style={{ fontSize: 13 }}>{a.person} · {a.phone}</div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 99,
                    background: a.planColor + '18', color: a.planColor,
                    border: `1px solid ${a.planColor}44`, whiteSpace: 'nowrap',
                  }}>{a.plan}</span>
                </div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: 3 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {a.area}
                </div>
              </div>
            </div>

            {/* Description + what you'll see */}
            <div style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>{a.desc}</p>
              <ul style={{ margin: 0, padding: '0 0 0 18px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                {a.bullets.map((b) => (
                  <li key={b} style={{ fontSize: 12, color: 'var(--text-2)' }}>{b}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex', gap: 10, padding: '14px 20px',
              borderTop: '1px solid var(--border)', background: 'var(--bg-2)',
              flexWrap: 'wrap',
            }}>
              <Link href={a.href} className="btn btn-primary" style={{ fontSize: 14 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Open {a.role === 'business' ? 'Business' : 'Customer'} dashboard
              </Link>
              <Link href={a.secondaryHref} className="btn btn-outline" style={{ fontSize: 14 }}>
                {a.secondaryLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Other areas to test */}
      <div className="panel" style={{ marginTop: 24 }}>
        <h2 className="panel-title">Other areas worth testing</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Browse all categories',     href: '/categories',                  desc: 'How customers find businesses'          },
            { label: 'Business public page',       href: '/business/sharma-kirana-store', desc: 'What a customer sees when they click through' },
            { label: 'Shop product listing',       href: '/shop/sharma-kirana-store',     desc: 'Goods browsing and cart flow'           },
            { label: 'Services / booking flow',    href: '/find-book',                   desc: 'Date picker, time slots, booking form'  },
            { label: 'Post a requirement',         href: '/post',                         desc: 'Customer posts a task, businesses bid'  },
            { label: 'Request a ride',             href: '/rides',                        desc: 'Taxi / delivery request form'           },
            { label: 'Track an order',             href: '/track/KKR-7Q2M',              desc: 'Live order tracking page'               },
            { label: 'Pricing page',               href: '/pricing',                      desc: 'What customers & businesses pay'        },
            { label: 'Registration form',          href: '/register',                     desc: 'New user onboarding flow'               },
            { label: 'Driver dashboard',           href: '/dashboard/driver',             desc: 'Live job board for delivery partners'   },
          ].map(({ label, href, desc }) => (
            <Link key={href} href={href} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
              border: '1px solid var(--border)', background: 'var(--bg-1)',
              gap: 8,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--night-d)' }}>{label}</div>
                <div className="muted" style={{ fontSize: 11 }}>{desc}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6"/></svg>
            </Link>
          ))}
        </div>
      </div>

      {/* Note */}
      <p className="muted" style={{ fontSize: 12, marginTop: 20, textAlign: 'center' }}>
        All data shown is sample preview data. Real orders and profiles appear after sign-in is connected.
        <br />This page is not indexed by search engines and will be removed before public launch.
      </p>
    </main>
  )
}
