import Link from 'next/link'
import { DISCLAIMER, SITE } from '@/config/platform'
import { CircularLogo } from './Logo'
import { IconFacebook, IconInstagram, IconYouTube, IconWhatsApp } from './NavIcons'

const SOCIAL = [
  { href: 'https://facebook.com', label: 'Facebook', icon: <IconFacebook /> },
  { href: 'https://instagram.com', label: 'Instagram', icon: <IconInstagram /> },
  { href: 'https://youtube.com', label: 'YouTube', icon: <IconYouTube /> },
  { href: SITE.supportWhatsApp, label: 'WhatsApp', icon: <IconWhatsApp /> },
]

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <div className="footer-logo-row">
            <span className="footer-logo-circle"><CircularLogo size={36} /></span>
            <span className="footer-logo-name">My KKR</span>
          </div>
          <p className="footer-tagline">
            Kurukshetra ka apna bazaar.<br />
            Connecting local businesses with local people &mdash; simply and honestly.
          </p>
          <div className="footer-social">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="footer-social-btn">
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="footer-cols">
          <div className="footer-col">
            <div className="footer-col-title">Discover</div>
            <Link href="/c/services">Services</Link>
            <Link href="/c/shopping">Shop</Link>
            <Link href="/c/food">Food &amp; Dining</Link>
            <Link href="/rides">Rides &amp; Delivery</Link>
            <Link href="/post">Post Requirement</Link>
            <Link href="/about">About Kurukshetra</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <Link href="/register?role=business">List your business</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <a href={SITE.supportWhatsApp} target="_blank" rel="noopener noreferrer">Help &amp; Support</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2025 My KKR &middot; Kurukshetra, Haryana &middot; <a href="https://mykkr.in" className="footer-bottom-link">mykkr.in</a></span>
        <span>{DISCLAIMER}</span>
      </div>
    </footer>
  )
}
