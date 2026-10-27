'use client'
import { useState, useEffect } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

export default function AdminSettings() {
  const [toast, setToast] = useState('')

  // Maintenance mode
  const [maintenanceOn, setMaintenanceOn] = useState(false)
  const [maintenanceMsg, setMaintenanceMsg] = useState("We're performing scheduled maintenance. We'll be back shortly.")
  const [maintenanceHours, setMaintenanceHours] = useState(1)
  const [maintenanceMinutes, setMaintenanceMinutes] = useState(0)
  const [endTime, setEndTime] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState('')
  const [useCustomEnd, setUseCustomEnd] = useState(false)
  const [customEndTime, setCustomEndTime] = useState('')

  // Notifications
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [pushAlerts, setPushAlerts] = useState(true)
  const [fraudAlerts, setFraudAlerts] = useState(true)
  const [dailyDigest, setDailyDigest] = useState(false)

  // Security
  const [twoFA, setTwoFA] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState('8')
  const [ipWhitelist, setIpWhitelist] = useState('192.168.1.0/24')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function activateMaintenance() {
    let target: Date
    if (useCustomEnd && customEndTime) {
      target = new Date(customEndTime)
    } else {
      target = new Date(Date.now() + (maintenanceHours * 60 + maintenanceMinutes) * 60 * 1000)
    }
    setEndTime(target)
    setMaintenanceOn(true)
    showToast(`Maintenance mode activated — ends ${target.toLocaleTimeString()}`)
  }

  function deactivateMaintenance() {
    setMaintenanceOn(false)
    setEndTime(null)
    setCountdown('')
    showToast('Maintenance mode deactivated — platform is live')
  }

  // Live countdown
  useEffect(() => {
    if (!maintenanceOn || !endTime) return
    const interval = setInterval(() => {
      const diff = endTime.getTime() - Date.now()
      if (diff <= 0) {
        setMaintenanceOn(false)
        setEndTime(null)
        setCountdown('')
        showToast('Maintenance ended automatically')
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${h}h ${m}m ${s}s remaining`)
    }, 1000)
    return () => clearInterval(interval)
  }, [maintenanceOn, endTime])

  function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return <button onClick={onChange} style={{ width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: checked ? C.green : '#d1d5db', position: 'relative', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: 4, left: checked ? 20 : 4, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
    </button>
  }

  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 14, fontWeight: 800, color: C.teal, background: C.bg }}>{title}</div>
        <div style={{ padding: 18 }}>{children}</div>
      </div>
    )
  }

  function Row({ label, sub, children }: { label: string; sub?: string; children: React.ReactNode }) {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155' }}>{label}</div>
          {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ flexShrink: 0, marginLeft: 16 }}>{children}</div>
      </div>
    )
  }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Platform Settings</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Maintenance mode, notifications, and security configuration</p>
      </div>

      {/* Maintenance current status banner */}
      {maintenanceOn && (
        <div style={{ background: 'rgba(220,38,38,.08)', border: `1.5px solid ${C.red}`, borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 800, color: C.red, fontSize: 14 }}>MAINTENANCE MODE IS ACTIVE</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{countdown || 'Running...'}</div>
            <div style={{ fontSize: 12, color: '#334155', marginTop: 4, fontStyle: 'italic' }}>"{maintenanceMsg}"</div>
          </div>
          <button onClick={deactivateMaintenance} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            End Maintenance Now
          </button>
        </div>
      )}

      {/* Danger Zone — Maintenance */}
      <div style={{ background: C.surface, border: `1.5px solid ${C.red}40`, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '13px 18px', borderBottom: `1px solid ${C.red}30`, fontSize: 14, fontWeight: 800, color: C.red, background: 'rgba(220,38,38,.04)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Danger Zone — Maintenance Mode
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ background: 'rgba(220,38,38,.05)', border: `1px solid ${C.red}25`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.red, lineHeight: 1.5 }}>
            Enabling maintenance mode will show a message to all visitors and block access to the platform. Set the duration carefully.
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Visitor Message (shown on maintenance screen)</label>
            <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)} rows={2} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                <input type="radio" checked={!useCustomEnd} onChange={() => setUseCustomEnd(false)} /> Duration timer
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                <input type="radio" checked={useCustomEnd} onChange={() => setUseCustomEnd(true)} /> Specific end time
              </label>
            </div>

            {!useCustomEnd ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="number" min={0} max={24} value={maintenanceHours} onChange={e => setMaintenanceHours(Number(e.target.value))} style={{ width: 70, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', fontSize: 14, fontWeight: 700, outline: 'none', textAlign: 'center' }} />
                  <span style={{ fontSize: 13, color: C.muted }}>hours</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="number" min={0} max={59} value={maintenanceMinutes} onChange={e => setMaintenanceMinutes(Number(e.target.value))} style={{ width: 70, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 10px', fontSize: 14, fontWeight: 700, outline: 'none', textAlign: 'center' }} />
                  <span style={{ fontSize: 13, color: C.muted }}>minutes</span>
                </div>
                <span style={{ fontSize: 12, color: C.muted }}>— message will show "Back in {maintenanceHours > 0 ? `${maintenanceHours}h ` : ''}{maintenanceMinutes > 0 ? `${maintenanceMinutes}m` : ''}"</span>
              </div>
            ) : (
              <input type="datetime-local" value={customEndTime} onChange={e => setCustomEndTime(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none' }} />
            )}
          </div>

          {/* Preview */}
          <div style={{ background: '#1a1a2e', borderRadius: 10, padding: '20px 24px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontWeight: 900, fontSize: 20, color: C.gold, marginBottom: 8 }}>Platform Under Maintenance</div>
            <div style={{ fontSize: 14, color: '#ccc', marginBottom: 8 }}>{maintenanceMsg}</div>
            <div style={{ fontSize: 13, color: '#aaa' }}>
              {!useCustomEnd
                ? `Back in approximately ${maintenanceHours > 0 ? `${maintenanceHours} hour${maintenanceHours !== 1 ? 's' : ''}` : ''} ${maintenanceMinutes > 0 ? `${maintenanceMinutes} minute${maintenanceMinutes !== 1 ? 's' : ''}` : ''}`
                : customEndTime ? `Back on ${new Date(customEndTime).toLocaleString('en-IN')}` : 'Set an end time above'
              }
            </div>
          </div>

          {!maintenanceOn ? (
            <button onClick={activateMaintenance} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              Enable Maintenance Mode
            </button>
          ) : (
            <button onClick={deactivateMaintenance} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              End Maintenance &amp; Go Live
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      <Section title="Admin Notifications">
        <Row label="Email alerts for flagged content" sub="Receive email when user reports or auto-filter triggers"><Toggle checked={emailAlerts} onChange={() => setEmailAlerts(!emailAlerts)} /></Row>
        <Row label="Push notifications for critical events" sub="Immediate alerts for bans, payment failures, security"><Toggle checked={pushAlerts} onChange={() => setPushAlerts(!pushAlerts)} /></Row>
        <Row label="Fraud & scam detection alerts" sub="Notifications when system auto-blocks suspicious activity"><Toggle checked={fraudAlerts} onChange={() => setFraudAlerts(!fraudAlerts)} /></Row>
        <Row label="Daily digest email" sub="Morning summary of previous day's platform activity"><Toggle checked={dailyDigest} onChange={() => setDailyDigest(!dailyDigest)} /></Row>
      </Section>

      {/* Security */}
      <Section title="Security Settings">
        <Row label="Two-factor authentication for admin" sub="Require 2FA on every admin login"><Toggle checked={twoFA} onChange={() => setTwoFA(!twoFA)} /></Row>
        <div style={{ padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Session timeout (hours)</div>
          <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
            {['1', '2', '4', '8', '12', '24'].map(h => <option key={h} value={h}>{h} hour{h !== '1' ? 's' : ''}</option>)}
          </select>
        </div>
        <div style={{ padding: '10px 0' }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#334155', marginBottom: 4 }}>IP whitelist (optional)</div>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 8 }}>Restrict admin access to specific IP ranges (CIDR notation, comma-separated)</div>
          <input value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} placeholder="e.g. 192.168.1.0/24, 10.0.0.1" style={{ width: '100%', maxWidth: 400, border: `1px solid ${C.border}`, borderRadius: 7, padding: '8px 12px', fontSize: 13, outline: 'none' }} />
        </div>
      </Section>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => showToast('Settings saved')} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Save Settings</button>
      </div>
    </div>
  )
}
