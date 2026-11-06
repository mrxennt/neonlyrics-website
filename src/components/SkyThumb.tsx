// Renders a sky from its real SkyPreset values (see content.ts). This is the
// browser counterpart of the mod's LiveSky renderer: gradient with the preset
// top/horizon colours, stars by count, aurora ribbons in the aurora colours,
// the preset's moon disc, its weather particles and a few per-preset accents.
// Used full-size by the preview scene and as the GUI's sky-style thumbnails.
import type { CSSProperties } from 'react'

import { getSky, PALETTES, type PaletteKey, type SkyDef, type Weather } from '../content'
import { cx } from '../lib/cx'

export function hex(n: number) {
  return `#${(n >>> 0).toString(16).padStart(6, '0')}`
}

// Deterministic pseudo-random props so every mount paints the same picture.
const rand = (seed: number) => {
  const v = Math.sin(seed * 12.9898) * 43758.5453
  return v - Math.floor(v)
}

const STARS = Array.from({ length: 90 }, (_, i) => ({
  left: rand(i * 3 + 1) * 100,
  top: rand(i * 5 + 2) * 58,
  size: 1 + Math.round(rand(i * 7 + 3) * 2),
  delay: rand(i * 11 + 4) * 3.4,
  dur: 2.4 + rand(i * 13 + 5) * 2.2,
}))

const DROPS = Array.from({ length: 46 }, (_, i) => ({
  left: rand(i * 17 + 9) * 100,
  delay: rand(i * 19 + 11) * 2.6,
  dur: 0.9 + rand(i * 23 + 13) * 1.4,
  scale: 0.6 + rand(i * 29 + 15) * 0.8,
}))

function mixHex(a: number, b: number, t: number) {
  const r = Math.round(((a >>> 16) & 255) * (1 - t) + ((b >>> 16) & 255) * t)
  const g = Math.round(((a >>> 8) & 255) * (1 - t) + ((b >>> 8) & 255) * t)
  const bl = Math.round((a & 255) * (1 - t) + (b & 255) * t)
  return `rgb(${r} ${g} ${bl})`
}

// One weather particle layer. Kinds follow SkyPreset.Weather.
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
        {STARS.slice(0, 30).map((s, i) => (
          <span
            key={i}
            className="animate-fall absolute top-[-6%] rounded-full bg-white/80"
            style={{ ...style(i), width: s.size + 1, height: s.size + 1, filter: 'blur(0.5px)', animationDuration: dur(4.4 + s.delay), animationDelay: `${-s.delay}s` }}
          />
        ))}
      </div>
    )
  }
  if (kind === 'petals') {
    return (
      <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
        {STARS.slice(0, 20).map((s, i) => (
          <span
            key={i}
            className="animate-fall absolute top-[-6%] rounded-full bg-[#ffb7d5]/80"
            style={{ ...style(i), width: 3 + s.size, height: 2 + s.size, animationDuration: dur(5.5 + s.delay), animationDelay: `${-s.delay}s` }}
          />
        ))}
      </div>
    )
  }
  if (kind === 'embers') {
    return (
      <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
        {STARS.slice(0, 22).map((s, i) => (
          <span
            key={i}
            className="animate-rise absolute bottom-[-4%] rounded-full"
            style={{
              left: `${s.left}%`,
              width: s.size + 1,
              height: s.size + 1,
              background: '#ffab5e',
              boxShadow: '0 0 6px 2px rgb(255 130 60 / 0.55)',
              animationDuration: dur(5 + s.delay),
              animationDelay: `${-s.delay}s`,
            }}
          />
        ))}
      </div>
    )
  }
  // fireflies
  return (
    <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(amount, 1) }}>
      {STARS.slice(0, 18).map((s, i) => (
        <span
          key={i}
          className="animate-bob absolute rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${42 + (s.top % 40)}%`,
            width: s.size + 2,
            height: s.size + 2,
            background: '#ffe89e',
            boxShadow: '0 0 8px 3px rgb(255 230 140 / 0.5)',
            animationDuration: dur(4 + s.delay),
            animationDelay: `${-s.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

type Props = {
  skyIndex: number
  palette: PaletteKey
  // Moving layers breathe and fall; thumbnails stay still for calm grid tiles.
  moving?: boolean
  className?: string
}

export function SkyThumb({ skyIndex, palette, moving = false, className }: Props) {
  const sky: SkyDef = getSky(skyIndex)
  const top = hex(sky.top)
  const mid = mixHex(sky.top, sky.horizon, 0.55)
  const hor = hex(sky.horizon)
  const filter = PALETTES.find((p) => p.key === palette)?.filter ?? 'none'
  const showWeather = moving

  return (
    <div
      aria-hidden
      className={cx('absolute inset-0 overflow-hidden', className)}
      style={{ background: `linear-gradient(180deg, ${top} 0%, ${top} 34%, ${mid} 58%, ${hor} 82%, ${hor} 100%)` }}
    >
      {/* Per-preset accents first (behind stars) */}
      {sky.id === 'synthwave' && (
        <div aria-hidden className="absolute left-1/2 top-[46%] size-[36%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full [box-shadow:0_0_70px_24px_rgb(255_110_160/0.4)]">
          <div aria-hidden className="absolute inset-0 [background:linear-gradient(180deg,#ffd166_0%,#ff8f70_55%,#ff4f90_100%)]" />
          <div aria-hidden className="absolute inset-0 [background:repeating-linear-gradient(180deg,transparent_0_9%,rgb(19_14_25/0.85)_9%_12%)]" style={{ maskImage: 'linear-gradient(180deg,transparent_0_46%,black_46%)' }} />
        </div>
      )}
      {sky.id === 'black_hole' && (
        <>
          <div aria-hidden className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-md opacity-70 [background:conic-gradient(from_120deg,#ff9a5e,#ffd7a8,#8f6bff,#ff9a5e)]" />
          <div aria-hidden className="absolute left-1/2 top-1/2 size-[20%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black [box-shadow:0_0_30px_10px_rgb(255_170_110/0.5)]" />
        </>
      )}
      {sky.id === 'cosmos' && (
        <>
          <div aria-hidden className="absolute left-[-10%] top-[8%] h-[26%] w-[120%] rotate-[24deg] rounded-full opacity-60 blur-xl [background:linear-gradient(90deg,transparent,#b9a6ff,#fff6ff,#8f7bd8,transparent)]" />
          <span aria-hidden className="absolute right-[26%] top-[26%] size-[4.5%] rounded-full bg-[#ffcea4] blur-[1px]" />
        </>
      )}
      {sky.id === 'neon_city' && (
        <>
          <div className="absolute inset-x-0 bottom-0 top-[77%] flex items-end gap-[2%] px-2">
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} className="flex-1 bg-[#0b0712]" style={{ height: `${28 + rand(i * 5) * 70}%` }} />
            ))}
          </div>
          <div aria-hidden className="absolute bottom-[6%] left-1/2 h-[70%] w-[26%] origin-bottom -translate-x-1/2 -rotate-[18deg] opacity-50 blur-lg [background:linear-gradient(180deg,rgb(255_170_90/0.8),transparent)]" />
          <div aria-hidden className="absolute bottom-[6%] left-1/3 h-[70%] w-[26%] origin-bottom -rotate-[24deg] opacity-40 blur-lg [background:linear-gradient(180deg,rgb(140_220_255/0.8),transparent)]" />
        </>
      )}
      {sky.id === 'inferno' && (
        <>
          <div aria-hidden className="absolute inset-x-0 bottom-0 top-[52%] opacity-70 blur-lg [background:radial-gradient(60%_100%_at_30%_100%,rgb(255_120_40/0.8),transparent),radial-gradient(50%_90%_at_72%_100%,rgb(255_70_90/0.7),transparent)]" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 top-[40%] opacity-80 mix-blend-screen [background:repeating-linear-gradient(112deg,transparent_0_26px,rgb(255_160_70/0.5)_26px_30px,transparent_30px_60px)]" />
        </>
      )}
      {sky.id === 'matrix' && (
        <div aria-hidden className="absolute inset-0 opacity-90">
          {Array.from({ length: 7 }, (_, i) => (
            <span
              key={i}
              className="absolute inset-y-0 w-[7%] [background:repeating-linear-gradient(180deg,rgb(120_255_140/0.85)_0_4px,transparent_4px_12px)] blur-[0.6px]"
              style={{ left: `${(i * 14 + 3)}%`, opacity: 0.3 + rand(i) * 0.5 }}
            />
          ))}
        </div>
      )}
      {sky.id === 'pulsar' && (
        <>
          <span aria-hidden className="absolute left-1/2 top-[42%] size-[3%] -translate-x-1/2 rounded-full bg-white [box-shadow:0_0_30px_12px_rgb(190_220_255/0.9)]" />
          {Array.from({ length: 3 }, (_, i) => (
            <span
              key={i}
              aria-hidden
              className="absolute left-1/2 top-[42%] -translate-x-1/2 rounded-full border border-[#9ecbff]/35"
              style={{ width: `${14 + i * 11}%`, aspectRatio: 1, transform: 'translate(-50%, -50%)' }}
            />
          ))}
        </>
      )}
      {sky.id === 'prism' && (
        <div aria-hidden className="absolute inset-x-2 top-0 h-[70%] opacity-70 blur-md">
          {['#ff5b8d', '#ffd166', '#7cf7a3', '#5ff3ff', '#a78bff'].map((c, i) => (
            <span key={i} className="absolute top-0 h-full w-[5%]" style={{ left: `${12 + i * 18}%`, background: `linear-gradient(180deg,${c}cc,transparent)` }} />
          ))}
        </div>
      )}
      {sky.id === 'deep_sea' && (
        <div aria-hidden className="absolute inset-0 opacity-60 blur-md [background:radial-gradient(38%_60%_at_50%_-8%,rgba(90,230,255,0.9),transparent_70%),repeating-conic-gradient(from_140deg_at_50%_-10%,rgba(120,255,255,0.28)_0_2deg,transparent_2deg_11deg)]" />
      )}
      {(sky.id === 'ice' || sky.id === 'polar') && (
        <div aria-hidden className="absolute bottom-0 left-1/2 top-[18%] w-[10%] -translate-x-1/2 opacity-80 blur-md [background:linear-gradient(180deg,transparent,rgb(220_245_255/0.75))] [mask-image:linear-gradient(180deg,transparent,black_60%)]" />
      )}
      {(sky.id === 'ocean' || sky.id === 'aurora') && (
        <div aria-hidden className="absolute left-1/2 top-[10%] h-[42%] w-[68%] -translate-x-1/2 opacity-70 blur-xl [background:linear-gradient(90deg,transparent,rgb(95_243_255/0.5),rgb(160_255_200/0.45),rgb(95_243_255/0.5),transparent)]" />
      )}
      {(sky.id === 'golden_hour' || sky.id === 'cotton_candy' || sky.id === 'sakura') && (
        <>
          <div aria-hidden className="absolute left-[8%] top-[46%] h-[12%] w-[30%] rounded-full opacity-90 blur-lg" style={{ background: hex(sky.aurora2) }} />
          <div aria-hidden className="absolute right-[6%] top-[24%] h-[10%] w-[24%] rounded-full opacity-80 blur-lg" style={{ background: hex(sky.aurora1) }} />
          <span aria-hidden className="absolute left-[38%] top-[70%] h-[7%] w-[22%] rounded-full opacity-70 blur-md" style={{ background: hex(sky.horizon) }} />
        </>
      )}
      {(sky.id === 'storm' || sky.id === 'thunder') && (
        <div aria-hidden className={cx('absolute inset-x-0 top-0 h-[36%] opacity-80 blur-xl [background:radial-gradient(50%_100%_at_50%_0%,rgb(14_12_24/0.9),transparent)]', moving && 'animate-flash')} />
      )}
      {sky.id === 'nebula' && (
        <div aria-hidden className="absolute left-[12%] top-[10%] h-[38%] w-[30%] rounded-full opacity-60 blur-2xl [background:radial-gradient(closest-side,rgba(255,110,220,0.55),transparent)]" />
      )}
      {sky.id === 'polar' && (
        <div aria-hidden className="absolute left-[18%] top-[4%] h-[40%] w-[30%] rotate-[14deg] rounded-full opacity-70 blur-xl [background:linear-gradient(180deg,rgba(120,255,220,0.5),transparent)]" />
      )}
      {sky.id === 'aquarell' && (
        <>
          <div aria-hidden className="absolute left-[10%] top-[30%] size-[22%] rounded-full opacity-60 blur-2xl [background:radial-gradient(closest-side,#ffc2dc,transparent)]" />
          <div aria-hidden className="absolute right-[14%] top-[20%] size-[26%] rounded-full opacity-50 blur-2xl [background:radial-gradient(closest-side,#bfe6ff,transparent)]" />
          <div aria-hidden className="absolute left-[46%] top-[52%] size-[18%] rounded-full opacity-50 blur-2xl [background:radial-gradient(closest-side,#ffe6b3,transparent)]" />
        </>
      )}

      {/* Aurora ribbons in the preset's real aurora colours */}
      {sky.aurora && ((sky.aurora1 !== 0 || sky.aurora2 !== 0)) && (
        <div aria-hidden className="absolute inset-0" style={{ filter }}>
          <div aria-hidden className={cx('absolute left-[4%] top-[4%] h-[34%] w-[34%] rounded-full opacity-60 blur-2xl', moving && 'animate-aurora-a')} style={{ background: `radial-gradient(closest-side,${hex(sky.aurora1)}99,transparent)` }} />
          <div aria-hidden className={cx('absolute left-[42%] top-[0%] h-[40%] w-[30%] -rotate-12 rounded-full opacity-55 blur-2xl', moving && 'animate-aurora-b')} style={{ background: `radial-gradient(closest-side,${hex(sky.aurora2)}88,transparent)` }} />
          <div aria-hidden className={cx('absolute left-[68%] top-[12%] h-[30%] w-[26%] rounded-full opacity-45 blur-2xl', moving && 'animate-aurora-c')} style={{ background: `radial-gradient(closest-side,${hex(sky.aurora1 || sky.aurora2)}77,transparent)` }} />
        </div>
      )}

      {/* Stars, scaled by the preset's star density */}
      {sky.stars > 0 && (
        <div aria-hidden className="absolute inset-0" style={{ opacity: Math.min(1, sky.stars) }}>
          {STARS.slice(0, Math.round(sky.stars * 55)).map((s, i) => (
            <span
              key={i}
              className={cx('absolute rounded-full bg-white', moving && 'animate-twinkle')}
              style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
            />
          ))}
        </div>
      )}

      {/* Moon disc in the preset's own moon colour */}
      {sky.moon !== 0 && (
        <span
          aria-hidden
          className="absolute right-[14%] top-[16%] size-[13%] rounded-full"
          style={{ background: hex(sky.moon), boxShadow: `0 0 42px 10px ${hex(sky.moon)}66` }}
        />
      )}

      {/* Shooting stars */}
      {sky.shooting && moving && (
        <>
          <span aria-hidden className="animate-shoot absolute left-[12%] top-[14%] h-px w-[9%] rotate-[24deg] bg-gradient-to-r from-white to-transparent" />
          <span aria-hidden className="animate-shoot absolute left-[64%] top-[8%] h-px w-[7%] rotate-[24deg] bg-gradient-to-r from-white to-transparent [animation-delay:2.6s]" />
        </>
      )}

      {/* Lightning flash for storms */}
      {moving && sky.weather === 'thunder' && (
        <div aria-hidden className="animate-flash absolute inset-0 bg-[#cfe3ff]" />
      )}

      {/* Weather particles */}
      {showWeather && (
        <div aria-hidden className="absolute inset-0" style={{ filter }}>
          <Particles kind={sky.weather} amount={1} speed={1} />
        </div>
      )}
    </div>
  )
}
