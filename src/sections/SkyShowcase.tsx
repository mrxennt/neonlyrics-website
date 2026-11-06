import { AnimatePresence, motion } from 'motion/react'
import { Music2, Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { SkyThumb, hex } from '../components/SkyThumb'
import { cx } from '../lib/cx'
import { getSky, PALETTES, demoSong, type SkySettings } from '../content'

// The demo follows LyricsProvider.demo() exactly: first line at 1.5 s, one
// line every 3.4 s, then a 1.5 s gap loop. Word karaoke is spread evenly
// across each line — the mod's demo lines have no enhanced word tags either.
const LINE_S = demoSong.lineMs / 1000
const FIRST_S = demoSong.firstMs / 1000
const TAIL_S = 1.5

type Slot = { index: number; start: number; end: number; words: string[]; spans: number[] }

function buildSchedule(lines: string[]): { schedule: Slot[]; total: number } {
  let t = FIRST_S
  const schedule: Slot[] = lines.map((line, index) => {
    const words = line.split(' ')
    const per = LINE_S / words.length
    const spans = []
    for (let w = 0; w < words.length; w++) {
      spans.push(t + w * per)
    }
    const start = t
    t += LINE_S
    return { index, start, end: start + LINE_S, words, spans }
  })
  t += TAIL_S
  return { schedule, total: Math.max(t - TAIL_S + 1.6, 1) }
}

// Deterministic stars for the scene backdrop (vanilla-style stars stay even
// when the custom sky is off).
const STARS = Array.from({ length: 70 }, (_, i) => {
  const a = Math.sin(i * 12.9898) * 43758.5453
  const b = Math.sin(i * 78.233) * 12345.6789
  return { left: (a - Math.floor(a)) * 100, top: (b - Math.floor(b)) * 55, size: 1 + (i % 3), delay: (i % 29) / 9, dur: 2.4 + (i % 5) * 0.6 }
})

// Line entrance variants — the mod's three real animations.
const animVariants = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0.35 } } },
  pop: { initial: { opacity: 0, scale: 1.18 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.94, transition: { duration: 0.3 } } },
  slide: { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -26, transition: { duration: 0.35 } } },
}

type Props = { settings: SkySettings; playing: boolean; setPlaying: (v: boolean) => void; restart: number; nextSong: (backwards?: boolean) => void }

export function SkyShowcase({ settings, playing, setPlaying, restart, nextSong }: Props) {
  const { schedule, total } = useMemo(() => buildSchedule(demoSong.lines), [])
  const [time, setTime] = useState(0)
  const [flashIntro, setFlashIntro] = useState(false)
  const restartRef = useRef(0)

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setTime((t) => (t + dt >= total ? 0 : t + dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, total])

  // Restart demo (Spotify page "Restart demo" / transport buttons): zero the
  // clock and flash the big song intro title, if fxSongIntro is on.
  useEffect(() => {
    if (restartRef.current === restart) return
    restartRef.current = restart
    setTime(0)
    if (settings.intro) {
      setFlashIntro(true)
      const t = setTimeout(() => setFlashIntro(false), 2600)
      return () => clearTimeout(t)
    }
  }, [restart, settings.intro])

  const shown = settings.demo && settings.lines
  // Lyrics offset, like in game: a positive offset makes lyrics show later —
  // so we evaluate the karaoke at (time - offset).
  const songTime = Math.max(0, time - settings.offset / 1000)

  const current = useMemo(() => {
    if (!shown) return null
    let idx = -1
    for (const sl of schedule) if (songTime >= sl.start) idx = sl.index
    if (idx < 0) return null
    return schedule[idx]
  }, [songTime, schedule, shown])

  const next = current ? schedule[current.index + 1] ?? null : null
  const sky = getSky(settings.sky)
  const lyricHex = hex(settings.color >= 0 ? settings.color : sky.lyricColor)
  // Font size scales with the scene (container query units) so the card looks
  // right at every width, and follows the Movie-style size slider (percent).
  const sizeCqw = (Math.max(40, settings.size) / 100) * 2.4
  const opacity = Math.max(0.2, settings.opacity / 100)
  const animKey = (['fade', 'pop', 'slide'] as const)[settings.anim]
  const paletteFilter = PALETTES.find((p) => p.key === settings.palette)?.filter ?? 'none'
  const glowPx = settings.glow ? Math.round(10 + 16 * (settings.glowStrength / 100)) : 0
  const glowSpread = settings.glow ? Math.round(20 + 26 * (settings.glowStrength / 100)) : 0

  const wordStyle = (i: number): { className: string; style?: Record<string, string> } => {
    if (!current) return { className: '' }
    const sung = songTime >= (current.spans[i + 1] ?? current.end)
    const active = songTime >= current.spans[i] && !sung
    const base = 'transition-all duration-150'
    if (active) {
      const beat = settings.beat && playing ? ' animate-beat' : ''
      return { className: cx(base, 'text-white', beat), style: { textShadow: `0 0 ${glowPx}px ${lyricHex}, 0 0 ${glowSpread}px ${lyricHex}88` } }
    }
    if (sung) {
      return {
        className: cx(base, settings.glow && 'text-white/95'),
        style: settings.glow ? { textShadow: `0 0 ${Math.round(glowPx / 2)}px ${lyricHex}55` } : undefined,
      }
    }
    return { className: cx(base, 'text-white/35') }
  }

  const barDepth = { textShadow: `0 0 ${glowPx}px ${lyricHex}, 0 0 ${glowSpread}px ${lyricHex}88` } as const

  return (
    <section id="sky" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="In-game preview"
          title="The sky demo, running on real data"
          description="This panel is the mod's demo mode — 'Demo lyrics' in the Spotify tab — painted with each sky preset's real colours, weather and lyric colour straight from SkyPreset.java. The config GUI below drives it live."
        />

        <Reveal className="mt-12">
          <div className="depth relative mx-auto overflow-hidden rounded-card bg-[#0a0714] shadow-glow">
            <div className="relative aspect-16/9 [container-type:inline-size]">
              {/* Sky: real preset data (or a plain vanilla night when off) */}
              {settings.skyEnabled ? (
                <SkyThumb skyIndex={settings.sky} palette={settings.palette} moving />
              ) : (
                <div aria-hidden className="absolute inset-0 [background:linear-gradient(180deg,#05070f_0%,#0a1020_55%,#101a30_100%)]">
                  <div aria-hidden className="absolute inset-0">
                    {STARS.slice(0, 40).map((st, i) => (
                      <span key={i} className={cx('absolute rounded-full bg-white/80', playing && 'animate-twinkle')} style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.size, height: st.size, animationDelay: `${st.delay}s`, animationDuration: `${st.dur}s` }} />
                    ))}
                  </div>
                </div>
              )}


              {/* Music-reactive glow behind the lyric row */}
              {settings.skyMusic && shown && current && (
                <div
                  aria-hidden
                  className={cx('absolute inset-x-0 top-[18%] h-[40%] rounded-full', playing && 'animate-beat')}
                  style={{
                    background: `radial-gradient(50% 60% at 50% 50%, ${lyricHex}22, transparent 70%)`,
                    filter: paletteFilter === 'none' ? undefined : paletteFilter,
                    transformOrigin: 'center',
                  }}
                />
              )}

              {/* Top bar (island) — clock, ping, and the current karaoke line */}
              {settings.topBar && shown && (
                <div className="absolute inset-x-0 top-3 flex justify-center px-4">
                  <div className="depth flex max-w-[94%] flex-col items-center gap-0.5 rounded-[12px] bg-black/45 px-4 py-1.5 text-center backdrop-blur-md">
                    <p className="text-[11px] text-fg/55">
                      {settings.clock && <>21:47</>}
                      {settings.clock && settings.ping && ' · '}
                      {settings.ping && '23 ms'}
                    </p>
                    {settings.lyricsInBar && current ? (
                      <p className="truncate text-[12px] font-medium sm:text-[13px]" style={{ fontFamily: `'${settings.font}', sans-serif`, ...barDepth }}>
                        {current.words.map((w, i) => {
                          const sung = songTime >= (current.spans[i + 1] ?? current.end)
                          return (
                            <span key={i} className={cx('transition-colors duration-150', sung ? 'text-fg' : 'text-fg/45')}>
                              {w}{' '}
                            </span>
                          )
                        })}
                      </p>
                    ) : (
                      <p className="text-[12px] font-medium text-fg/85">{demoSong.title} — {demoSong.artist}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Soft scrim keeps the lyric readable over bright skies */}
              {shown && current && (
                <div
                  aria-hidden
                  className={cx('pointer-events-none absolute inset-x-0 h-[34%] bg-[radial-gradient(70%_100%_at_50%_50%,rgb(3_2_8/0.5),transparent_72%)]', settings.kind === 'sky' ? 'top-[24%]' : 'top-[20%]')}
                />
              )}

              {/* The 3D lyric line. Lines are stacked absolutely so the outgoing
                  and incoming line cross-fade in place instead of reflowing. */}
              {shown && current && (
                <div
                  className={cx('absolute inset-x-0 z-10 px-5 text-center', settings.kind === 'sky' ? 'top-[40%]' : 'top-[33%]')}
                  style={{ perspective: 900 }}
                >
                  <div
                    className="relative mx-auto max-w-[94%]"
                    style={{ minHeight: `calc(clamp(16px, ${sizeCqw}cqw, 44px) * 2.3)` }}
                  >
                    <AnimatePresence>
                      <motion.p
                        key={current.index}
                        {...animVariants[animKey]}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-0 top-0 flex flex-wrap items-baseline justify-center gap-x-[0.28em] gap-y-1 font-semibold leading-[1.15] [transform-style:preserve-3d]"
                        style={{ fontFamily: `'${settings.font}', sans-serif`, fontSize: `clamp(16px, ${sizeCqw}cqw, 44px)`, opacity }}
                      >
                        {current.words.map((w, i) => {
                          const ws = wordStyle(i)
                          return (
                            <span key={i} className={ws.className} style={ws.style}>
                              {w}
                            </span>
                          )
                        })}
                      </motion.p>
                    </AnimatePresence>
                    {next && (
                      <p
                        className="absolute inset-x-0 -bottom-5 text-white/40 sm:-bottom-6"
                        style={{ fontFamily: `'${settings.font}', sans-serif`, fontSize: `clamp(10px, ${sizeCqw * 0.36}cqw, 16px)` }}
                      >
                        {next.words.join(' ')}
                      </p>
                    )}
                  </div>
                  {settings.translate && (
                    <p className="mt-6 text-[11px] text-white/25">Translation shows under the bar in game (fetched live)</p>
                  )}
                </div>
              )}

              {/* Not playing — honest empty state, like the real 'Nothing playing' */}
              {!shown && (
                <div className="absolute inset-0 grid place-items-center px-6 text-center">
                  <p className="max-w-sm text-[15px] text-fg/70">
                    {settings.lines ? 'Nothing playing' : 'Lyrics are off'}
                    <span className="mt-1 block text-[12px] text-faint">
                      Flip “Demo lyrics” on the Spotify page in the GUI below to watch the built-in test track.
                    </span>
                  </p>
                </div>
              )}

              {/* Song intro flash, like the mod's song title intro */}
              <AnimatePresence>
                {flashIntro && settings.intro && (
                  <motion.p
                    key="intro"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.06 }}
                    transition={{ duration: 0.5 }}
                    className="pointer-events-none absolute inset-x-0 top-[30%] text-center font-semibold"
                    style={{ fontFamily: `'${settings.skyFont}', sans-serif`, fontSize: `clamp(24px, ${sizeCqw * 1.3}cqw, 62px)` }}
                  >
                    ♪ {demoSong.title}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Glass hotbar */}
              {settings.hotbar && (
                <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center">
                  <div className="flex gap-1 rounded-[12px] bg-black/45 p-1 backdrop-blur-md">
                    {Array.from({ length: 9 }, (_, i) => (
                      <span key={i} className={cx('block size-8 rounded-[7px] sm:size-9', i === 0 ? 'bg-white/20' : 'bg-white/[0.07]')} />
                    ))}
                  </div>
                </div>
              )}

              {/* Now playing: cover card with the record disc peeking out,
                  top-left like in game. */}
              {settings.cover && (
                <div className="absolute left-4 top-14 z-20 hidden items-center sm:flex">
                  <span className="relative z-10 block size-28 rounded-[20px] bg-[#232029] shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
                    <Music2 className="absolute left-1/2 top-1/2 size-9 -translate-x-1/2 -translate-y-1/2 text-fg/25" />
                  </span>
                  <span className="relative z-0 -ml-6 grid size-24 place-items-center rounded-full bg-[#0e0b16] shadow-[0_18px_40px_-16px_rgb(0_0_0/0.9)] ring-1 ring-white/10">
                    <span className={cx('absolute inset-0 grid place-items-center', playing && 'animate-spin-slow')}>
                      <span className="absolute size-7 rounded-full bg-[#1d1826] ring-4 ring-white/10" />
                      <span className="absolute right-3 top-1/2 size-2 -translate-y-1/2 rounded-full bg-white/80" />
                    </span>
                    <span aria-hidden className="absolute -right-3 top-1/2 flex -translate-y-1/2 items-end gap-[3px]">
                      <span className={cx('h-2 w-[3px] origin-bottom rounded-full bg-white/70', playing && 'animate-eq [animation-duration:0.8s]')} />
                      <span className={cx('h-4 w-[3px] origin-bottom rounded-full bg-white/70', playing && 'animate-eq [animation-duration:1.1s]')} />
                      <span className={cx('h-3 w-[3px] origin-bottom rounded-full bg-white/70', playing && 'animate-eq [animation-duration:0.9s]')} />
                    </span>
                  </span>
                </div>
              )}

              {/* Now playing card, bottom-left */}
              {shown && (
                <div className="absolute bottom-16 left-4 flex items-center gap-3 rounded-[14px] bg-black/50 p-2.5 pr-4 backdrop-blur-md">
                  <span className="grid size-9 place-items-center rounded-[9px]" style={{ background: `linear-gradient(135deg, ${hex(sky.lyricColor)}, ${hex(sky.aurora1 || sky.horizon)})` }}>
                    <Music2 className="size-4 text-white" />
                  </span>
                  <span className="block min-w-0">
                    <p className="max-w-[220px] truncate text-[13px] font-medium text-fg">{demoSong.title}</p>
                    <p className="text-[11px] text-fg/60">{demoSong.artist}</p>
                    <span className="mt-1 block h-[3px] w-36 overflow-hidden rounded-full bg-white/15">
                      <span className="block h-full rounded-full" style={{ width: `${(time / total) * 100}%`, background: lyricHex }} />
                    </span>
                  </span>
                </div>
              )}

              {/* Transport: prev · play/pause · next, like the in-game buttons.
                  Next/prev trigger 'New song, new sky' via nextSong(). */}
              <div className="absolute bottom-4 right-4 z-20 flex items-end gap-3">
                <span aria-hidden className="flex h-6 items-end gap-1">
                  {[0.9, 0.55, 1.1, 0.4, 0.8].map((d, i) => (
                    <span
                      key={i}
                      className={cx('animate-eq h-full w-1 origin-bottom rounded-full bg-white/80', !playing && 'scale-y-50')}
                      style={{ animationDelay: `${d * 0.27}s`, animationDuration: `${d}s` }}
                    />
                  ))}
                </span>
                <button
                  type="button"
                  aria-label="Previous song"
                  onClick={() => nextSong(true)}
                  className="grid size-11 place-items-center rounded-full bg-black/40 text-fg backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  <SkipBack className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Play or pause"
                  onClick={() => setPlaying(!playing)}
                  className="grid size-14 place-items-center rounded-full bg-white text-[#16121d] shadow-[0_18px_40px_-12px_rgb(255_255_255/0.35)] transition-transform hover:scale-105"
                >
                  {playing ? <Pause className="size-6" /> : <Play className="size-6 translate-x-0.5" />}
                </button>
                <button
                  type="button"
                  aria-label="Next song"
                  onClick={() => nextSong(false)}
                  className="grid size-11 place-items-center rounded-full bg-black/40 text-fg backdrop-blur-md transition-colors hover:bg-black/60"
                >
                  <SkipForward className="size-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Scene controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-white/[0.07] px-4 text-[14px] text-fg transition-colors hover:bg-white/[0.12]"
            >
              {playing ? <Pause /> : <Play />}
              {playing ? 'Pause demo' : 'Play demo'}
            </button>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-white/[0.07] px-4 text-[14px] text-fg transition-colors hover:bg-white/[0.12]"
            >
              <RotateCcw />
              Restart
            </button>
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <p className="text-[13px] text-faint">
              Sky: <span className="text-fg/80">{settings.skyEnabled ? getSky(settings.sky).name : 'off'}</span> · Font: <span className="text-fg/80">{settings.font}</span> · pick them in the{' '}
              <a href="#gui" className="text-accent underline decoration-line hover:text-fg">
                config GUI
              </a>
            </p>
          </div>
          <p className="mt-3 text-center text-[12px] text-faint">
            Demo track: the mod&apos;s built-in test lyrics (“Neon Nights (Demo)” by “Lyrics Cord”) — original text from the mod source. In game, real songs&apos; words follow your player.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
