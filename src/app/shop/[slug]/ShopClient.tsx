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
        fontSize: 48, userSelect: 'none',
      }}>
        🛍️
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
      <div style={{ fontSize: 52, marginBottom: 12 }}>🔒</div>
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
            <div style={{ fontSize: 44, lineHeight: 1 }}>{business.emoji}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{business.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <Stars rating={business.rating} />
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>{business.rating.toFixed(1)} · {business.reviews} reviews</span>
                {business.verified && <span style={{ background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '2px 8px' }}>✓ Verified</span>}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginTop: 4 }}>
                📍 {business.area}, Kurukshetra · {business.hours}
              </div>
            </div>

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <button onClick={copyLink} title="Copy shop link" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                {copied ? '✓ Copied!' : '🔗 Share'}
              </button>
              <button onClick={whatsappShare} title="Share on WhatsApp" style={{ background: '#25d366', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                📲 WhatsApp
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
              🛒 Cart
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
              <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--night-d)', margin: 0 }}>🛒 Your order</h2>
              <button onClick={() => setShowCart(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text-3)', padding: '2px 6px' }}>✕</button>
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
                📲 Send Order via WhatsApp
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
                <div style={{ fontSize: 32 }}>🔍</div>
                <p>No products match "{search}"</p>
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
          <div style={{ fontSize: 11, maxWidth: 400, margin: '0 auto', lineHeight: 1.5 }}>
            ⚖️ All orders and payments are directly between customer and business. My KKR is only a connector.
          </div>
        </div>
      </div>
    </div>
  )
}
