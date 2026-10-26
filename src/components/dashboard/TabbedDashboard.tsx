'use client'

/**
 * TabbedDashboard — reusable profile-card + sticky-tabs layout.
 * Matches the /business/[slug] page structure.
 * Used by CustomerDash and DriverDash.
 */

import { useState } from 'react'

export interface DashTab {
  id:    string
  label: string
  icon?: React.ReactNode
  panel: React.ReactNode
}

interface Props {
  /** Teal cover gradient — same palette as business profile */
  gradient?: string
  /** Avatar icon (SVG) shown in the circular logo */
  avatar: React.ReactNode
  /** Large name */
  name: string
  /** One-line role/status pill text */
  rolePill: string
  /** Optional second meta line (e.g. "Trial — 7 days remaining") */
  meta?: React.ReactNode
  /** Badges row below the white card (e.g. subscription status) */
  badges?: React.ReactNode
  /** The tabs */
  tabs: DashTab[]
  /** Which tab is active by default */
  defaultTab?: string
}

const C = {
  teal:   '#12343b',
  gold:   '#e1b382',
  goldBg: 'rgba(225,179,130,.12)',
}

export default function TabbedDashboard({
  gradient = 'linear-gradient(135deg, #12343b 0%, #1a4a54 60%, #0e3540 100%)',
  avatar,
  name,
  rolePill,
  meta,
  badges,
  tabs,
  defaultTab,
}: Props) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '')

  const panel = tabs.find((t) => t.id === active)?.panel ?? null

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 60 }}>

      {/* ── Cover ──────────────────────────────────────────────────────── */}
      <div style={{
        background: gradient,
        height: 120,
        position: 'relative',
      }} />

      {/* ── White overlap card ─────────────────────────────────────────── */}
      <div style={{
        margin: '0 12px',
        background: '#fff',
        borderRadius: 16,
        marginTop: -28,
        padding: '14px 16px 16px',
        boxShadow: '0 2px 16px rgba(0,0,0,.10)',
        position: 'relative',
      }}>
        {/* Row 1: avatar + name + pill */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Circular avatar lifted above card edge */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            border: '3px solid #fff',
            background: C.teal,
            marginTop: -38,
            flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,.18)',
          }}>
            {avatar}
          </div>

          {/* Name + role pill */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', margin: '0 0 5px', lineHeight: 1.2 }}>
              {name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span style={{
                background: C.goldBg, color: C.teal,
                fontSize: 12, fontWeight: 700,
                borderRadius: 20, padding: '3px 10px',
                border: `1px solid ${C.gold}55`,
              }}>
                {rolePill}
              </span>
              {meta && (
                <span style={{ fontSize: 12, color: '#64748b' }}>{meta}</span>
              )}
            </div>
          </div>
        </div>

        {/* Badges row */}
        {badges && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {badges}
          </div>
        )}
      </div>

      {/* ── Sticky tab bar ────────────────────────────────────────────────── */}
      <div style={{
        position: 'sticky', top: 56, zIndex: 40,
        background: 'var(--surface)',
        borderBottom: '1.5px solid var(--border)',
        marginTop: 0,
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        <div style={{
          display: 'flex',
          minWidth: 'max-content',
          padding: '0 16px',
        }}>
          {tabs.map((t) => {
            const isActive = t.id === active
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '13px 14px 11px',
                  fontSize: 13, fontWeight: isActive ? 800 : 500,
                  color: isActive ? C.teal : '#64748b',
                  borderBottom: isActive ? `2.5px solid ${C.teal}` : '2.5px solid transparent',
                  display: 'flex', alignItems: 'center', gap: 6,
                  whiteSpace: 'nowrap',
                  transition: 'color .15s',
                }}
              >
                {t.icon && <span style={{ opacity: isActive ? 1 : 0.55 }}>{t.icon}</span>}
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab panel ──────────────────────────────────────────────────────── */}
      <div style={{ padding: '20px 14px 0' }}>
        {panel}
      </div>
    </div>
  )
}
