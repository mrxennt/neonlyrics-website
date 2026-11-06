import { AnimatePresence, motion } from 'motion/react'
import { Bookmark, Music2, Pause, Play, RotateCcw, SkipBack, SkipForward, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { SkyThumb, hex } from '../components/SkyThumb'
import { cx } from '../lib/cx'
import { getSky, PALETTES, demoSong, type SkySettings } from '../content'
import { ConfigPreview } from './ConfigPreview'

// The demo follows LyricsProvider.demo() exactly: first line at 1.5 s, one
// line every 3.4 s, then a 1.5 s gap. Word karaoke is spread evenly across
// each line — the mod's demo lines have no enhanced word tags either.
const LINE_S = demoSong.lineMs / 1000
const FIRST_S = demoSong.firstMs / 1000
const TAIL_S = 1.5

type Slot = { index: number; start: number; end: number; words: string[]; spans: number[] }

function buildSchedule(lines: string[]): { schedule: Slot[]; total: number } {
  let t = FIRST_S
  const schedule: Slot[] = lines.map((line, index) => {
    const words = line.split(' ')
    const per = LINE_S / words.length
    const spans: number[] = []
    for (let w = 0; w < words.length; w++) spans.push(t + w * per)
    const start = t
    t += LINE_S
    return { index, start, end: start + LINE_S, words, spans }
  })
  t += TAIL_S
  return { schedule, total: Math.max(t - TAIL_S + 1.6, 1) }
}

// FloatWords.java splits a line into chunks, glues words of three letters or
// fewer to the next one, strips punctuation and uppercases the result.
const cleanWord = (w: string) => w.replace(/[^\p{L}\p{N}*']/gu, '')

type FloatChunk = { text: string; first: number }

function chunksOf(line: Slot): FloatChunk[] {
  const chunks: FloatChunk[] = []
  let i = 0
  while (i < line.words.length) {
    const a = cleanWord(line.words[i])
    if (!a) {
      i++
      continue
    }
    let text = a
    let used = 1
    if (a.length <= 3 && i + 1 < line.words.length) {
      const b = cleanWord(line.words[i + 1])
      if (b) {
        text = `${a} ${b}`
        used = 2
      }
    }
    chunks.push({ text: text.toUpperCase(), first: i })
    i += used
  }
  return chunks
}

// FloatWords' slots span ±26° across and ±16° up/down; mapped into the frame
// they stay in the open middle band, clear of the island and the hotbar.
const FLOAT_SLOTS = [
  { x: 25, y: 40 },
  { x: 72, y: 51 },
  { x: 46, y: 68 },
  { x: 65, y: 33 },
  { x: 18, y: 60 },
  { x: 55, y: 29 },
  { x: 35, y: 55 },
  { x: 81, y: 41 },
  { x: 60, y: 71 },
  { x: 21, y: 71 },
  { x: 43, y: 32 },
  { x: 78, y: 63 },
] as const

function wordHash(a: number, b: number) {
  let h = 2166136261
  h = Math.imul(h ^ a, 16777619)
  h = Math.imul(h ^ b, 16777619)
  return h >>> 0
}

// Assign every line a set of slots that the line before it is not using, so
// the outgoing words and the new ones never sit on top of each other.
function slotMap(schedule: Slot[]): number[][] {
  let taken = new Set<number>()
  return schedule.map((line) => {
    const used = new Set<number>()
    const slots = chunksOf(line).map((_, ci) => {
      const start = wordHash(line.index + 1, ci + 3) % FLOAT_SLOTS.length
      let slot = -1
      for (let step = 0; step < FLOAT_SLOTS.length; step++) {
        const candidate = (start + step) % FLOAT_SLOTS.length
        if (!taken.has(candidate) && !used.has(candidate)) {
          slot = candidate
          break
        }
      }
      if (slot < 0) slot = (start + ci) % FLOAT_SLOTS.length
      used.add(slot)
      return slot
    })
    taken = used
    return slots
  })
}

// Deterministic vanilla stars for the 'sky disabled' fallback.
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

type Props = {
  settings: SkySettings
  setSettings: (update: (s: SkySettings) => SkySettings) => void
  playing: boolean
  setPlaying: (v: boolean) => void
  restart: number
  nextSong: (backwards?: boolean) => void
  onRestart: () => void
}

export function SkyShowcase({ settings, setSettings, playing, setPlaying, restart, nextSong, onRestart }: Props) {
  const { schedule, total } = useMemo(() => buildSchedule(demoSong.lines), [])
  const [time, setTime] = useState(0)
  const [flashIntro, setFlashIntro] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [saved, setSaved] = useState(false)
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

  // In game the menu opens with J and closes with Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Don't steal keys while typing. Sliders and checkboxes are inputs too,
      // but J / Esc must keep working while one of them has focus.
      const el = e.target as HTMLElement | null
      const typing =
        !!el &&
        (el.tagName === 'TEXTAREA' ||
          el.isContentEditable ||
          (el.tagName === 'INPUT' && !['range', 'checkbox', 'radio', 'button', 'submit', 'reset'].includes((el as HTMLInputElement).type)))
      if (typing) return
      if (e.key === 'j' || e.key === 'J') {
        e.preventDefault()
        setMenuOpen((v) => !v)
      } else if (e.key === 'Escape') {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!saved) return
    const t = setTimeout(() => setSaved(false), 1600)
    return () => clearTimeout(t)
  }, [saved])

  const shown = settings.demo && settings.lines
  // Like in game: a positive offset shows lyrics later, so we evaluate the
  // karaoke at (time - offset).
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
  const sizeCqw = (Math.max(40, settings.size) / 100) * 2.4
  const opacity = Math.max(0.2, settings.opacity / 100)
  const animKey = (['fade', 'pop', 'slide'] as const)[settings.anim]
  const paletteFilter = PALETTES.find((p) => p.key === settings.palette)?.filter ?? 'none'
  const glowPx = settings.glow ? Math.round(10 + 16 * (settings.glowStrength / 100)) : 0
  const glowSpread = settings.glow ? Math.round(20 + 26 * (settings.glowStrength / 100)) : 0
  const skyStyle = settings.kind === 'sky'
  const floatSlots = useMemo(() => slotMap(schedule), [schedule])

  // The mod's World style is FloatWords: one billboard per word chunk, placed
  // around the view as it is sung, with the previous line fading out.
  const floating = useMemo(() => {
    type FloatWord = { key: string; text: string; x: number; y: number; scale: number; rx: number; ry: number; rz: number; fade: number }
    if (settings.kind !== 'world' || !shown || !current) return [] as FloatWord[]
    const words: FloatWord[] = []
    const add = (line: Slot, fade: number, all: boolean) => {
      chunksOf(line).forEach((chunk, ci) => {
        if (!all && songTime < line.spans[chunk.first]) return
        const slot = FLOAT_SLOTS[floatSlots[line.index]?.[ci] ?? ci % FLOAT_SLOTS.length]
        const h = wordHash(line.index + 1, chunk.first + 7)
        words.push({
          key: `${line.index}-${chunk.first}`,
          text: chunk.text,
          x: slot.x + ((h % 5) - 2) * 1.1,
          y: slot.y + (((h >>> 3) % 5) - 2) * 1.2,
          scale: 0.86 + (((h >>> 6) % 100) / 100) * 0.42,
          rx: (((h >>> 10) % 11) - 5) * 1.1,
          ry: (((h >>> 14) % 13) - 6) * 1.3,
          rz: (((h >>> 18) % 15) - 7) * 1.4,
          fade,
        })
      })
    }
    const prev = current.index > 0 ? schedule[current.index - 1] : null
    if (prev) {
      const k = Math.min(1, Math.max(0, (songTime - current.start) / 2.2))
      if (k < 1) add(prev, 1 - k * k, true)
    }
    add(current, 1, false)
    return words
  }, [current, floatSlots, schedule, settings.kind, shown, songTime])

  const closeMenu = () => setMenuOpen(false)

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

  const inlineWords = (line: Slot) =>
    line.words.map((w, i) => {
      const sung = songTime >= (line.spans[i + 1] ?? line.end)
      const active = songTime >= line.spans[i] && !sung
      return (
        <span
          key={`${line.index}-${i}`}
          className="transition-colors duration-150"
          style={active ? { color: lyricHex, textShadow: `0 0 ${glowPx}px ${lyricHex}` } : sung ? { color: '#fff' } : { color: 'rgb(255 255 255 / 0.35)' }}
        >
          {w}{' '}
        </span>
      )
    })

  const barDepth = { textShadow: `0 0 ${glowPx}px ${lyricHex}, 0 0 ${glowSpread}px ${lyricHex}88` } as const

  return (
    <section id="sky" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Live in-game preview"
          title="The mod, running right here"
          description="The real sky render, the real HUD and the mod's demo lyrics — with the in-game menu built into the frame. Press J (or the button above) to open it and switch the lyrics style between World and Sky while the scene keeps playing."
        />

        <Reveal className="mt-10">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex h-10 items-center gap-2 rounded-control bg-white px-4 text-[14px] font-semibold text-[#16121d] transition-transform hover:scale-[1.02]"
              >
                <SlidersHorizontal className="size-4" />
                {menuOpen ? 'Close in-game menu' : 'Open in-game menu'}
                <kbd className="rounded-[5px] bg-black/10 px-1.5 py-0.5 font-mono text-[11px] font-medium">J</kbd>
              </button>
              <p className="text-[12px] text-faint">Esc closes · every change applies live</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[12px] text-faint">Lyrics style</span>
              <div role="group" aria-label="Lyrics style" className="flex rounded-full bg-white/[0.06] p-1">
                {(['world', 'sky'] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={settings.kind === k}
                    onClick={() => setSettings((s) => ({ ...s, kind: k }))}
                    className={cx(
                      'h-7 rounded-full px-3 text-[12px] capitalize transition-colors',
                      settings.kind === k ? 'bg-white font-semibold text-[#16121d]' : 'text-muted hover:text-fg',
                    )}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* The frame */}
          <div className="depth relative overflow-hidden rounded-card bg-[#0a0714] shadow-glow">
            <div className="relative aspect-16/9 [container-type:inline-size]">
              {/* Real sky render */}
              {settings.skyEnabled ? (
                <SkyThumb skyIndex={settings.sky} palette={settings.palette} moving />
              ) : (
                <div aria-hidden className="absolute inset-0 [background:linear-gradient(180deg,#05070f_0%,#0a1020_55%,#101a30_100%)]">
                  {STARS.slice(0, 40).map((st, i) => (
                    <span
                      key={i}
                      className={cx('absolute rounded-full bg-white/80', playing && 'animate-twinkle')}
                      style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.size, height: st.size, animationDelay: `${st.delay}s`, animationDuration: `${st.dur}s` }}
                    />
                  ))}
                </div>
              )}

              {/* ---------------- HUD (menu closed) ---------------- */}
              {!menuOpen && (
                <>
                  {settings.skyMusic && shown && current && (
                    <div
                      aria-hidden
                      className={cx('absolute inset-x-0 h-[38%] rounded-full', playing && 'animate-beat', skyStyle ? 'top-[12%]' : 'top-[26%]')}
                      style={{
                        background: `radial-gradient(50% 60% at 50% 50%, ${lyricHex}22, transparent 70%)`,
                        filter: paletteFilter === 'none' ? undefined : paletteFilter,
                        transformOrigin: 'center',
                      }}
                    />
                  )}

                  {/* Top bar island: clock · cover · lyric/song · eq · ping */}
                  {settings.topBar && (
                    <div className="absolute inset-x-0 top-[3%] flex items-center justify-center gap-[1.2cqw] px-[3%]">
                      {settings.clock && (
                        <span className="hidden text-[clamp(9px,1.05cqw,12px)] font-medium text-white/95 drop-shadow-[0_1px_2px_rgb(0_0_0/0.8)] sm:block" style={{ fontFamily: 'Google Sans, sans-serif' }}>
                          21:47
                        </span>
                      )}

                      <div
                        className="flex h-[clamp(26px,4.3cqw,44px)] w-full max-w-[min(46cqw,440px)] items-center gap-[0.9cqw] rounded-full border border-[#b99ff0]/40 bg-[#151517]/95 px-[0.8cqw] shadow-[0_6px_20px_-6px_rgb(0_0_0/0.9)]"
                        style={{ backdropFilter: 'blur(6px)' }}
                      >
                        {/* Cover */}
                        <span className="grid aspect-square h-[74%] shrink-0 place-items-center rounded-[6px] bg-[#2a2533] ring-1 ring-white/10">
                          <Music2 className="size-[45%] text-white/35" />
                        </span>

                        <span className="min-w-0 flex-1 truncate text-left">
                          {settings.lyricsInBar && current ? (
                            <span className="text-[clamp(9px,1.55cqw,16px)] font-medium leading-none" style={{ fontFamily: `'${settings.font}', sans-serif`, ...barDepth }}>
                              {inlineWords(current)}
                            </span>
                          ) : (
                            <span className="block truncate text-[clamp(9px,1.55cqw,16px)] font-semibold leading-none text-white/95" style={{ fontFamily: `'${settings.font}', sans-serif` }}>
                              {demoSong.title} <span className="font-normal text-white/40">·</span> {demoSong.artist}
                            </span>
                          )}
                        </span>

                        {/* Equalizer */}
                        <span aria-hidden className="flex h-[52%] items-end gap-[2px]">
                          {[0.9, 0.55, 1.15, 0.7, 1.0].map((d, i) => (
                            <span
                              key={i}
                              className={cx('animate-eq w-[2px] origin-bottom rounded-full bg-white/85', !playing && 'scale-y-50')}
                              style={{ height: '100%', animationDelay: `${d * 0.21}s`, animationDuration: `${d}s` }}
                            />
                          ))}
                        </span>
                      </div>

                      {settings.ping && (
                        <span className="hidden items-center gap-1.5 text-white/95 sm:flex">
                          <span className="text-[clamp(9px,1.05cqw,12px)] font-medium drop-shadow-[0_1px_2px_rgb(0_0_0/0.8)]">23 ms</span>
                          <span aria-hidden className="flex items-end gap-[2px]">
                            {[2, 4, 6, 8].map((h, i) => (
                              <span key={i} className={cx('w-[2px] rounded-[1px] bg-white', i < 3 ? 'opacity-95' : 'opacity-25')} style={{ height: h }} />
                            ))}
                          </span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sky style: one line painted high over the world. */}
                  {shown && current && skyStyle && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-[18%] h-[38%] bg-[radial-gradient(70%_100%_at_50%_50%,rgb(3_2_8/0.5),transparent_72%)]"
                    />
                  )}

                  {/* World style: the mod's floating words — each chunk is its own
                      billboard in front of you, like FloatWords.java. */}
                  {shown && current && !skyStyle && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(60%_55%_at_50%_52%,rgb(3_2_8/0.2),transparent_75%)]"
                    >
                      {floating.map((f) => (
                        <div
                          key={f.key}
                          className="absolute"
                          style={{
                            left: `${f.x}%`,
                            top: `${f.y}%`,
                            opacity: Math.max(0, Math.min(1, f.fade)) * opacity,
                            transform: 'translate(-50%, -50%)',
                          }}
                        >
                          <div className="animate-word-in">
                            <div className={playing ? 'animate-float' : ''} style={{ animationDelay: `${(f.x % 5) * 0.37}s` }}>
                              <span
                                className="block whitespace-nowrap font-semibold uppercase leading-none"
                                style={{
                                  fontFamily: `'${settings.font}', sans-serif`,
                                  fontSize: `clamp(12px, ${sizeCqw * f.scale * 0.78}cqw, 42px)`,
                                  letterSpacing: '0.02em',
                                  color: '#fff',
                                  textShadow: settings.glow
                                    ? `0 2px 6px rgb(0 0 0 / 0.8), 0 0 ${glowPx}px ${lyricHex}, 0 0 ${glowSpread}px ${lyricHex}66`
                                    : '0 2px 6px rgb(0 0 0 / 0.8)',
                                  transform: `perspective(600px) rotateX(${f.rx}deg) rotateY(${f.ry}deg) rotateZ(${f.rz}deg)`,
                                }}
                              >
                                {f.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Sky style: the karaoke line itself. */}
                  {shown && current && skyStyle && (
                    <div className="absolute inset-x-0 top-[26%] px-5 text-center" style={{ perspective: 700 }}>
                      <div className="relative mx-auto max-w-[92%]" style={{ minHeight: `calc(clamp(15px, ${sizeCqw}cqw, 46px) * 2.2)` }}>
                        <AnimatePresence>
                          <motion.p
                            key={current.index}
                            {...animVariants[animKey]}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="absolute inset-x-0 top-0 flex flex-wrap items-baseline justify-center gap-x-[0.28em] gap-y-1 font-semibold leading-[1.15] [transform-style:preserve-3d]"
                            style={{
                              fontFamily: `'${settings.font}', sans-serif`,
                              fontSize: `clamp(15px, ${sizeCqw * 1.12}cqw, 52px)`,
                              opacity,
                            }}
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
                    </div>
                  )}

                  {/* Nothing playing */}
                  {!settings.demo && (
                    <div className="absolute inset-0 grid place-items-center px-6 text-center">
                      <p className="max-w-sm text-[clamp(12px,1.6cqw,16px)] text-white/70">
                        Nothing playing
                        <span className="mt-1 block text-[clamp(10px,1.15cqw,12px)] text-white/40">
                          Flip “Demo lyrics” on the Spotify page in the menu — press J.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Song intro */}
                  <AnimatePresence>
                    {flashIntro && settings.intro && (
                      <motion.p
                        key="intro"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.06 }}
                        transition={{ duration: 0.5 }}
                        className="pointer-events-none absolute inset-x-0 top-[24%] text-center font-semibold"
                        style={{ fontFamily: `'${settings.skyFont}', sans-serif`, fontSize: `clamp(22px, ${sizeCqw * 1.25}cqw, 58px)` }}
                      >
                        ♪ {demoSong.title}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Glass hotbar */}
                  {settings.hotbar && (
                    <div className="absolute inset-x-0 bottom-[3%] flex justify-center">
                      <div className="flex gap-[0.35cqw] rounded-[6px] bg-black/45 p-[0.35cqw] backdrop-blur-md">
                        {Array.from({ length: 9 }, (_, i) => (
                          <span
                            key={i}
                            className={cx('block aspect-square w-[clamp(20px,3.1cqw,32px)] rounded-[4px]', i === 0 ? 'bg-white/20 ring-1 ring-white/50' : 'bg-white/[0.07] ring-1 ring-white/10')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ---------------- In-game config screen (menu open) ---------------- */}
              {menuOpen && (
                <>
                  <div className="absolute inset-0 z-10 bg-black/30" onClick={closeMenu} aria-hidden />

                  {/* Stage on the left, exactly like the config screen's preview:
                      cover + vinyl, title, artist, karaoke lines, eq, transport. */}
                  <div className="absolute inset-y-0 left-0 z-20 hidden w-[30%] flex-col justify-center gap-[2.4cqw] pl-[3.5%] pr-[1%] sm:flex">
                    <div className="relative">
                      <span
                        className="absolute left-[58%] top-1/2 aspect-square w-[86%] -translate-y-1/2 rounded-full bg-[#0e0b16] ring-1 ring-white/10"
                        style={{ backgroundImage: 'repeating-radial-gradient(circle at 50% 50%, #0e0b16 0 5px, #15111d 5px 6px)' }}
                      >
                        <span className={cx('absolute inset-0 grid place-items-center', playing && 'animate-spin-slow')}>
                          <span className="absolute w-[30%] aspect-square rounded-full bg-[#1d1826] ring-2 ring-white/10" />
                          <span className="absolute right-[14%] top-1/2 size-[6px] -translate-y-1/2 rounded-full bg-white/80" />
                        </span>
                      </span>
                      <span className="relative z-10 block aspect-square w-[58%] max-w-[148px] rounded-[9px] bg-[#1e1a24] ring-1 ring-white/10">
                        <Music2 className="absolute left-1/2 top-1/2 w-[30%] -translate-x-1/2 -translate-y-1/2 text-white/25" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white" style={{ fontFamily: 'Google Sans, sans-serif', fontSize: 'clamp(12px, 1.9cqw, 20px)' }}>
                        {demoSong.title}
                      </p>
                      <p className="truncate text-white/55" style={{ fontFamily: 'Google Sans, sans-serif', fontSize: 'clamp(10px, 1.35cqw, 14px)' }}>
                        {demoSong.artist}
                      </p>
                      <div className="mt-[1.2cqw] min-h-[2.6em] text-left leading-snug" style={{ fontFamily: `'${settings.font}', sans-serif`, fontSize: 'clamp(10px, 1.5cqw, 15px)' }}>
                        {current ? inlineWords(current) : <span className="text-white/40">Nothing playing</span>}
                      </div>
                      {next && (
                        <p className="truncate text-left text-white/35" style={{ fontFamily: `'${settings.font}', sans-serif`, fontSize: 'clamp(9px, 1.2cqw, 13px)' }}>
                          {next.words.join(' ')}
                        </p>
                      )}
                    </div>

                    {/* Equalizer + transport, like the stage */}
                    <div className="flex items-end gap-[1.8cqw]">
                      <span aria-hidden className="flex h-[clamp(18px,3.4cqw,34px)] flex-1 items-end gap-[2px]">
                        {Array.from({ length: 28 }, (_, i) => (
                          <span
                            key={i}
                            className={cx('w-[2px] origin-bottom rounded-full bg-white/85', playing && 'animate-eq')}
                            style={{ height: `${30 + ((i * 7) % 60)}%`, animationDelay: `${(i % 7) * 0.13}s`, animationDuration: `${0.7 + (i % 5) * 0.14}s` }}
                          />
                        ))}
                      </span>
                      <span className="flex items-center gap-[0.6cqw]">
                        <button type="button" aria-label="Previous song" onClick={() => nextSong(true)} className="grid size-[clamp(22px,3cqw,30px)] place-items-center rounded-full bg-white/[0.07] text-white/80 transition-colors hover:bg-white/15">
                          <SkipBack className="size-[55%]" />
                        </button>
                        <button type="button" aria-label="Play or pause" onClick={() => setPlaying(!playing)} className="grid size-[clamp(28px,3.8cqw,38px)] place-items-center rounded-full bg-white text-[#16121d]">
                          {playing ? <Pause className="size-[45%]" /> : <Play className="size-[45%] translate-x-[4%]" />}
                        </button>
                        <button type="button" aria-label="Next song" onClick={() => nextSong(false)} className="grid size-[clamp(22px,3cqw,30px)] place-items-center rounded-full bg-white/[0.07] text-white/80 transition-colors hover:bg-white/15">
                          <SkipForward className="size-[55%]" />
                        </button>
                        <button type="button" aria-label="Save this line" onClick={() => setSaved(true)} className="grid size-[clamp(22px,3cqw,30px)] place-items-center rounded-full bg-white/[0.07] text-white/80 transition-colors hover:bg-white/15">
                          <Bookmark className={cx('size-[50%]', saved && 'fill-current text-white')} />
                        </button>
                      </span>
                    </div>
                  </div>

                  {/* The config menu itself, embedded */}
                  <div className="absolute inset-y-0 right-0 z-30 w-full shadow-[-30px_0_80px_-30px_rgb(0_0_0/0.9)] sm:w-[72%]">
                    <ConfigPreview
                      settings={settings}
                      setSettings={setSettings}
                      onRestart={onRestart}
                      embedded
                      onClose={closeMenu}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Controls under the frame */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPlaying(!playing)}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-white/[0.07] px-4 text-[14px] text-fg transition-colors hover:bg-white/[0.12]"
            >
              {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playing ? 'Pause demo' : 'Play demo'}
            </button>
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="inline-flex h-10 items-center gap-2 rounded-control bg-white/[0.07] px-4 text-[14px] text-fg transition-colors hover:bg-white/[0.12]"
            >
              <RotateCcw className="size-4" />
              Restart
            </button>
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            <p className="text-[13px] text-faint">
              <span className="text-fg/80">{settings.skyEnabled ? sky.name : 'Sky off'}</span> · {settings.kind === 'sky' ? 'Sky lyrics' : 'World lyrics'} ·{' '}
              <button type="button" onClick={() => setMenuOpen(true)} className="text-accent underline decoration-line hover:text-fg">
                open the menu
              </button>{' '}
              to change it
            </p>
          </div>
          <p className="mt-3 text-center text-[12px] text-faint">
            Demo track: the mod&apos;s built-in test lyrics (“Neon Nights (Demo)” by “Lyrics Cord”) — original text from the mod source. The background is the mod&apos;s own sky render.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
