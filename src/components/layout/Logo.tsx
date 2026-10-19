import Link from 'next/link'
import Image from 'next/image'

export function LogoMark() {
  return (
    <span className="logo-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="#12343b" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 2L2 7l10 5 10-5-10-5M2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </span>
  )
}

export default function Logo() {
  return (
    <Link href="/" className="logo" aria-label="My KKR home">
      {/* Real logo image — falls back to SVG mark if image not found */}
      <Image
        src="/logo.png"
        alt="My KKR"
        width={120}
        height={38}
        priority
        className="logo-img"
        style={{ objectFit: 'contain', height: '38px', width: 'auto' }}
      />
    </Link>
  )
}
