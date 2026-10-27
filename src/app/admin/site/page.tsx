'use client'
import { useState } from 'react'

const C = { teal: '#12343b', gold: '#e1b382', border: '#e2e8f0', muted: '#64748b', green: '#0f766e', red: '#dc2626', amber: '#b45309', bg: '#f1f5f9', surface: '#fff' }

type Section = 'branding' | 'about' | 'social' | 'legal' | 'contact'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'branding', label: 'Branding & Logo' },
  { id: 'about', label: 'About & Info' },
  { id: 'social', label: 'Social Links' },
  { id: 'legal', label: 'Legal Pages' },
  { id: 'contact', label: 'Contact Info' },
]

const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'Twitter / X', 'YouTube', 'WhatsApp', 'LinkedIn']

export default function AdminSite() {
  const [section, setSection] = useState<Section>('branding')
  const [toast, setToast] = useState('')
  const [saved, setSaved] = useState(false)

  // Branding
  const [appName, setAppName] = useState('My KKR')
  const [tagline, setTagline] = useState('Your Local Business Marketplace')
  const [primaryColor, setPrimaryColor] = useState('#12343b')
  const [accentColor, setAccentColor] = useState('#e1b382')

  // About
  const [aboutText, setAboutText] = useState(`My KKR is a hyper-local marketplace for Kurukshetra, connecting small businesses with customers. Founded in 2025, our platform supports local economies by helping businesses go digital quickly and affordably.

We believe every local business deserves a digital presence — grocers, restaurants, service providers, and real estate all under one platform.`)
  const [missionText, setMissionText] = useState('Empower small businesses in Kurukshetra to grow online while keeping commerce local and community-focused.')
  const [yearFounded, setYearFounded] = useState('2025')
  const [city, setCity] = useState('Kurukshetra, Haryana')

  // Social
  const [socials, setSocials] = useState<Record<string, string>>({
    'Facebook': 'https://facebook.com/mykkr',
    'Instagram': 'https://instagram.com/mykkr',
    'Twitter / X': 'https://twitter.com/mykkr',
    'YouTube': '',
    'WhatsApp': '+91 98765 43210',
    'LinkedIn': '',
  })

  // Legal
  const [privacyPolicy, setPrivacyPolicy] = useState(`Last updated: October 2026

1. DATA WE COLLECT
We collect your name, phone number, email, and location when you register. Businesses additionally provide GSTIN and business documents for KYC verification.

2. HOW WE USE YOUR DATA
Your data is used to provide platform services, facilitate communication between buyers and sellers, and send service-related notifications. We do not sell your data to third parties.

3. PLATFORM DISCLAIMER
My KKR is a listing and connection platform only. All transactions, deliveries, and disputes are solely between the involved parties. The platform takes no responsibility for the quality of goods or services, delivery issues, or payment disputes.

4. COOKIES
We use essential cookies for authentication and session management. No third-party advertising cookies.

5. YOUR RIGHTS
You may request deletion of your account and data by contacting support@mykkr.in.`)

  const [termsText, setTermsText] = useState(`Last updated: October 2026

1. ACCEPTANCE
By using My KKR, you agree to these Terms. If you do not agree, please do not use the platform.

2. SUBSCRIPTION
Businesses pay ₹99+GST/month. Customers pay ₹9.99+GST/month with a 7-day free trial. Subscriptions auto-renew unless cancelled.

3. PLATFORM ROLE
My KKR is a CONNECTOR ONLY. We do not hold payments, guarantee delivery, or mediate disputes. All agreements are strictly between buyers and sellers.

4. PROHIBITED CONTENT
Users must not post false, misleading, offensive, or illegal listings. Violations result in immediate account suspension.

5. INTELLECTUAL PROPERTY
All platform design and code is proprietary to My KKR. Business listings remain property of the respective business owners.`)

  // Contact
  const [supportEmail, setSupportEmail] = useState('support@mykkr.in')
  const [supportPhone, setSupportPhone] = useState('+91 98765-43210')
  const [businessAddress, setBusinessAddress] = useState('Kurukshetra, Haryana 136118, India')
  const [supportHours, setSupportHours] = useState('Mon–Sat, 9 AM – 7 PM IST')

  function save() {
    setSaved(true)
    showToast('Settings saved successfully')
    setTimeout(() => setSaved(false), 2000)
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  return (
    <div>
      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: C.teal, color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)' }}>{toast}</div>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.teal }}>Site Settings</h1>
          <p style={{ margin: '3px 0 0', color: C.muted, fontSize: 13 }}>Manage platform branding, content, legal pages, and contact information</p>
        </div>
        <button onClick={save} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 9, padding: '10px 22px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          {saved ? 'Saved!' : 'Save All Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Left nav */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', position: 'sticky', top: 70 }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 16px', border: 'none', borderBottom: `1px solid ${C.border}`, background: section === s.id ? 'rgba(18,52,59,.06)' : 'transparent', color: section === s.id ? C.teal : C.muted, fontWeight: section === s.id ? 800 : 500, fontSize: 13, cursor: 'pointer', borderLeft: section === s.id ? `3px solid ${C.teal}` : '3px solid transparent' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>

          {section === 'branding' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.teal, marginBottom: 18 }}>Branding &amp; Logo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>App / Platform Name</label>
                  <input value={appName} onChange={e => setAppName(e.target.value)} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 14, fontWeight: 700, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Tagline</label>
                  <input value={tagline} onChange={e => setTagline(e.target.value)} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Primary Color (Teal)</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ width: 50, height: 40, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: 3 }} />
                    <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, fontFamily: 'monospace', outline: 'none' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Accent Color (Gold)</label>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ width: 50, height: 40, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: 3 }} />
                    <input value={accentColor} onChange={e => setAccentColor(e.target.value)} style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, fontFamily: 'monospace', outline: 'none' }} />
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Logo Upload</label>
                <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: 24, textAlign: 'center', background: C.bg, cursor: 'pointer' }}>
                  <div style={{ width: 60, height: 60, background: primaryColor, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#fff', fontWeight: 900, fontSize: 18 }}>{appName.charAt(0)}</div>
                  <div style={{ fontSize: 13, color: C.muted }}>Click to upload new logo (PNG, SVG — 512×512 recommended)</div>
                  <button style={{ marginTop: 10, background: C.teal, color: '#fff', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Choose File</button>
                </div>
              </div>
            </div>
          )}

          {section === 'about' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.teal, marginBottom: 18 }}>About &amp; Platform Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>City / Region</label>
                  <input value={city} onChange={e => setCity(e.target.value)} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Year Founded</label>
                  <input value={yearFounded} onChange={e => setYearFounded(e.target.value)} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>Mission Statement</label>
                <textarea value={missionText} onChange={e => setMissionText(e.target.value)} rows={3} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>About Text</label>
                <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={8} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }} />
              </div>
            </div>
          )}

          {section === 'social' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.teal, marginBottom: 18 }}>Social Media Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {SOCIAL_PLATFORMS.map(platform => (
                  <div key={platform} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, alignItems: 'center' }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>{platform}</label>
                    <input
                      value={socials[platform] || ''}
                      onChange={e => setSocials(s => ({ ...s, [platform]: e.target.value }))}
                      placeholder={platform === 'WhatsApp' ? '+91 XXXXX XXXXX' : `https://${platform.toLowerCase().split(' ')[0]}.com/yourpage`}
                      style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {section === 'legal' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.teal, marginBottom: 18 }}>Legal Pages</div>
              <div style={{ background: 'rgba(225,179,130,.1)', border: `1px solid ${C.gold}50`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: C.amber }}>
                These pages are shown to users on the platform. Keep them accurate and up to date.
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.teal, marginBottom: 8 }}>Privacy Policy</div>
                <textarea value={privacyPolicy} onChange={e => setPrivacyPolicy(e.target.value)} rows={12} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, fontFamily: 'inherit' }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: C.teal, marginBottom: 8 }}>Terms &amp; Conditions</div>
                <textarea value={termsText} onChange={e => setTermsText(e.target.value)} rows={12} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.7, fontFamily: 'inherit' }} />
              </div>
            </div>
          )}

          {section === 'contact' && (
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, color: C.teal, marginBottom: 18 }}>Contact &amp; Support Info</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { label: 'Support Email', value: supportEmail, onChange: setSupportEmail, placeholder: 'support@yourplatform.in' },
                  { label: 'Support Phone', value: supportPhone, onChange: setSupportPhone, placeholder: '+91 XXXXX XXXXX' },
                  { label: 'Business Address', value: businessAddress, onChange: setBusinessAddress, placeholder: 'City, State, PIN, Country' },
                  { label: 'Support Hours', value: supportHours, onChange: setSupportHours, placeholder: 'Mon–Sat, 9 AM – 7 PM IST' },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.muted, display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.placeholder} style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={save} style={{ background: C.green, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
