'use client'

/**
 * ShopClient — interactive layer for the /shop/[slug] storefront.
 *
 * Cart state lives in localStorage (per-device, ephemeral — no checkout flow
 * on platform; customer WhatsApps the order to the business directly).
 *
 * Subscription gate: if `subscriptionActive === false`, a full-bleed paywall
 * overlay is rendered on the server via the parent RSC and passed as a prop.
 * This component never renders product details when the flag is false.
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Business, Listing } from '@/data/businesses'
import { Stars } from '@/components/business/BusinessCard'

// ── Types ─────────────────────────────────────────────────────────────────────
interface CartItem { listing: Listing; qty: number }

interface Props {
  business: Business
  listings: Listing[]
  subscriptionActive: boolean
  maxListings: number
}

// ── Cart helpers ──────────────────────────────────────────────────────────────
function buildWhatsAppMessage(business: Business, cart: CartItem[]): string {
  const lines = cart.map((i) => `• ${i.listing.name} ×${i.qty} — ${i.listing.price}`)
  const body = [
    `Hi ${business.name}! I'd like to order:`,
    '',
    ...lines,
    '',
    `(Order placed via My KKR — mykkr.in/shop/${business.slug})`,
  ].join('\n')
  return `https://wa.me/?text=${encodeURIComponent(body)}`
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({
  listing, qty, onAdd, onRemove,
}: {
  listing: Listing
  qty: number
  onAdd: () => void
  onRemove: () => void
}) {
  return (
    <div style={{
      border: '1.5px solid var(--border)', borderRadius: 12, overflow: 'hidden',
      background: 'var(--surface)', transition: 'box-shadow .15s',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Product image placeholder */}
      <div style={{
        height: 130, background: 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        userSelect: 'none',
      }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.22 }}>
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 0 1-8 0"/>
        </svg>
      </div>

      <div style={{ padding: '12px 12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--night-d)', lineHeight: 1.3 }}>{listing.name}</div>
        {listing.note && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{listing.note}</div>}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--night)' }}>{listing.price}</span>

          {qty === 0 ? (
            <button
              onClick={onAdd}
              style={{
                background: '#12343b', color: '#fff', border: 'none',
                borderRadius: 8, padding: '6px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              + Add
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={onRemove} style={{ width: 30, height: 30, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--night-d)' }}>−</button>
              <span style={{ width: 24, textAlign: 'center', fontWeight: 700, fontSize: 14 }}>{qty}</span>
              <button onClick={onAdd}    style={{ width: 30, height: 30, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: 'var(--night-d)' }}>+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Paywall overlay ───────────────────────────────────────────────────────────
function PaywallOverlay({ business }: { business: Business }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 10,
      background: 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center', borderRadius: 16,
    }}>
      <div style={{ marginBottom: 12, color: 'var(--night-d)' }}>
        <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: 'var(--night-d)', marginBottom: 8 }}>
        Shop temporarily unavailable
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-2)', maxWidth: 320, lineHeight: 1.6, marginBottom: 20 }}>
        <strong>{business.name}</strong>'s My KKR subscription is inactive.
        All listings are hidden until the business renews their monthly plan.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href={`/business/${business.slug}`} className="btn btn-outline btn-sm">
          View Business Profile
        </Link>
        <Link href="/pricing" className="btn btn-primary btn-sm">
          My KKR Plans
        </Link>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 16, maxWidth: 280 }}>
        Are you the business owner? <Link href="/dashboard/business" style={{ color: 'var(--night)', fontWeight: 700 }}>Renew your subscription →</Link>
      </p>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ShopClient({ business, listings, subscriptionActive, maxListings }: Props) {
  const [cart,    setCart   ] = useState<CartItem[]>([])
  const [search,  setSearch ] = useState('')
  const [showCart, setShowCart] = useState(false)
  const [copied,  setCopied ] = useState(false)

  // Restore cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`cart_${business.slug}`)
      if (saved) setCart(JSON.parse(saved) as CartItem[])
    } catch { /* ignore */ }
  }, [business.slug])

  // Persist cart to localStorage
  useEffect(() => {
    try { localStorage.setItem(`cart_${business.slug}`, JSON.stringify(cart)) }
    catch { /* ignore */ }
  }, [cart, business.slug])

  const getQty = (name: string) => cart.find((c) => c.listing.name === name)?.qty ?? 0

  const addItem = useCallback((listing: Listing) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.listing.name === listing.name)
      if (existing) return prev.map((c) => c.listing.name === listing.name ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { listing, qty: 1 }]
    })
  }, [])

  const removeItem = useCallback((listing: Listing) => {
    setCart((prev) =>
      prev
        .map((c) => c.listing.name === listing.name ? { ...c, qty: c.qty - 1 } : c)
        .filter((c) => c.qty > 0)
    )
  }, [])

  const clearCart = () => {
    setCart([])
    try { localStorage.removeItem(`cart_${business.slug}`) } catch { /* ignore */ }
  }

  const totalItems = cart.reduce((s, c) => s + c.qty, 0)

  const filteredListings = listings.filter((l) =>
    search ? l.name.toLowerCase().includes(search.toLowerCase()) : true
  )

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://mykkr.in/shop/${business.slug}`

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch { /* ignore */ }
  }

  const whatsappShare = () => {
    const msg = `Check out ${business.name} on My KKR!\n${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 60px' }}>

      {/* ── Shop header ──────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #12343b 0%, #1e5f6e 100%)',
        padding: '24px 20px 20px', marginBottom: 0,
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Back link */}
          <div style={{ marginBottom: 14 }}>
            <a href={`/business/${business.slug}`} style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
              ← Back to profile
            </a>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div style={{ width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'rgba(255,255,255,.85)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{business.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Stars rating={business.rating} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>{business.rating.toFixed(1)} · {business.reviews} reviews</span>
                {business.verified && <span style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: 4 }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Verified</span>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {business.area}, Kurukshetra · {business.hours}
              </div>
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={copyLink} title="Copy shop link" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                {copied
                  ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
                  : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> Share</>
                }
              </button>
              <button onClick={whatsappShare} title="Share on WhatsApp" style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.5 2a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 17a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>
                WhatsApp
              </button>
            </div>
          </div>

          {/* Subscription status banner */}
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: subscriptionActive ? '#4ade80' : '#f87171', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: subscriptionActive ? '#bbf7d0' : '#fecaca', fontWeight: 600 }}>
              {subscriptionActive
                ? `Subscription active · Up to ${maxListings} products`
                : 'Subscription inactive — listings hidden'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Search + cart bar ─────────────────────────────────────────── */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '12px 16px', position: 'sticky', top: 56, zIndex: 50 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="search"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid var(--border)', background: 'var(--bg)', fontSize: 13, color: 'var(--night-d)' }}
          />
          {totalItems > 0 && (
            <button
              onClick={() => setShowCart(!showCart)}
              style={{
                background: '#12343b', color: '#fff', border: 'none', borderRadius: 8,
                padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Cart
              <span style={{ background: '#f59e0b', color: '#78350f', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900 }}>
                {totalItems}
              </span>
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px', position: 'relative' }}>

        {/* ── Cart panel ──────────────────────────────────────────────── */}
        {showCart && totalItems > 0 && (
          <div className="panel" style={{ marginBottom: 20, border: '2px solid #12343b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--night-d)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                Your order
              </h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '4px 6px', display: 'flex', alignItems: 'center' }} aria-label="Close cart"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
            </div>

            {cart.map((item) => (
              <div key={item.listing.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{item.listing.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{item.listing.price} × {item.qty}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                  <button onClick={() => removeItem(item.listing)} style={{ width: 28, height: 28, background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', color: 'var(--night-d)' }}>−</button>
                  <span style={{ width: 22, textAlign: 'center', fontWeight: 700, fontSize: 13 }}>{item.qty}</span>
                  <button onClick={() => addItem(item.listing)}    style={{ width: 28, height: 28, background: 'none', border: 'none', fontSize: 15, cursor: 'pointer', color: 'var(--night-d)' }}>+</button>
                </div>
              </div>
            ))}

            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              <a
                href={buildWhatsAppMessage(business, cart)}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-accent btn-block"
                style={{ display: 'block', textAlign: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.5 2a9.5 9.5 0 1 0 0 19 9.5 9.5 0 0 0 0-19zm0 17a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>
                Send Order via WhatsApp
              </a>
              <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', margin: 0 }}>
                Your order will be sent to the business on WhatsApp. Pay directly — My KKR takes ₹0 commission.
              </p>
              <button onClick={clearCart} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                Clear cart
              </button>
            </div>
          </div>
        )}

        {/* ── Product grid with paywall ────────────────────────────────── */}
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 14,
            // Blur listings behind the paywall so layout is preserved but unreadable
            filter: !subscriptionActive ? 'blur(6px)' : 'none',
            pointerEvents: !subscriptionActive ? 'none' : 'all',
            userSelect: !subscriptionActive ? 'none' : 'auto',
          }}>
            {filteredListings.length === 0 && subscriptionActive ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>No products match &ldquo;{search}&rdquo;</p>
              </div>
            ) : (
              filteredListings.map((listing) => (
                <ProductCard
                  key={listing.name}
                  listing={listing}
                  qty={getQty(listing.name)}
                  onAdd={() => addItem(listing)}
                  onRemove={() => removeItem(listing)}
                />
              ))
            )}
          </div>

          {/* Paywall overlay — server-rendered via prop, cannot be removed by JS */}
          {!subscriptionActive && <PaywallOverlay business={business} />}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginTop: 32, fontSize: 12, color: 'var(--text-3)' }}>
          <div style={{ marginBottom: 6 }}>
            Powered by{' '}
            <a href="/" style={{ color: 'var(--night)', fontWeight: 800 }}>My KKR</a>
            {' '}· ₹99/mo business subscription · Zero commission platform
          </div>
          <div style={{ fontSize: 11, maxWidth: 400, margin: '0 auto', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 5, justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            All orders and payments are directly between customer and business. My KKR is only a connector.
          </div>
        </div>
      </div>
    </div>
  )
}
