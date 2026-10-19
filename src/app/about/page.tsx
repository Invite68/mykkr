import { Fragment } from 'react'
import type { Metadata } from 'next'
import Breadcrumbs from '@/components/ui/Breadcrumbs'

export const metadata: Metadata = { title: 'About Kurukshetra' }

const PLACES = [
  { icon: '🌊', name: 'Brahma Sarovar', desc: 'One of Asia’s largest sacred tanks. Lakhs bathe here during solar eclipses.', tag: 'Sacred site' },
  { icon: '🙏', name: 'Jyotisar', desc: 'Where Lord Krishna is believed to have delivered the Bhagavad Gita to Arjuna.', tag: 'Pilgrimage' },
  { icon: '⚔️', name: 'Kurukshetra Panorama', desc: '360° mural of the Mahabharata war with a science centre.', tag: 'Museum' },
  { icon: '🛕', name: 'Sthaneshwar Mahadev', desc: 'Ancient Shiva temple where the Pandavas are said to have prayed.', tag: 'Temple' },
  { icon: '🌺', name: 'Bhadrakali Temple', desc: 'Shakti peeth with huge Navratri celebrations.', tag: 'Temple' },
  { icon: '💧', name: 'Sannihit Sarovar', desc: 'Sacred lake where seven Saraswatis are believed to meet.', tag: 'Sacred site' },
]

const TEHSILS = [
  ['Thanesar', 'Brahmsarovar, Sectors 2–40, Model Town, KU/NIT area, Kalyan Nagar, Mohan Nagar, Shyam Colony, Dara Kalan, Pipli Road'],
  ['Pehowa', 'Saraswati ghats, Prithudaka'],
  ['Ismailabad', 'Ismailabad town, Narkatari'],
  ['Shahabad', 'Shahabad Markanda, Markanda river'],
  ['Ladwa', 'Ladwa town, Kaimri, Rasulpur'],
  ['Babain', 'Babain town, Bursham'],
]

const SECTIONS = [
  ['overview', 'Overview'],
  ['places', 'Tourist places'],
  ['tehsils', 'Tehsils'],
  ['events', 'Events'],
  ['education', 'Universities'],
]

export default function AboutPage() {
  return (
    <>
      <section className="hero">
        <div className="hero-inner" style={{ textAlign: 'left' }}>
          <span className="hero-badge">Explore Kurukshetra</span>
          <h1>Kurukshetra — <span>Land of the Gita</span></h1>
          <p className="hero-sub">One of India’s most sacred cities. Site of the Mahabharata war and birthplace of the Bhagavad Gita.</p>
          <div className="stat-grid">
            {[['5,000+', 'Years of history'], ['48 Kos', 'Sacred parikrama'], ['6', 'Tehsils'], ['400+', 'Villages']].map(([n, l]) => (
              <div className="stat" key={l}><div className="stat-num">{n}</div><div className="stat-lbl">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      <div className="container">
        <Breadcrumbs items={[{ label: 'About Kurukshetra' }]} />
        <nav className="chips" aria-label="On this page">
          {SECTIONS.map(([id, label]) => <a key={id} href={`#${id}`} className="chip">{label}</a>)}
        </nav>

        <section className="sec panel" id="overview">
          <h2 className="panel-title">📋 Quick facts</h2>
          <dl className="kv">
            <dt>Name</dt><dd>Kurukshetra (<span lang="hi">कुरुक्षेत्र</span>)</dd>
            <dt>Also known as</dt><dd>Dharmakshetra · Land of the Bhagavad Gita</dd>
            <dt>State</dt><dd>Haryana, India</dd>
            <dt>Named after</dt><dd>King Kuru, ancestor of the Kauravas and Pandavas</dd>
            <dt>Railway</dt><dd>Kurukshetra Junction (Delhi–Ambala line)</dd>
          </dl>
          <h3 className="panel-title" style={{ marginTop: 18 }}>📜 Timeline</h3>
          <ul className="timeline">
            <li><strong>c. 1200–900 BCE</strong>Kuru kingdom — Vedic texts compiled in the region.</li>
            <li><strong>7th century CE</strong>Thanesar flourishes under King Harshavardhana; Xuanzang visits.</li>
            <li><strong>Medieval era</strong>Remains a spiritual centre for Hindus, Sikhs and Muslims.</li>
            <li><strong>1947–present</strong>Major restoration of sacred sites; Haryana’s best-known pilgrimage city.</li>
          </ul>
        </section>

        <section className="sec" id="places">
          <h2 className="sec-title" style={{ marginBottom: 12 }}>🕌 Tourist places</h2>
          <div className="biz-grid">
            {PLACES.map((p) => (
              <article className="biz-card" key={p.name}>
                <div className="biz-top" aria-hidden="true">{p.icon}</div>
                <div className="biz-body">
                  <div className="biz-cat">{p.tag}</div>
                  <h3 className="biz-name">{p.name}</h3>
                  <p className="biz-area">{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="sec panel" id="tehsils">
          <h2 className="panel-title">🗺️ Tehsils &amp; localities</h2>
          <dl className="kv">
            {TEHSILS.map(([t, d]) => (<Fragment key={t}><dt><strong>{t}</strong></dt><dd>{d}</dd></Fragment>))}
          </dl>
        </section>

        <section className="sec panel" id="events">
          <h2 className="panel-title">📅 Events &amp; festivals</h2>
          <ul className="timeline">
            <li><strong>Gita Jayanti</strong>International Gita Mahotsav — state-level fair with cultural programmes.</li>
            <li><strong>Somvati Amavasya</strong>New moon on a Monday — lakhs bathe in Brahma Sarovar.</li>
            <li><strong>Solar eclipse</strong>Very large gatherings for the holy dip.</li>
            <li><strong>Navratri</strong>Major celebrations at Bhadrakali Temple.</li>
          </ul>
        </section>

        <section className="sec panel" id="education">
          <h2 className="panel-title">🎓 Universities &amp; institutions</h2>
          <ul className="timeline">
            <li><strong>KU</strong>Kurukshetra University — founded 1956.</li>
            <li><strong>NIT Kurukshetra</strong>National Institute of Technology.</li>
            <li><strong>NID Haryana</strong>National Institute of Design campus.</li>
            <li><strong>SKAU</strong>Shri Krishna AYUSH University.</li>
          </ul>
        </section>
      </div>
    </>
  )
}
