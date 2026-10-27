'use client'
import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type MediaType = 'banner' | 'video' | 'promo'
type Media = {
  id: string; title: string; type: MediaType; url: string; position: number
  active: boolean; clicks: number; impressions: number; added: string; expires?: string
  link?: string; description?: string
}

const initMedia: Media[] = [
  { id: 'm1', title: 'Diwali Sale Banner', type: 'banner', url: '/placeholder-banner-1.jpg', position: 1, active: true, clicks: 1284, impressions: 18400, added: '20 Oct 2026', expires: '05 Nov 2026', link: '/categories/fashion', description: 'Diwali festive offers on all fashion categories' },
  { id: 'm2', title: 'New Restaurants Promo', type: 'promo', url: '/placeholder-promo-1.jpg', position: 2, active: true, clicks: 892, impressions: 14200, added: '15 Oct 2026', link: '/categories/food', description: 'Discover new restaurants near you' },
  { id: 'm3', title: 'App Intro Video', type: 'video', url: '/placeholder-video-1.mp4', position: 3, active: true, clicks: 456, impressions: 9800, added: '10 Sep 2026', description: 'How to use My KKR platform — 60 sec intro' },
  { id: 'm4', title: 'Driver Recruitment', type: 'banner', url: '/placeholder-banner-2.jpg', position: 4, active: false, clicks: 230, impressions: 3100, added: '01 Sep 2026', link: '/driver-signup', description: 'Join as a delivery partner — earn daily' },
  { id: 'm5', title: 'Grocery Offers', type: 'promo', url: '/placeholder-promo-2.jpg', position: 5, active: true, clicks: 621, impressions: 11200, added: '18 Oct 2026', expires: '31 Oct 2026', link: '/categories/groceries', description: '10% off on first grocery order' },
]

const TYPE_COLOR: Record<MediaType, string> = { banner: C.teal, video: C.amber, promo: '#0369a1' }

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return <button onClick={onChange} style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: checked ? C.green : '#d1d5db', position: 'relative', flexShrink: 0 }}>
    <span style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
  </button>
}

export default function AdminMedia() {
  const [media, setMedia] = useState(initMedia)
  const [toast, setToast] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [filterType, setFilterType] = useState<'all' | MediaType>('all')
  const [newItem, setNewItem] = useState({ title: '', type: 'banner' as MediaType, description: '', link: '', expires: '' })
  const [editData, setEditData] = useState<Partial<Media>>({})

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  function toggleActive(id: string) {
    setMedia(m => m.map(x => x.id === id ? { ...x, active: !x.active } : x))
    showToast('Visibility updated')
  }

  function moveUp(id: string) {
    const idx = media.findIndex(m => m.id === id)
    if (idx === 0) return
    const arr = [...media]
    const tmp = arr[idx - 1].position
    arr[idx - 1] = { ...arr[idx - 1], position: arr[idx].position }
    arr[idx] = { ...arr[idx], position: tmp }
    setMedia([...arr.slice(0, idx - 1), arr[idx], arr[idx - 1], ...arr.slice(idx + 1)])
    showToast('Order updated')
  }

  function moveDown(id: string) {
    const idx = media.findIndex(m => m.id === id)
    if (idx === media.length - 1) return
    const arr = [...media]
    const tmp = arr[idx + 1].position
    arr[idx + 1] = { ...arr[idx + 1], position: arr[idx].position }
    arr[idx] = { ...arr[idx], position: tmp }
    setMedia([...arr.slice(0, idx), arr[idx + 1], arr[idx], ...arr.slice(idx + 2)])
    showToast('Order updated')
  }

  function removeItem(id: string) {
    if (!confirm('Remove this media item?')) return
    setMedia(m => m.filter(x => x.id !== id))
    showToast('Media removed')
  }

  function startEdit(item: Media) {
    setEditingId(item.id)
    setEditData({ title: item.title, description: item.description, link: item.link, expires: item.expires })
  }

  function saveEdit() {
    setMedia(m => m.map(x => x.id === editingId ? { ...x, ...editData } : x))
    setEditingId(null)
    showToast('Media updated')
  }

  function addItem() {
    if (!newItem.title.trim()) return showToast('Title required')
    const newId = `m${Date.now()}`
    setMedia(m => [...m, {
      id: newId, title: newItem.title, type: newItem.type,
      url: `/placeholder-${newItem.type}-new.jpg`,
      position: m.length + 1, active: true,
      clicks: 0, impressions: 0,
      added: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      description: newItem.description,
      link: newItem.link || undefined,
      expires: newItem.expires || undefined,
    }])
    setNewItem({ title: '', type: 'banner', description: '', link: '', expires: '' })
    setShowAdd(false)
    showToast(`"${newItem.title}" added`)
  }

  const filtered = filterType === 'all' ? media : media.filter(m => m.type === filterType)

  const totalImpressions = media.filter(m => m.active).reduce((s, m) => s + m.impressions, 0)
  const totalClicks = media.filter(m => m.active).reduce((s, m) => s + m.clicks, 0)
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0'

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Media &amp; Ads</h1>
        <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage home page banners, videos, and promotional content</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: 10, marginBottom: 18 }}>
        {[
          { label: 'Total Media', val: media.length, color: C.teal },
          { label: 'Active', val: media.filter(m=>m.active).length, color: C.green },
          { label: 'Banners', val: media.filter(m=>m.type==='banner').length, color: C.teal },
          { label: 'Promos', val: media.filter(m=>m.type==='promo').length, color: '#0369a1' },
          { label: 'Videos', val: media.filter(m=>m.type==='video').length, color: C.amber },
          { label: 'Avg CTR', val: `${ctr}%`, color: C.green },
        ].map(t => (
          <div key={t.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: .4, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: t.color }}>{t.val}</div>
          </div>
        ))}
      </div>

      {/* Filter + Add */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'banner', 'promo', 'video'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{ padding: '5px 14px', borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${filterType===t ? C.teal : C.border}`, background: filterType===t ? C.teal : C.surface, color: filterType===t ? '#fff' : C.muted }}>
              {t.charAt(0).toUpperCase()+t.slice(1)} {t !== 'all' && `(${media.filter(m => m.type===t).length})`}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>+ Add Media</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: C.surface, border: `1.5px dashed ${C.teal}`, borderRadius: 12, padding: 16, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ gridColumn: '1/-1', fontSize: 13, fontWeight: 800, color: C.teal }}>Add New Media Item</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Title *</div>
            <input value={newItem.title} onChange={e => setNewItem(n => ({ ...n, title: e.target.value }))} placeholder="e.g. Winter Sale Banner" style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Type</div>
            <select value={newItem.type} onChange={e => setNewItem(n => ({ ...n, type: e.target.value as MediaType }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, background: '#fff', cursor: 'pointer' }}>
              <option value="banner">Banner</option>
              <option value="promo">Promo</option>
              <option value="video">Video</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Link URL (optional)</div>
            <input value={newItem.link} onChange={e => setNewItem(n => ({ ...n, link: e.target.value }))} placeholder="/categories/fashion" style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Description</div>
            <input value={newItem.description} onChange={e => setNewItem(n => ({ ...n, description: e.target.value }))} placeholder="Short description" style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Expires (optional)</div>
            <input type="date" value={newItem.expires} onChange={e => setNewItem(n => ({ ...n, expires: e.target.value }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ gridColumn: '1/-1', display: 'flex', gap: 8 }}>
            <div style={{ background: C.bg, border: `2px dashed ${C.border}`, borderRadius: 8, padding: '10px 20px', fontSize: 12, color: C.muted, cursor: 'pointer', flex: 1, textAlign: 'center' }}>
              Upload image/video — click to browse (demo)
            </div>
            <button onClick={addItem} style={{ background: C.teal, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add</button>
            <button onClick={() => setShowAdd(false)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Media list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((item, idx) => (
          <div key={item.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '40px 140px 1fr 80px 100px 100px 120px', gap: 10, padding: '12px 14px', alignItems: 'center' }}>
              {/* Position controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
                <button onClick={() => moveUp(item.id)} disabled={idx === 0} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, width: 22, height: 18, cursor: 'pointer', fontSize: 10, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▲</button>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.teal }}>{item.position}</span>
                <button onClick={() => moveDown(item.id)} disabled={idx === filtered.length - 1} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 4, width: 22, height: 18, cursor: 'pointer', fontSize: 10, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▼</button>
              </div>

              {/* Thumbnail placeholder */}
              <div style={{ height: 60, background: `${TYPE_COLOR[item.type]}15`, border: `1px solid ${TYPE_COLOR[item.type]}30`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: TYPE_COLOR[item.type], textTransform: 'uppercase' }}>{item.type}</span>
              </div>

              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: '#1e293b', marginBottom: 2 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{item.description}</div>
                {item.expires && <div style={{ fontSize: 11, color: C.amber, marginTop: 2 }}>Expires: {item.expires}</div>}
                {item.link && <div style={{ fontSize: 11, color: C.teal, marginTop: 1 }}>→ {item.link}</div>}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.teal }}>{item.clicks.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: C.muted }}>clicks</div>
                <div style={{ fontSize: 11, color: C.muted }}>{item.impressions.toLocaleString()} views</div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <Toggle checked={item.active} onChange={() => toggleActive(item.id)} />
                <div style={{ fontSize: 10, color: item.active ? C.green : C.muted, marginTop: 3, fontWeight: 700 }}>{item.active ? 'Live' : 'Hidden'}</div>
              </div>

              <div style={{ fontSize: 11, color: C.muted, textAlign: 'center' }}>Added {item.added}</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <button onClick={() => editingId === item.id ? setEditingId(null) : startEdit(item)} style={{ background: 'rgba(18,52,59,.07)', border: 'none', color: C.teal, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => removeItem(item.id)} style={{ background: 'rgba(220,38,38,.08)', border: 'none', color: C.red, borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
              </div>
            </div>

            {editingId === item.id && (
              <div style={{ background: 'rgba(18,52,59,.03)', borderTop: `1px solid ${C.border}`, padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Title</div>
                  <input value={editData.title || ''} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Description</div>
                  <input value={editData.description || ''} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 4 }}>Link URL</div>
                  <input value={editData.link || ''} onChange={e => setEditData(d => ({ ...d, link: e.target.value }))} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                  <button onClick={saveEdit} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setEditingId(null)} style={{ background: C.bg, color: C.muted, border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 12px', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
