import Link from 'next/link'
import Image from 'next/image'

/** Circular logo — used in the top nav (left corner) and About page */
export function CircularLogo({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="My KKR"
      width={size}
      height={size}
      priority
      className="logo-circle-img"
      style={{ width: size, height: size, objectFit: 'cover', borderRadius: '50%', display: 'block' }}
    />
  )
}

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
      <span className="logo-circle">
        <CircularLogo size={40} />
      </span>
      <span className="logo-wordmark">My KKR</span>
    </Link>
  )
}
