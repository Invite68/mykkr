import Link from 'next/link'
import { CATEGORY_GROUPS } from '@/data/categories'
import { DISCLAIMER, SITE } from '@/config/platform'
import { LogoMark } from './Logo'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Link href="/" className="logo">
            <LogoMark />
            <span className="logo-name">My KKR</span>
          </Link>
          <p className="footer-tagline">Kurukshetra ka apna bazaar. Connecting local businesses with local people — simply and honestly.</p>
        </div>
        <div className="footer-cols">
          <div className="footer-col">
            <div className="footer-col-title">Categories</div>
            {CATEGORY_GROUPS.map((g) => (
              <Link key={g.slug} href={`/c/${g.slug}`}>{g.label}</Link>
            ))}
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Discover</div>
            <Link href="/find-book">Find &amp; Book</Link>
            <Link href="/rides">Rides &amp; Delivery</Link>
            <Link href="/post">Post Requirement</Link>
            <Link href="/about">About Kurukshetra</Link>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <Link href="/register?role=business">List your business</Link>
            <Link href="/register?role=driver">Become a driver</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <a href={SITE.supportWhatsApp} target="_blank" rel="noopener noreferrer">Help &amp; Support</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} My KKR · Kurukshetra, Haryana · mykkr.in</span>
        <span>{DISCLAIMER}</span>
      </div>
    </footer>
  )
}
