import Link from 'next/link'

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
      <LogoMark />
      <span className="logo-name">My KKR</span>
    </Link>
  )
}
