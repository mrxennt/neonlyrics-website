import { AnimatePresence, motion } from 'motion/react'
import { Music2, Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '../components/Button'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { cx } from '../lib/cx'
import { demoSong, skyPresets, type SkyPreset, type SkySettings } from '../content'
import type { CSSProperties } from 'react'

// ---- Demo-timing model -----------------------------------------------------
// A small local loop stands in for the mod's audio sync: each word lights up
// on a fixed beat so the karaoke preview can run offline, with no audio file.
const WORD = 0.36
const GAP = 0.16
const LINE_PAUSE = 1.1

type WordSlot = { text: string; start: number; end: number }
type LineSlot = { index: number; start: number; end: number; words: WordSlot[] }

function buildSchedule(lines: string[]) {
  let t = 0
  const schedule: LineSlot[] = lines.map((line, index) => {
    const words: WordSlot[] = []
    for (const w of line.split(' ')) {
      words.push({ text: w, start: t, end: t + WORD })
      t += WORD + GAP
    }
    const slot = { index, start: words[0].start, end: words[words.length - 1].end, words }
    t += LINE_PAUSE
    return slot
  })
  return { schedule, total: Math.max(t - LINE_PAUSE + 1.6, 1) }
}

// ---- Scene details ----------------------------------------------------------
// Deterministic pseudo-random props so the star field and skyline render the
// same on every mount without a seed library.
const stars = Array.from({ length: 72 }, (_, i) => ({
  left: (i * 37) % 100,
  top: (i * 23) % 58,
  size: 1 + ((i * 7) % 3),
  delay: ((i * 13) % 34) / 10,
  dur: 2.2 + (i % 5) * 0.7,
}))

const buildings = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 100) / 22,
  w: 3.2 + ((i * 17) % 3),
  h: 5 + ((i * 29) % 17),
}))

const pines = Array.from({ length: 13 }, (_, i) => ({ x: i * 8.4, h: 14 + ((i * 19) % 16) }))

function pineClip() {
  const parts: string[] = ['0% 100%']
  for (const p of pines) {
    parts.push(`${p.x}% ${100 - p.h}%`)
    parts.push(`${p.x + 2.4}% 86%`)
    parts.push(`${p.x + 4.8}% ${100 - p.h + 4}%`)
    parts.push(`${p.x + 7.2}% 88%`)
  }
  parts.push('100% 100%')
  return `polygon(${parts.join(',')})`
}

const presetBackdrop: Record<SkyPreset, string> = {
  synthwave: 'linear-gradient(180deg, #0a0714 0%, #190b33 34%, #43145f 58%, #8a2160 74%, #ff5b8d 100%)',
  aurora: 'linear-gradient(180deg, #020712 0%, #05182b 52%, #071f22 78%, #0b2f2a 100%)',
  nebula: 'linear-gradient(180deg, #03030f 0%, #0a0a2e 45%, #161038 72%, #241147 100%)',
}

type Props = { settings: SkySettings; onPreset: (p: SkyPreset) => void }

export function SkyShowcase({ settings, onPreset }: Props) {
  const { schedule, total } = useMemo(() => buildSchedule(demoSong.lyrics), [])
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)

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

  // Which line is cuing right now — the last one that has started.
  const current = useMemo(() => {
    let idx = 0
    for (let i = 0; i < schedule.length; i++) if (time >= schedule[i].start) idx = i
    return schedule[idx]
  }, [time, schedule])
  const next = schedule[(current.index + 1) % schedule.length]

  const size = 46 * (settings.lyricSize / 100)
  const opacity = 0.3 + (0.7 * (settings.lyricOpacity / 100))

  const wordClass = (w: WordSlot) => {
    if (!settings.karaoke) return 'text-fg'
    const sung = time >= w.end
    const active = time >= w.start && time < w.end
    if (active) return 'text-fg'
    if (sung) return 'text-accent-2'
    return 'text-fg/40'
  }
  // Neon glow, like the mod's "line glow": the active word gets a magenta
  // halo, everything already sung keeps a softer cyan one while karaoke is on.
  const wordGlow = (w: WordSlot) => {
    const active = time >= w.start && time < w.end
    const sung = time >= w.end
    if (active) return { ['--neon-c' as string]: 'var(--color-accent)' } as CSSProperties
    if (settings.karaoke && sung) return { ['--neon-c' as string]: 'var(--color-accent-2)' } as CSSProperties
    return undefined
  }
  const wordNeon = (w: WordSlot) => {
    if (settings.lineGlow) return true
    if (settings.karaoke) return time >= w.start
    return false
  }

  return (
    <section id="sky" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Lyrics in the sky"
          title="What you will see in the world"
          description="This is the 3D world lyric layer with word-level karaoke, synced to the demo track below. The settings you change in the GUI preview further down update this scene live."
        />

        <Reveal className="mt-12">
          <div className="depth relative mx-auto overflow-hidden rounded-card bg-[#0a0714] shadow-glow">
            {/* Sky backdrop per preset */}
            <div className="relative aspect-16/9 sm:aspect-21/9">
              <div
                aria-hidden
                className="absolute inset-0 transition-[background] duration-700"
                style={{ background: presetBackdrop[settings.preset] }}
              >
                {settings.preset === 'synthwave' && (
                  <>
                    <div
                      aria-hidden
                      className="absolute left-1/2 top-[52%] size-[34%] -translate-x-1/2 rounded-full animate-float [background:linear-gradient(180deg,#ffd166_10%,#ff5b8d_60%,#ff4fd8_100%)] [box-shadow:0_0_80px_30px_rgb(255_91_141/0.35)]"
                    />
                    <div
                      aria-hidden
                      className="retro-grid animate-grid absolute inset-x-[-30%] bottom-0 top-[72%] [transform:perspective(340px)_rotateX(58deg)] [transform-origin:top]"
                    />
                  </>
                )}
                {settings.preset === 'aurora' && (
                  <>
                    <div aria-hidden className="animate-aurora-a absolute left-[8%] top-[6%] h-[42%] w-[36%] rounded-full bg-accent-2/25 blur-2xl" />
                    <div aria-hidden className="animate-aurora-b absolute left-[38%] top-[2%] h-[50%] w-[30%] rounded-full bg-accent-3/25 blur-2xl" />
                    <div aria-hidden className="animate-aurora-c absolute left-[62%] top-[10%] h-[40%] w-[28%] rounded-full bg-accent/20 blur-2xl" />
                  </>
                )}
                {settings.preset === 'nebula' && (
                  <>
                    <div aria-hidden className="animate-aurora-a absolute left-[16%] top-[8%] h-[46%] w-[30%] rounded-full [background:radial-gradient(closest-side,rgb(255_79_216/0.4),transparent)] blur-2xl" />
                    <div aria-hidden className="animate-aurora-c absolute left-[55%] top-[14%] h-[44%] w-[34%] rounded-full [background:radial-gradient(closest-side,rgb(95_243_255/0.28),transparent)] blur-2xl" />
                    <div aria-hidden className="animate-aurora-b absolute left-[6%] top-[34%] h-[30%] w-[22%] rounded-full [background:radial-gradient(closest-side,rgb(167_139_255/0.3),transparent)] blur-2xl" />
                  </>
                )}
              </div>

              {/* Stars */}
              <div aria-hidden className="absolute inset-0">
                {stars.map((s, i) => (
                  <span
                    key={i}
                    className="animate-twinkle absolute rounded-full bg-fg"
                    style={{
                      left: `${s.left}%`,
                      top: `${s.top}%`,
                      width: s.size,
                      height: s.size,
                      animationDelay: `${s.delay}s`,
                      animationDuration: `${s.dur}s`,
                      animationPlayState: playing ? 'running' : 'paused',
                    }}
                  />
                ))}
              </div>

              {/* Ground: buildings or pines, fog-faded onto the sky */}
              <div aria-hidden className={cx('absolute inset-x-0 bottom-0', settings.fogFade && 'brightness-125 saturate-75')}>
                {settings.preset === 'aurora' ? (
                  <div className="ground-clip absolute inset-x-0 bottom-0 top-[62%] bg-[#04110d]" style={{ clipPath: pineClip() }} />
                ) : (
                  <div className="absolute inset-x-0 bottom-0 top-[70%]">
                    {buildings.map((b, i) => (
                      <span
                        key={i}
                        className="absolute bottom-0 bg-[#0b0812]"
                        style={{ left: `${b.x}%`, width: `${b.w}%`, height: `${b.h * 3}%` }}
                      />
                    ))}
                  </div>
                )}
                <div
                  className={cx('absolute inset-x-0 bottom-0 h-[26%] transition-colors duration-700', settings.fogFade ? 'bg-gradient-to-t from-black/10' : 'bg-gradient-to-t from-black/45')}
                />
              </div>

              {/* HUD lyric bar — the mod's in-game top bar */}
              <AnimatePresence>
                {settings.hudBar && (
                  <motion.div
                    key="hud"
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    className="absolute inset-x-0 top-4 flex justify-center px-4"
                  >
                    <div className="depth relative flex max-w-[92%] flex-col items-center gap-0.5 rounded-[12px] bg-black/45 px-4 py-2 text-center backdrop-blur-md">
                      <p className="truncate text-[12px] font-medium text-fg sm:text-[13px]" style={{ fontFamily: 'var(--font-display)' }}>
                        {current.words.map((w) => w.text).join(' ')}
                      </p>
                      <p className="text-[10px] text-fg/60 sm:text-[11px]">
                        NEXT · {next.words.map((w) => w.text).join(' ')}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3D world lyric layer */}
              <div className="absolute inset-x-0 top-[30%] flex flex-col items-center px-6 text-center" style={{ perspective: 900 }}>
                <AnimatePresence mode="popLayout">
                  {settings.lineAnimation && (
                    <motion.p
                      key={current.index}
                      initial={{ opacity: 0, y: 34, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -22, scale: 0.96 }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="flex flex-wrap justify-center gap-x-3 font-semibold [transform-style:preserve-3d]"
                      style={{ fontFamily: 'var(--font-display)', fontSize: Math.round(size), opacity: opacity / 100 }}
                    >
                      {current.words.map((w, i) => (
                        <motion.span
                          key={i}
                          className={cx('transition-colors duration-150', wordClass(w), wordNeon(w) && 'neon-text')}
                          style={wordGlow(w)}
                        >
                          {w.text}
                        </motion.span>
                      ))}
                    </motion.p>
                  )}
                </AnimatePresence>
                {!settings.lineAnimation &&
                  current.words.map((w, i) => (
                    <p
                      key={current.index}
                      className="flex flex-wrap justify-center gap-x-3 font-semibold"
                      style={{ fontFamily: 'var(--font-display)', fontSize: Math.round(size), opacity: opacity / 100 }}
                    >
                      <span key={i} className={cx('transition-colors duration-150', wordClass(w), wordNeon(w) && 'neon-text')} style={wordGlow(w)}>
                        {w.text}
                      </span>
                    </p>
                  ))}
              </div>

              {/* Beat glow behind the lyric row */}
              {settings.beatGlow && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-[22%] h-[34%] animate-pulse rounded-full [background:radial-gradient(50%_60%_at_50%_50%,rgb(255_79_216/0.16),transparent_70%)]"
                />
              )}

              {/* Now playing card */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-[14px] bg-black/50 p-2.5 pr-4 backdrop-blur-md">
                <span className="grid size-9 place-items-center rounded-[9px] [background:linear-gradient(135deg,#ff4fd8,#5ff3ff)]">
                  <Music2 className="size-4 text-white" />
                </span>
                <span className="block min-w-0">
                  <p className="truncate text-[13px] font-medium text-fg">{demoSong.title}</p>
                  <p className="text-[11px] text-fg/60">{demoSong.artist}</p>
                  <span className="mt-1 block h-[3px] w-36 overflow-hidden rounded-full bg-white/15">
                    <span className="block h-full rounded-full bg-accent-2" style={{ width: `${(time / total) * 100}%` }} />
                  </span>
                </span>
              </div>

              {/* Equalizer */}
              <div aria-hidden className="absolute bottom-4 right-4 flex h-8 items-end gap-1">
                {[0.9, 0.6, 1.1, 0.7, 1].map((d, i) => (
                  <span
                    key={i}
                    className="animate-eq h-full w-1 origin-bottom rounded-full bg-accent-2/80"
                    style={{ animationDelay: `${d * 0.3}s`, animationDuration: `${d}s`, animationPlayState: playing ? 'running' : 'paused' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause /> : <Play />}
              {playing ? 'Pause demo' : 'Play demo'}
            </Button>
            <Button variant="ghost" onClick={() => setTime(0)}>
              <RotateCcw />
              Restart
            </Button>
            <span className="mx-2 hidden h-6 w-px bg-line sm:block" />
            {skyPresets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onPreset(p.id)}
                className={cx(
                  'h-10 rounded-control px-4 text-[14px] transition-colors',
                  settings.preset === p.id ? 'bg-white/[0.1] text-fg' : 'text-muted hover:bg-white/[0.05] hover:text-fg',
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-center text-[12px] text-faint">
            Demo track times sit in website time, not the mod's audio sync — in game the words follow your player.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
