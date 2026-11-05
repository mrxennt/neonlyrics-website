// Hat cosmetics: a small icon for pickers, and a large overlay drawn onto the
// player preview character. ids match src/content.ts.
import { cx } from '../lib/cx'

const g = {
  defs: (
    <>
      <linearGradient id="hat-magenta" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff4fd8" />
        <stop offset="1" stopColor="#5ff3ff" />
      </linearGradient>
      <linearGradient id="hat-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffe9a8" />
        <stop offset="1" stopColor="#c98d2f" />
      </linearGradient>
    </>
  ),
}

/** Small picker icon, 32×22. */
export function HatIcon({ id, className }: { id: string; className?: string }) {
  if (id === 'none') {
    return (
      <svg viewBox="0 0 32 22" className={className} fill="none">
        <circle cx="16" cy="11" r="7" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
        <path d="M6 21 27 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }
  if (id === 'halo') {
    return (
      <svg viewBox="0 0 32 22" className={className} fill="none">
        {g.defs}
        <ellipse cx="16" cy="11" rx="11" ry="5" stroke="url(#hat-magenta)" strokeWidth="3" />
      </svg>
    )
  }
  if (id === 'visor') {
    return (
      <svg viewBox="0 0 32 22" className={className}>
        {g.defs}
        <rect x="4" y="9" width="24" height="7" rx="3.5" fill="url(#hat-magenta)" />
        <rect x="6" y="11" width="9" height="1.6" rx="0.8" fill="#ffffff" opacity="0.7" />
      </svg>
    )
  }
  if (id === 'crown') {
    return (
      <svg viewBox="0 0 32 22" className={className}>
        {g.defs}
        <path d="M5 17 4 7l6 4 6-8 6 8 6-4-1 10z" fill="url(#hat-gold)" />
      </svg>
    )
  }
  if (id === 'beanie') {
    return (
      <svg viewBox="0 0 32 22" className={className}>
        {g.defs}
        <path d="M6 15a10 9 0 0 1 20 0v2H6z" fill="#2b2f4a" />
        <rect x="6" y="16" width="20" height="3.4" rx="1.7" fill="url(#hat-magenta)" />
      </svg>
    )
  }
  if (id === 'horns') {
    return (
      <svg viewBox="0 0 32 22" className={className} fill="none" stroke="#e8e3d8" strokeWidth="3" strokeLinecap="round">
        <path d="M9 20C4 17 3 11 6 5" />
        <path d="M23 20c5-3 6-9 3-15" />
      </svg>
    )
  }
  if (id === 'tophat') {
    return (
      <svg viewBox="0 0 32 22" className={className}>
        {g.defs}
        <rect x="14" y="2" width="13" height="12" rx="1.5" fill="#15131c" />
        <rect x="14" y="10" width="13" height="2.6" fill="url(#hat-magenta)" />
        <rect x="9" y="14.5" width="23" height="3.5" rx="1.75" fill="#15131c" />
      </svg>
    )
  }
  return null
}

/** Large overlay positioned over the character's head, 120×60 above the head box. */
export function HatOverlay({ id, className }: { id: string; className?: string }) {
  if (id === 'halo') {
    return (
      <g className={cx('animate-halo', className)}>
        <ellipse cx="70" cy="26" rx="31" ry="9" fill="none" stroke="url(#hat-magenta)" strokeWidth="4" filter="drop-shadow(0 0 8px rgb(255 79 216 / 0.9))" />
        <ellipse cx="70" cy="26" rx="10" ry="3" fill="#ffffff" opacity="0.55" />
      </g>
    )
  }
  if (id === 'visor') {
    return (
      <g className={className}>
        <rect x="38" y="52" width="64" height="16" rx="8" fill="url(#hat-magenta)" opacity="0.92" />
        <rect x="34" y="56" width="6" height="8" rx="3" fill="#2b2f4a" />
        <rect x="100" y="56" width="6" height="8" rx="3" fill="#2b2f4a" />
        <rect x="44" y="56" width="20" height="2.6" rx="1.3" fill="#ffffff" opacity="0.75" />
      </g>
    )
  }
  if (id === 'crown') {
    return (
      <g className={className}>
        <path d="M42 32 40 8l10 7 8-10 8 10 8-10 8 10 10-7-2 24z" fill="url(#hat-gold)" stroke="#8a5a14" strokeWidth="1" />
        <circle cx="70" cy="20" r="3.4" fill="#ff4fd8" />
        <circle cx="54" cy="24" r="2.6" fill="#5ff3ff" />
        <circle cx="86" cy="24" r="2.6" fill="#5ff3ff" />
      </g>
    )
  }
  if (id === 'beanie') {
    return (
      <g className={className}>
        <path d="M40 34a30 26 0 0 1 60 0v4H40z" fill="#2b2f4a" />
        <rect x="38" y="36" width="64" height="9" rx="4.5" fill="url(#hat-magenta)" />
        <circle cx="70" cy="40.5" r="3.4" fill="#15131c" />
        <circle cx="70" cy="40.5" r="1.2" fill="#5ff3ff" />
      </g>
    )
  }
  if (id === 'horns') {
    return (
      <g className={className} stroke="#e8e3d8" strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M44 46C30 42 26 28 34 14" />
        <path d="M96 46c14-4 18-18 10-32" />
        <path d="M34 14l4 1M106 14l-4 1" stroke="#8fd4ff" strokeWidth="5" />
      </g>
    )
  }
  if (id === 'tophat') {
    return (
      <g className={className}>
        <rect x="48" y="-4" width="44" height="38" rx="5" fill="#15131c" />
        <rect x="48" y="22" width="44" height="7" fill="url(#hat-magenta)" />
        <rect x="32" y="30" width="76" height="10" rx="5" fill="#15131c" />
        <rect x="48" y="-4" width="6" height="38" fill="#ffffff" opacity="0.12" />
      </g>
    )
  }
  return null
}
