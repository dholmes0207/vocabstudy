import { useId } from 'react'

// The VocaStudy mark (docs/design/brand.md): a speech bubble — words are for
// speaking — holding a "V" that doubles as a tick, with a spark from the
// app's night sky. public/favicon.svg and the PNG icons are drawn from the
// same geometry (scripts/make_brand_assets.mjs).

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  const id = useId()
  const g = `logo-g-${id}`
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="VocaStudy">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#337dff" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${g})`} />
      <path
        d="M17 15h30a7 7 0 0 1 7 7v15a7 7 0 0 1-7 7H31l-10 8.5V44h-4a7 7 0 0 1-7-7V22a7 7 0 0 1 7-7z"
        fill="#fff"
      />
      <path
        d="M22.5 23.5 32 36l9.5-12.5"
        fill="none"
        stroke={`url(#${g})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        className="logo-spark"
        d="M51.5 4.5l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z"
        fill="#fde68a"
      />
    </svg>
  )
}

/** Mark + wordmark. `tagline` adds the small line under the name. */
export default function Logo({
  tagline,
  className = '',
  size = 'md',
}: {
  tagline?: string
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${size === 'lg' ? 'h-11 w-11' : 'h-9 w-9'} shrink-0 drop-shadow-md`} />
      <span className="leading-tight">
        <span
          className={`block font-extrabold tracking-tight ${size === 'lg' ? 'text-xl' : 'text-base'}`}
        >
          Voca<span className="text-aurora">Study</span>
        </span>
        {tagline && <span className="block text-xs text-slate-400">{tagline}</span>}
      </span>
    </span>
  )
}
