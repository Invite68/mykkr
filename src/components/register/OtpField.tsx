'use client'

import { useEffect, useState } from 'react'
import { isValidIndianMobile } from '@/lib/sanitize'

/**
 * Phone + OTP input. Firebase phone auth is not wired yet (NestJS backend
 * pending), so "Send OTP" validates the number and shows the code field.
 * Replace `sendOtp` with Firebase `signInWithPhoneNumber` + Turnstile.
 */
export default function OtpField({
  id,
  label,
  phone,
  onPhone,
  otp,
  onOtp,
}: {
  id: string
  label: string
  phone: string
  onPhone: (v: string) => void
  otp: string
  onOtp: (v: string) => void
}) {
  const [sent, setSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  function sendOtp() {
    if (!isValidIndianMobile(phone)) {
      setMsg('Enter a valid 10-digit Indian mobile number.')
      return
    }
    setSent(true)
    setCooldown(60)
    setMsg('OTP sent. Valid for 60 seconds.')
  }

  return (
    <div className="field">
      <label className="label" htmlFor={id}>{label}</label>
      <div className="inline-group">
        <input id={id} className="input" type="tel" maxLength={15} placeholder="98765 43210" value={phone} onChange={(e) => onPhone(e.target.value)} autoComplete="tel" />
        <button type="button" className="btn btn-outline btn-sm" onClick={sendOtp} disabled={cooldown > 0}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : sent ? 'Resend OTP' : 'Send OTP'}
        </button>
      </div>
      {sent && (
        <input
          className="input"
          aria-label="6-digit OTP"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => onOtp(e.target.value.replace(/\D/g, ''))}
          style={{ letterSpacing: 6, textAlign: 'center' }}
        />
      )}
      {msg && <span className="muted" role="status">{msg}</span>}
    </div>
  )
}
