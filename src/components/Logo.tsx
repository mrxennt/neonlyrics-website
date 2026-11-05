import { cx } from '../lib/cx'
import { brand } from '../content'

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        'depth relative grid size-8 shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-surface-2 to-raised',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="url(#logo-g)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5ff3ff" />
            <stop offset="1" stopColor="#ff4fd8" />
          </linearGradient>
        </defs>
        <path d="M9 17V6l8-2v9" />
        <circle cx="6.5" cy="17" r="2.2" fill="url(#logo-g)" stroke="none" />
        <circle cx="14.5" cy="13.5" r="2.2" fill="url(#logo-g)" stroke="none" />
      </svg>
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#" className={cx('inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-fg', className)}>
      <LogoMark />
      {brand.name}
    </a>
  )
}
