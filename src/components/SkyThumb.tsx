// Sky images come from the mod itself. Every picture here was rendered by
// LiveSky.view() — the exact function SkyThumbs.java runs for the in-game sky
// tiles — using SkyThumbs' per-preset look angles (yaw/pitch), t = 12.0 and
// fov 78: 288×162 for the GUI tiles, 1280×720 for the big preview. Nothing in
// this file draws sky artwork by hand; see public/skies/SOURCE.txt.
import type { CSSProperties } from 'react'

import { getSky, PALETTES, type PaletteKey, type SkyDef, type Weather } from '../content'
import { cx } from '../lib/cx'

export function hex(n: number) {
  return `#${(n >>> 0).toString(16).padStart(6, '0')}`
}

// Deterministic pseudo-random props so every mount animates the same way.
const rand = (seed: number) => {
  const v = Math.sin(seed * 12.9898) * 43758.5453
  return v - Math.floor(v)
}

const DROPS = Array.from({ length: 46 }, (_, i) => ({
  left: rand(i * 17 + 9) * 100,
  delay: rand(i * 19 + 11) * 2.6,
  dur: 0.9 + rand(i * 23 + 13) * 1.4,
  size: 1 + Math.round(rand(i * 29 + 15) * 2),
}))

// Weather particles, same kinds as SkyPreset.Weather. The painted sky image
// does not include falling particles, so the preview layers them on top just
// like the world renderer does.
function Particles({ kind, amount, speed }: { kind: Weather; amount: number; speed: number }) {
  if (kind === 'none' || amount <= 0) return null
  const dur = (base: number) => `${(base / Math.max(speed, 0.25)).toFixed(2)}s`
  const style = (i: number): CSSProperties => ({
    left: `${DROPS[i % DROPS.length].left}%`,
    animationDelay: `${-DROPS[i % DROPS.length].delay}s`,
    animationDuration: dur(DROPS[i % DROPS.length].dur * 2.4),
  })

  if (kind === 'rain' || kind === 'thunder') {
    return (
      <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
        {DROPS.slice(0, 30).map((_, i) => (
          <span key={i} className="animate-fall absolute top-[-12%] h-[7%] w-px rounded-full bg-white/40" style={style(i)} />
        ))}
      </div>
    )
  }
  if (kind === 'snow' || kind === 'blizzard') {
    return (
      <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
        {DROPS.slice(0, 30).map((d, i) => (
          <span
            key={i}
            className="animate-fall absolute top-[-6%] rounded-full bg-white/80"
            style={{ ...style(i), width: d.size + 1, height: d.size + 1, filter: 'blur(0.5px)', animationDuration: dur(4.4 + d.delay) }}
          />
        ))}
      </div>
    )
  }
  if (kind === 'petals') {
    return (
      <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
        {DROPS.slice(0, 20).map((d, i) => (
          <span
            key={i}
            className="animate-fall absolute top-[-6%] rounded-full bg-[#ffb7d5]/80"
            style={{ ...style(i), width: 3 + d.size, height: 2 + d.size, animationDuration: dur(5.5 + d.delay) }}
          />
        ))}
      </div>
    )
  }
  if (kind === 'embers') {
    return (
      <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
        {DROPS.slice(0, 22).map((d, i) => (
          <span
            key={i}
            className="animate-rise absolute bottom-[-4%] rounded-full"
            style={{
              left: `${d.left}%`,
              width: d.size + 1,
              height: d.size + 1,
              background: '#ffab5e',
              boxShadow: '0 0 6px 2px rgb(255 130 60 / 0.55)',
              animationDuration: dur(5 + d.delay),
              animationDelay: `${-d.delay}s`,
            }}
          />
        ))}
      </div>
    )
  }
  // fireflies
  return (
    <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
      {DROPS.slice(0, 18).map((d, i) => (
        <span
          key={i}
          className="animate-bob absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${42 + ((d.size * 17 + i * 9) % 40)}%`,
            width: d.size + 2,
            height: d.size + 2,
            background: '#ffe89e',
            boxShadow: '0 0 8px 3px rgb(255 230 140 / 0.5)',
            animationDuration: dur(4 + d.delay),
            animationDelay: `${-d.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

type Props = {
  skyIndex: number
  palette: PaletteKey
  // The preview scene uses the 1280×720 render and weather particles; GUI
  // tiles use the exact 288×162 in-game thumbnail, static.
  moving?: boolean
  className?: string
}

export function SkyThumb({ skyIndex, palette, moving = false, className }: Props) {
  const sky: SkyDef = getSky(skyIndex)
  const filter = PALETTES.find((p) => p.key === palette)?.filter ?? 'none'
  const src = `/skies/${moving ? 'scene' : 'thumb'}-${sky.id}.webp`

  return (
    <div aria-hidden className={cx('absolute inset-0 overflow-hidden bg-[#05040a]', className)}>
      <img
        src={src}
        alt=""
        draggable={false}
        className="absolute inset-0 size-full object-cover"
        style={{ filter }}
      />
      {moving && (
        <div className="absolute inset-0" style={{ filter }}>
          <Particles kind={sky.weather} amount={1} speed={1} />
        </div>
      )}
    </div>
  )
}
