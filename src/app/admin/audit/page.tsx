'use client'
import { useState, useMemo } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type AuditCategory = 'all' | 'account' | 'subscription' | 'content' | 'settings' | 'fare' | 'admin'
type RollbackStatus = 'available' | 'not_applicable' | 'rolled_back'

type AuditEntry = {
  id: string; timestamp: string; category: Exclude<AuditCategory, 'all'>; action: string
  target: string; targetId: string; before: string; after: string
  actor: string; ip: string; rollback: RollbackStatus
}

const AUDIT: AuditEntry[] = [
  { id: 'AU-1001', timestamp: '27 Oct 2026 14:32:11', category: 'account', action: 'Business account suspended', target: 'KKR Demo Store', targetId: 'B-0067', before: 'status: active', after: 'status: suspended', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1002', timestamp: '27 Oct 2026 12:14:03', category: 'fare', action: 'Per-km rate updated (Cab)', target: 'Vehicle: Cab/Sedan', targetId: 'V-002', before: 'perKm: 11', after: 'perKm: 12', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1003', timestamp: '27 Oct 2026 10:55:42', category: 'content', action: 'Listing removed by filter', target: 'Listing L-3421', targetId: 'L-3421', before: 'visible: true', after: 'visible: false, flagged: true', actor: 'System (AutoFilter)', ip: 'system', rollback: 'not_applicable' },
  { id: 'AU-1004', timestamp: '26 Oct 2026 18:21:08', category: 'subscription', action: 'Plan price updated', target: 'Customer Access Plan', targetId: 'P-002', before: 'price: 14.99', after: 'price: 9.99', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1005', timestamp: '26 Oct 2026 16:00:34', category: 'account', action: 'Driver approved', target: 'Suresh Yadav', targetId: 'D-002', before: 'status: pending', after: 'status: active, kyc: verified', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'not_applicable' },
  { id: 'AU-1006', timestamp: '26 Oct 2026 11:45:19', category: 'settings', action: 'Maintenance mode enabled', target: 'Platform', targetId: 'SYSTEM', before: 'maintenance: false', after: 'maintenance: true, duration: 30min', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'not_applicable' },
  { id: 'AU-1007', timestamp: '25 Oct 2026 09:12:55', category: 'content', action: 'Media banner added', target: 'Diwali Sale Banner', targetId: 'M-005', before: '(none)', after: 'position: 1, active: true', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1008', timestamp: '24 Oct 2026 15:33:27', category: 'subscription', action: 'Discount created', target: 'Diwali26 Promo', targetId: 'D-001', before: '(none)', after: '20% off, expires 5 Nov', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1009', timestamp: '23 Oct 2026 10:22:14', category: 'account', action: 'Customer banned', target: 'Mohan Lal', targetId: 'C-0089', before: 'status: active', after: 'status: banned', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1010', timestamp: '22 Oct 2026 08:01:33', category: 'admin', action: 'Admin login', target: 'Admin Panel', targetId: 'AUTH', before: '(none)', after: 'session started', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'not_applicable' },
  { id: 'AU-1011', timestamp: '21 Oct 2026 16:47:02', category: 'fare', action: 'New vehicle added', target: 'E-Rickshaw', targetId: 'V-007', before: '(none)', after: 'base: ₹15, perKm: ₹5', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'available' },
  { id: 'AU-1012', timestamp: '20 Oct 2026 11:15:44', category: 'account', action: 'Business promoted to top', target: 'KKR Sweet Shop', targetId: 'B-0008', before: 'promoted: false', after: 'promoted: true', actor: 'admin@mykkr.in', ip: '192.168.1.45', rollback: 'rolled_back' },
]

const CAT_COLOR: Record<Exclude<AuditCategory, 'all'>, string> = {
  account: C.teal, subscription: C.green, content: C.amber, settings: C.red, fare: '#0369a1', admin: C.muted
}

const CATS: AuditCategory[] = ['all', 'account', 'subscription', 'content', 'settings', 'fare', 'admin']

export default function AdminAudit() {
  const [catFilter, setCatFilter] = useState<AuditCategory>('all')
  const [search, setSearch] = useState('')
  const [rolledBack, setRolledBack] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function doRollback(entry: AuditEntry) {
    if (!confirm(`Rollback: "${entry.action}" on ${entry.target}?\n\nThis will revert: ${entry.after} → ${entry.before}`)) return
    setRolledBack(rb => new Set([...rb, entry.id]))
    showToast(`Rolled back: ${entry.action} on ${entry.target}`)
  }

  const filtered = useMemo(() => {
    return AUDIT.filter(a => {
      if (catFilter !== 'all' && a.category !== catFilter) return false
      const q = search.toLowerCase()
      return !q || a.action.toLowerCase().includes(q) || a.target.toLowerCase().includes(q) || a.actor.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)
    })
  }, [catFilter, search])

  function exportCSV() {
    const rows = ['ID,Timestamp,Category,Action,Target,TargetID,Before,After,Actor,IP']
    filtered.forEach(a => rows.push(`"${a.id}","${a.timestamp}","${a.category}","${a.action}","${a.target}","${a.targetId}","${a.before}","${a.after}","${a.actor}","${a.ip}"`))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const el = document.createElement('a'); el.href = url; el.download = 'audit_log.csv'; el.click()
  }

  const rbStatus = (entry: AuditEntry): RollbackStatus => rolledBack.has(entry.id) ? 'rolled_back' : entry.rollback

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Audit Log</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Full change history with rollback capability — every admin action recorded</p>
        </div>
        <button onClick={exportCSV} style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.teal, borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Export CSV</button>
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {CATS.map(c => {
          const color = c === 'all' ? C.teal : CAT_COLOR[c as Exclude<AuditCategory, 'all'>]
          const cnt = c === 'all' ? AUDIT.length : AUDIT.filter(a => a.category === c).length
          return (
            <button key={c} onClick={() => setCatFilter(c)} style={{ padding: '5px 13px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${catFilter===c ? color : C.border}`, background: catFilter===c ? color : C.surface, color: catFilter===c ? '#fff' : C.muted }}>
              {c.charAt(0).toUpperCase()+c.slice(1)} ({cnt})
            </button>
          )
        })}
      </div>

      <div style={{ marginBottom: 12 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search actions, targets, actors..." style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 14px', fontSize: 13, outline: 'none', width: 300 }} />
      </div>

      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '100px 90px 1fr 120px 110px 110px', gap: 8, padding: '9px 14px', background: C.bg, borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4 }}>
          <span>Audit ID</span><span>Category</span><span>Action &amp; Target</span><span>Actor</span><span>Timestamp</span><span>Rollback</span>
        </div>

        {filtered.map(entry => {
          const rb = rbStatus(entry)
          const catColor = CAT_COLOR[entry.category]
          return (
            <div key={entry.id}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 90px 1fr 120px 110px 110px', gap: 8, padding: '11px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                <code style={{ fontSize: 11, fontWeight: 700, color: C.muted, fontFamily: 'monospace' }}>{entry.id}</code>
                <span style={{ fontSize: 11, fontWeight: 700, color: catColor, background: `${catColor}15`, border: `1px solid ${catColor}30`, borderRadius: 99, padding: '2px 8px', textAlign: 'center' }}>{entry.category}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5, color: '#1e293b' }}>{entry.action}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{entry.target} <span style={{ fontFamily: 'monospace', color: C.teal }}>{entry.targetId}</span></div>
                </div>
                <span style={{ fontSize: 11, color: C.muted }}>{entry.actor}</span>
                <span style={{ fontSize: 10, color: C.muted }}>{entry.timestamp}</span>
                {rb === 'rolled_back' && <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, background: C.bg, borderRadius: 6, padding: '3px 8px', textAlign: 'center' }}>Rolled back</span>}
                {rb === 'not_applicable' && <span style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>N/A</span>}
                {rb === 'available' && (
                  <button onClick={e => { e.stopPropagation(); doRollback(entry) }} style={{ background: 'rgba(220,38,38,.09)', border: `1px solid ${C.red}30`, color: C.red, borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Rollback</button>
                )}
              </div>

              {expanded === entry.id && (
                <div style={{ background: 'rgba(18,52,59,.03)', borderBottom: `1px solid ${C.border}`, padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, fontSize: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>Before</div>
                    <code style={{ display: 'block', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', color: C.red, fontFamily: 'monospace', fontSize: 12 }}>{entry.before}</code>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>After</div>
                    <code style={{ display: 'block', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, padding: '8px 10px', color: C.green, fontFamily: 'monospace', fontSize: 12 }}>{entry.after}</code>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 6 }}>Context</div>
                    <div style={{ color: C.muted }}>IP: {entry.ip}</div>
                    <div style={{ color: C.muted, marginTop: 3 }}>{entry.timestamp}</div>
                    {rb === 'rolled_back' && <div style={{ color: C.amber, fontWeight: 700, marginTop: 6 }}>Rolled back in this session</div>}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: C.muted, fontSize: 13 }}>No audit entries match the current filters.</div>}
      </div>

      <div style={{ marginTop: 10, fontSize: 12, color: C.muted, textAlign: 'right' }}>
        Showing {filtered.length} of {AUDIT.length} entries · Click any row to see before/after detail
      </div>
    </div>
  )
}
