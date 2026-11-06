import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  ArrowUpRight,
  ListMusic,
  Monitor,
  RotateCcw,
  SlidersHorizontal,
  Sun,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { SkyThumb } from '../components/SkyThumb'
import { cx } from '../lib/cx'
import {
  ACCENTS,
  defaultSkySettings,
  FONTS,
  SKIES,
  skyCount,
  spotify,
  PALETTES,
  type SkySettings,
} from '../content'

// Sidebar order straight from the real menu (minus the Style page you asked
// to remove): Sky, Lyrics, Spotify, Display, Menu, Performance, Saved.
type PageId = 'sky' | 'lyrics' | 'spotify' | 'display' | 'menu' | 'performance' | 'saved'

const PAGES: { id: PageId; label: string; icon: ReactNode }[] = [
  { id: 'sky', label: 'Sky', icon: <Sun className="size-5" /> },
  { id: 'lyrics', label: 'Lyrics', icon: <ListMusic className="size-5" /> },
  { id: 'spotify', label: 'Spotify', icon: <SpotifyMark className="size-5" /> },
  { id: 'display', label: 'Display', icon: <Monitor className="size-5" /> },
  { id: 'menu', label: 'Menu', icon: <SlidersHorizontal className="size-5" /> },
  { id: 'performance', label: 'Performance', icon: <Zap className="size-5" /> },
  { id: 'saved', label: 'Saved', icon: <Bookmark className="size-5" /> },
]

export function SpotifyMark({ className }: { className?: string }) {
  // The real Spotify glyph, drawn inline (lucide 1.x dropped brand icons).
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 1.5A10.5 10.5 0 1 0 22.5 12 10.5 10.5 0 0 0 12 1.5Zm4.815 15.145a.654.654 0 0 1-.9.217c-2.466-1.508-5.572-1.849-9.222-1.013a.655.655 0 0 1-.29-1.277c3.998-.914 7.455-.521 10.222 1.172a.654.654 0 0 1 .19.9Zm1.284-2.859a.817.817 0 0 1-1.123.27c-2.824-1.736-7.126-2.239-10.467-1.226a.816.816 0 0 1-.474-1.56c3.8-1.152 8.52-.591 11.75 1.393a.817.817 0 0 1 .27 1.123Zm.111-2.977C15.05 8.9 9.55 8.72 6.4 9.657a.98.98 0 1 1-.57-1.877c3.618-1.099 9.678-.887 13.488 1.358a.98.98 0 0 1-1 1.689Z" />
    </svg>
  )
}

type Props = {
  settings: SkySettings
  setSettings: (update: (s: SkySettings) => SkySettings) => void
  onRestart?: () => void
  // The same window, rendered inside the live preview (no section chrome).
  embedded?: boolean
  onClose?: () => void
}

export function ConfigPreview({ settings, setSettings, onRestart, embedded = false, onClose }: Props) {
  const [page, setPage] = useState<PageId>('sky')
  const [open, setOpen] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])

  const s = settings
  const set = (patch: Partial<SkySettings>) => setSettings((prev) => ({ ...prev, ...patch }))
  const cycleFont = (key: 'skyFont' | 'font', dir: 1 | -1) => {
    const fonts = FONTS
    const i = fonts.indexOf(s[key])
    set({ [key]: fonts[(i + dir + fonts.length) % fonts.length] } as Partial<SkySettings>)
  }

  const pageInfo = { sky: ['Sky', 'Pick your sky and fine-tune it'], lyrics: ['Lyrics', 'How and where lyrics appear'], spotify: ['Spotify', 'Connection to your music'], display: ['Display', 'Top bar, hotbar and menu'], menu: ['Menu', 'How the menu opens and looks'], performance: ['Performance', 'Always smooth — the mod tunes itself'], saved: ['Saved', 'Saved lines and recently played'] } as const

  const panel = (
    <div
      className={cx(
        'gui-window depth relative overflow-hidden bg-[#1b1622]/95 shadow-glow backdrop-blur-xl',
        embedded ? 'h-full w-full rounded-none' : 'mx-auto max-w-[980px] rounded-card',
      )}
    >
            <div
              className={cx(
                'grid grid-cols-[92px_1fr] sm:grid-cols-[112px_1fr]',
                !open && 'pointer-events-none opacity-90',
                embedded && 'h-full min-h-0 [grid-template-rows:minmax(0,1fr)]',
              )}
            >
              {/* Sidebar — icon over label like the in-game menu */}
              <nav
                aria-label="Menu pages"
                className={cx(
                  'flex flex-col items-center gap-1 border-r border-white/5 py-4',
                  embedded && 'gap-0.5 overflow-y-auto py-2',
                )}
              >
                {PAGES.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={page === p.id}
                    onClick={() => {
                      setPage(p.id)
                      setOpen(true)
                    }}
                    className={cx(
                      'flex w-[76px] flex-col items-center gap-1 rounded-2xl text-[12px] leading-none transition-colors',
                      embedded ? 'py-2' : 'py-3',
                      page === p.id ? 'bg-white font-semibold text-[#16121d]' : 'text-fg/75 hover:bg-white/[0.06] hover:text-fg',
                    )}
                  >
                    {p.icon}
                    <span>{p.label}</span>
                  </button>
                ))}
              </nav>

              {/* Panel */}
              <div className={cx('relative', embedded && 'flex min-h-0 flex-col')}>
                <div className={cx('flex items-start justify-between', embedded ? 'px-4 pt-4' : 'px-5 pt-5 sm:px-7')}>
                  <div>
                    <h3 className="text-[20px] font-semibold tracking-tight sm:text-[24px]">{pageInfo[page][0]}</h3>
                    <p className="text-[13px] text-muted sm:text-[14px]">{pageInfo[page][1]}</p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => (onClose ? onClose() : setOpen(false))}
                    className="grid size-9 place-items-center rounded-[12px] text-muted transition-colors hover:bg-white/[0.08] hover:text-fg"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                <div
                  className={cx(
                    'gui-scroll overflow-y-auto',
                    embedded ? 'mt-3 min-h-0 flex-1 px-4 pb-5' : 'mt-4 max-h-[480px] px-5 pb-8 sm:px-7',
                  )}
                >
                  {page === 'sky' && <SkyPage s={s} set={set} cycleFont={cycleFont} />}
                  {page === 'lyrics' && <LyricsPage s={s} set={set} cycleFont={cycleFont} />}
                  {page === 'spotify' && <SpotifyPage s={s} set={set} setToast={setToast} onRestart={onRestart} />}
                  {page === 'display' && <DisplayPage s={s} set={set} />}
                  {page === 'menu' && (
                    <MenuPage
                      s={s}
                      set={set}
                      reset={() => {
                        setSettings(() => defaultSkySettings)
                        setToast('Reset to defaults')
                      }}
                    />
                  )}
                  {page === 'performance' && <PerformancePage s={s} set={set} />}
                  {page === 'saved' && <SavedPage />}
                </div>

                <AnimateToast toast={toast} />
              </div>
            </div>

            {/* Closed menu — the replica matches the in-game flow: press J to reopen */}
            {!open && !embedded && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="absolute inset-0 grid place-items-center rounded-card bg-[#1b1622]/80"
              >
                <span className="flex flex-col items-center gap-3 text-center">
                  <span className="text-[15px] font-medium text-fg">Menu closed</span>
                  <span className="flex items-center gap-2 text-[13px] text-muted">
                    press <kbd className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-fg">J</kbd> to open it again
                  </span>
                  <span className="mt-1 rounded-[10px] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#16121d]">Open menu (J)</span>
                </span>
              </button>
            )}
          </div>
  )

  if (embedded) return panel

  return (
    <section id="gui" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Config GUI"
          title="The real menu, every button clickable"
          description="The mod's in-game config screen, with the same pages, rows and factory defaults. Everything you touch here drives the preview above — pick a sky tile and watch it repaint."
        />

        <Reveal className="mt-12">{panel}</Reveal>

        <p className="mx-auto mt-6 max-w-[720px] text-center text-[12px] leading-relaxed text-faint">
          Same rows, same factory defaults as the mod&apos;s Config.java — the only difference is that
          the Spotify login and lyric fetching only run inside the game. Everything else here is live.
        </p>
      </Container>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Building blocks — styled after the in-game rows
// ---------------------------------------------------------------------------

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pb-2">
      <p className="px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-faint">{label}</p>
      <div className="overflow-hidden rounded-[18px] bg-white/[0.035]">{children}</div>
    </div>
  )
}

function Row({ title, sub, children }: { title: string; sub?: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-3.5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[14px] font-medium leading-snug text-fg">{title}</p>
        {sub && <p className="mt-0.5 text-[12px] leading-snug text-faint">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cx('relative h-[26px] w-[46px] shrink-0 rounded-full transition-colors duration-200', checked ? 'bg-white' : 'bg-white/[0.14]')}
    >
      <span
        className={cx(
          'absolute top-[3px] size-5 rounded-full transition-all duration-200',
          checked ? 'left-[23px] bg-[#241d2e]' : 'left-[3px] bg-white/80',
        )}
      />
    </button>
  )
}

function ToggleRow({ title, sub, checked, onChange }: { title: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row title={title} sub={sub}>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </Row>
  )
}

function ActionRow({ title, sub, onClick, hint }: { title: string; sub?: string; onClick: () => void; hint?: string }) {
  return (
    <Row title={title} sub={sub}>
      <button type="button" onClick={onClick} className="flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-fg">
        {hint}
        <ChevronRight className="size-4" />
      </button>
    </Row>
  )
}

function StepperRow({ title, sub, value, onPrev, onNext }: { title: string; sub?: string; value: string; onPrev: () => void; onNext: () => void }) {
  return (
    <Row title={title} sub={sub}>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Previous" onClick={onPrev} className="grid size-7 place-items-center rounded-full text-fg/60 transition-colors hover:bg-white/10 hover:text-fg">
          <ChevronLeft className="size-4" />
        </button>
        <span className="min-w-28 text-center text-[14px] font-semibold text-fg">{value}</span>
        <button type="button" aria-label="Next" onClick={onNext} className="grid size-7 place-items-center rounded-full text-fg/60 transition-colors hover:bg-white/10 hover:text-fg">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </Row>
  )
}

function SegmentRow<T extends string>({
  title,
  sub,
  options,
  value,
  onChange,
}: {
  title: string
  sub?: string
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <Row title={title} sub={sub}>
      <div className="flex shrink-0 gap-1 rounded-full bg-black/25 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={cx(
              'h-7 rounded-full px-3 text-[12px] transition-colors',
              o.value === value ? 'bg-white font-semibold text-[#16121d]' : 'text-muted hover:text-fg',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Row>
  )
}

function SliderRow({
  title,
  sub,
  min,
  max,
  step = 1,
  value,
  display,
  onChange,
}: {
  title: string
  sub?: string
  min: number
  max: number
  step?: number
  value: number
  display?: string
  onChange: (v: number) => void
}) {
  return (
    <div className="border-b border-line px-4 py-3.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[14px] font-medium leading-snug text-fg">{title}</p>
          {sub && <p className="mt-0.5 text-[12px] leading-snug text-faint">{sub}</p>}
        </div>
        <span className="shrink-0 font-mono text-[13px] text-fg/90">{display ?? value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/[0.1] [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white"
      />
    </div>
  )
}

function AnimateToast({ toast }: { toast: string | null }) {
  return (
    <div className={cx('pointer-events-none absolute inset-x-0 bottom-4 flex justify-center transition-all duration-200', toast ? 'opacity-100' : 'translate-y-1 opacity-0')}>
      <span className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-semibold text-[#16121d]">{toast}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function SkyPage({
  s,
  set,
  cycleFont,
}: {
  s: SkySettings
  set: (patch: Partial<SkySettings>) => void
  cycleFont: (key: 'skyFont' | 'font', dir: 1 | -1) => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Group label="General">
        <ToggleRow title="Sky enabled" sub="Turn the custom sky on or off" checked={s.skyEnabled} onChange={(v) => set({ skyEnabled: v })} />
        <ToggleRow title="New song, new sky" sub="Switches to another sky with every song" checked={s.skyShuffle} onChange={(v) => set({ skyShuffle: v })} />
        <ActionRow
          title="Random sky"
          sub="Pick one of the 20 skies at random — like pressing F8"
          hint="Roll"
          onClick={() => {
            let n = s.sky
            while (n === s.sky) n = Math.floor(Math.random() * skyCount)
            set({ sky: n })
          }}
        />
        <StepperRow title="Font (sky)" value={s.skyFont} onPrev={() => cycleFont('skyFont', -1)} onNext={() => cycleFont('skyFont', 1)} />
      </Group>

      <div className="pb-2">
        <div className="flex items-baseline justify-between px-1 pb-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-faint">Sky style</p>
          <p className="text-[11px] text-faint">{skyCount} skies</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {SKIES.map((def, i) => (
            <button
              key={def.id}
              type="button"
              aria-pressed={s.sky === i}
              title={def.desc}
              onClick={() => set({ sky: i })}
              className={cx(
                'depth relative aspect-video overflow-hidden rounded-xl text-left transition-transform duration-200 hover:scale-[1.015]',
                s.sky === i ? 'ring-2 ring-white' : '',
              )}
            >
              <SkyThumb skyIndex={i} palette={s.palette} />
              <span className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/70 to-transparent p-2 pb-1.5 text-[12px] font-semibold text-white">
                {def.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Group label="Fine-tuning">
        <StepperRow
          title="Palette"
          sub="Colours of lights and nebulae"
          value={PALETTES.find((p) => p.key === s.palette)?.name ?? 'Original'}
          onPrev={() => {
            const i = PALETTES.findIndex((p) => p.key === s.palette)
            set({ palette: PALETTES[(i + PALETTES.length - 1) % PALETTES.length].key })
          }}
          onNext={() => {
            const i = PALETTES.findIndex((p) => p.key === s.palette)
            set({ palette: PALETTES[(i + 1) % PALETTES.length].key })
          }}
        />
        <SliderRow title="Sky strength" sub="How strong the colours are" min={10} max={100} value={s.skyStrength} display={`${s.skyStrength}%`} onChange={(v) => set({ skyStrength: v })} />
        <SliderRow title="Animation speed" sub="How fast everything moves" min={25} max={200} value={s.speed} display={`${s.speed}%`} onChange={(v) => set({ speed: v })} />
        <SliderRow title="Weather amount" sub="Amount of snow, rain and embers" min={0} max={200} value={s.weatherAmount} display={`${s.weatherAmount}%`} onChange={(v) => set({ weatherAmount: v })} />
      </Group>

      <Group label="Behaviour">
        <ToggleRow title="Sky reacts to music" sub="Lights breathe with the music" checked={s.skyMusic} onChange={(v) => set({ skyMusic: v })} />
        <ToggleRow title="Real rain for rain/storm" sub="Rain skies make it really rain" checked={s.realWeather} onChange={(v) => set({ realWeather: v })} />
        <ToggleRow title="Hide clouds" sub="Hide Minecraft clouds" checked={s.hideClouds} onChange={(v) => set({ hideClouds: v })} />
        <ToggleRow title="Sky during the day too" checked={s.skyDay} onChange={(v) => set({ skyDay: v })} />
        <ToggleRow title="Fainter during the day" sub="Fainter by day, full at night" checked={s.dayNight} onChange={(v) => set({ dayNight: v })} />
        <ToggleRow title="Constellations" sub="Fine lines between stars" checked={s.constellations} onChange={(v) => set({ constellations: v })} />
      </Group>
    </div>
  )
}

function LyricsPage({
  s,
  set,
  cycleFont,
}: {
  s: SkySettings
  set: (patch: Partial<SkySettings>) => void
  cycleFont: (key: 'skyFont' | 'font', dir: 1 | -1) => void
}) {
  const colors: { value: number; label: string; hex: string }[] = [
    { value: -1, label: 'Auto — matches the sky', hex: '#cbc4dd' },
    { value: 0xff6ad5, label: 'Pink', hex: '#ff6ad5' },
    { value: 0x5ff3ff, label: 'Cyan', hex: '#5ff3ff' },
    { value: 0xa78bff, label: 'Violet', hex: '#a78bff' },
    { value: 0xffffff, label: 'White', hex: '#ffffff' },
  ]
  return (
    <div className="flex flex-col gap-4">
      <Group label="Lyrics">
        <ToggleRow title="Show lyrics" sub="Lyrics in 3D in the world" checked={s.lines} onChange={(v) => set({ lines: v })} />
        <SegmentRow
          title="Lyrics style"
          sub="World floats each word in front of you, Sky paints the line up in the sky"
          options={[
            { value: 'world', label: 'World' },
            { value: 'sky', label: 'Sky' },
          ]}
          value={s.kind}
          onChange={(v) => set({ kind: v })}
        />
        <ToggleRow title="Follow view" sub="New lines appear where you look (off = view lock)" checked={s.follow} onChange={(v) => set({ follow: v })} />
        <ToggleRow title="Show underground too" sub="See lyrics through blocks in caves" checked={s.underground} onChange={(v) => set({ underground: v })} />
      </Group>

      <Group label="Look">
        <Row
          title="Colour"
          sub="(A = matches the sky)"
        >
          <div className="flex shrink-0 items-center gap-1.5">
            {colors.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                aria-pressed={s.color === c.value}
                onClick={() => set({ color: c.value })}
                className={cx(
                  'size-7 rounded-full border border-white/20 transition-transform hover:scale-110',
                  s.color === c.value && 'ring-2 ring-white',
                )}
                style={{ background: c.hex }}
              />
            ))}
          </div>
        </Row>
        <ToggleRow title="Glow" sub="Soft glow around the words" checked={s.glow} onChange={(v) => set({ glow: v })} />
        <SliderRow title="Glow strength" min={20} max={250} value={s.glowStrength} display={`${s.glowStrength}%`} onChange={(v) => set({ glowStrength: v })} />
        <SegmentRow
          title="Animation"
          sub="How new words appear"
          options={[
            { value: '0', label: 'Fade in' },
            { value: '1', label: 'Pop' },
            { value: '2', label: 'Slide in' },
          ]}
          value={String(s.anim) as '0' | '1' | '2'}
          onChange={(v) => set({ anim: (Number(v) as 0 | 1 | 2) })}
        />
        <StepperRow title="Font (lyrics)" sub="Font of the lyrics in the sky" value={s.font} onPrev={() => cycleFont('font', -1)} onNext={() => cycleFont('font', 1)} />
      </Group>

      <Group label="Timing">
        <SliderRow title="Lyrics offset" sub="Too early or too late? Adjust here" min={-5000} max={5000} step={50} value={s.offset} display={`${s.offset === 0 ? '0' : s.offset > 0 ? '+' : ''}${s.offset} ms`} onChange={(v) => set({ offset: v })} />
        <ToggleRow title="Pulse to the beat" sub="The current word pulses on the beat" checked={s.beat} onChange={(v) => set({ beat: v })} />
        <ToggleRow title="Song title intro" sub="Big song title in the sky on track change" checked={s.intro} onChange={(v) => set({ intro: v })} />
        <ToggleRow title="Translation" sub="Shows a translation under the bar (internet)" checked={s.translate} onChange={(v) => set({ translate: v })} />
      </Group>
    </div>
  )
}

function SpotifyPage({
  s,
  set,
  setToast,
  onRestart,
}: {
  s: SkySettings
  set: (patch: Partial<SkySettings>) => void
  setToast: (t: string) => void
  onRestart?: () => void
}) {
  const [connecting, setConnecting] = useState(false)

  const connect = () => {
    if (!s.clientId.trim()) {
      setToast(spotify.statuses.needId)
      return
    }
    setConnecting(true)
    // Honest replica: the real OAuth flow needs the in-game local listener on
    // 127.0.0.1:8789, which a website preview cannot complete.
    setTimeout(() => {
      setConnecting(false)
      setToast('Browser login needs the game — in game your browser opens automatically')
    }, 4200)
  }

  const status = s.demo ? spotify.statuses.demo : connecting ? spotify.statuses.wait : s.clientId.trim() ? spotify.statuses.off : spotify.statuses.setup

  return (
    <div className="flex flex-col gap-4">
      <Group label="Connection">
        <SegmentRow
          title="Connection type"
          options={[
            { value: 'auto', label: 'Automatic' },
            { value: 'api', label: 'Web API' },
          ]}
          value={s.spotifyMode}
          onChange={(v) => set({ spotifyMode: v })}
        />
        {s.spotifyMode === 'auto' && (
          <Row title="No setup needed" sub="Open the Spotify app on your PC and play a song — no login, no client ID. Automatic only works on Windows desktop; Mac/Linux choose Web API." />
        )}
        <div className="px-4 py-3.5">
          <p className="text-[14px] font-medium text-fg">Spotify client ID</p>
          <p className="mt-0.5 text-[12px] text-faint">From the Spotify dashboard (Web API)</p>
          <input
            type="text"
            value={s.clientId}
            placeholder="Paste client ID"
            onChange={(e) => set({ clientId: e.target.value })}
            className="mt-2 h-10 w-full rounded-[12px] bg-black/30 px-3 text-[13px] text-fg placeholder:text-faint focus:outline focus:outline-1 focus:outline-white/30"
          />
        </div>
        <Row title="Redirect URI" sub="Add exactly this in your Spotify app">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(spotify.redirect).catch(() => {})
              setToast('Copied')
            }}
            className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-white/[0.08] px-2.5 py-1.5 text-[12px] text-fg transition-colors hover:bg-white/[0.14]"
          >
            <Copy className="size-3.5" />
            Copy
          </button>
        </Row>
        <Row title="Connect" sub={`Status: ${status}`}>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={connect}
              disabled={connecting}
              className={cx(
                'h-8 rounded-[10px] px-4 text-[13px] font-semibold transition-colors',
                connecting ? 'bg-white/30 text-fg/50' : 'bg-white text-[#16121d] hover:bg-white/85',
              )}
            >
              {connecting ? 'Connecting …' : 'Connect'}
            </button>
            <a
              href={spotify.dashboard}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-fg"
              onClick={() => setToast('Opens developer.spotify.com — real link')}
            >
              Open dashboard
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </Row>
      </Group>

      <Group label="Playback">
        <ToggleRow title="Demo lyrics" sub="Test lyrics without Spotify" checked={s.demo} onChange={(v) => set({ demo: v })} />
        {s.demo && (
          <Row title="Playing now" sub={`${spotify.statuses.demo} — restart from the first line any time`}>
            <button
              type="button"
              onClick={() => {
                onRestart?.()
                setToast('Demo restarted')
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-[10px] bg-white/[0.08] px-2.5 py-1.5 text-[12px] text-fg transition-colors hover:bg-white/[0.14]"
            >
              <RotateCcw className="size-3.5" />
              Restart demo
            </button>
          </Row>
        )}
        <Row title="Set lyrics timing here" sub="Too early or late? Nudge the offset on the Lyrics page">
          <button
            type="button"
            onClick={() => setToast('In game this syncs to a live song — demo timing is already exact')}
            className="flex items-center text-[13px] text-muted transition-colors hover:text-fg"
          >
            <ChevronRight className="size-4" />
          </button>
        </Row>
      </Group>
    </div>
  )
}

function DisplayPage({ s, set }: { s: SkySettings; set: (patch: Partial<SkySettings>) => void }) {
  return (
    <div className="flex flex-col gap-4">
      <Group label="Top bar">
        <ToggleRow title="Show top bar" sub="Time, ping and song at the top" checked={s.topBar} onChange={(v) => set({ topBar: v })} />
        <ToggleRow title="Lyrics in the top bar" sub="Current line with karaoke highlight" checked={s.lyricsInBar} onChange={(v) => set({ lyricsInBar: v })} />
        <ToggleRow title="Real album cover" sub="Album cover in the bar" checked={s.cover} onChange={(v) => set({ cover: v })} />
        <ToggleRow title="Clock" checked={s.clock} onChange={(v) => set({ clock: v })} />
        <ToggleRow title="Ping" checked={s.ping} onChange={(v) => set({ ping: v })} />
      </Group>

      <Group label="HUD">
        <ToggleRow title="Glass hotbar" sub="Dark glass hotbar with soft frame" checked={s.hotbar} onChange={(v) => set({ hotbar: v })} />
        <Row title="Accent colour" sub="Used across the HUD and menu">
          <div className="flex shrink-0 items-center gap-1.5">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={s.accent === c}
                onClick={() => set({ accent: c })}
                className={cx('size-7 rounded-full border border-white/20 transition-transform hover:scale-110', s.accent === c && 'ring-2 ring-white')}
                style={{ background: c }}
              />
            ))}
          </div>
        </Row>
      </Group>
    </div>
  )
}

function MenuPage({
  s,
  set,
  reset,
}: {
  s: SkySettings
  set: (patch: Partial<SkySettings>) => void
  reset: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <Group label="Menu">
        <SegmentRow
          title="Menu style"
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'world', label: 'World' },
          ]}
          value={s.menuStyle}
          onChange={(v) => set({ menuStyle: v })}
        />
        <ToggleRow
          title="Interactive phone menu"
          sub="J: your arm raises a phone, you swipe up and the menu stands in the world — pick with your crosshair"
          checked={s.phoneMenu}
          onChange={(v) => set({ phoneMenu: v })}
        />
        <ToggleRow title="Background blur" checked={s.blur} onChange={(v) => set({ blur: v })} />
        <ToggleRow title="Sounds" checked={s.sounds} onChange={(v) => set({ sounds: v })} />
        <ActionRow
          title="Reset everything to normal"
          sub="Normal menu and default look"
          onClick={reset}
        />
      </Group>
    </div>
  )
}

function PerformancePage({ s, set }: { s: SkySettings; set: (patch: Partial<SkySettings>) => void }) {
  const applyProfile = (p: 'chill' | 'pvp') => {
    if (p === 'chill') {
      set({ profile: 'chill', quality: 2, fpsBoost: false, fxMenuAnim: true, fxStars: true, fxWeather: true, fxAurora: true, fxBeams: true, fxSkyColor: true })
    } else {
      set({ profile: 'pvp', quality: 0, fpsBoost: true, fxMenuAnim: false, fxStars: false, fxWeather: false, fxAurora: false, fxBeams: false, fxSkyColor: false })
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <Group label="Auto">
        <ToggleRow title="Auto" sub="Lowers effects when FPS drop" checked={s.autoPerf} onChange={(v) => set({ autoPerf: v })} />
        {s.autoPerf && (
          <Row title="Target" sub="Auto is on — the mod tunes itself" />
        )}
        {!s.autoPerf && (
          <SliderRow title="Target" sub="Below this the mod saves automatically" min={30} max={240} step={10} value={s.target || 60} display={`${s.target || 60} FPS`} onChange={(v) => set({ target: v })} />
        )}
        <Row title="Profile">
          <div className="flex shrink-0 gap-1 rounded-full bg-black/25 p-1">
            {(['chill', 'pvp'] as const).map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={s.profile === p}
                onClick={() => applyProfile(p)}
                className={cx(
                  'h-7 rounded-full px-3 text-[12px] transition-colors',
                  s.profile === p ? 'bg-white font-semibold text-[#16121d]' : 'text-muted hover:text-fg',
                )}
              >
                {p === 'chill' ? 'Chill (all on)' : 'PvP (max FPS)'}
              </button>
            ))}
          </div>
        </Row>
      </Group>

      <Group label="Graphics">
        <SegmentRow
          title="Graphics (sky & lyrics)"
          sub="Low FPS? Choose “Performance”."
          options={[
            { value: '0', label: 'Performance' },
            { value: '1', label: 'Balanced' },
            { value: '2', label: 'Pretty' },
          ]}
          value={String(s.quality) as '0' | '1' | '2'}
          onChange={(v) => set({ quality: (Number(v) as 0 | 1 | 2) })}
        />
        <ToggleRow title="FPS boost" sub="Lower shadows, particles and biome blend" checked={s.fpsBoost} onChange={(v) => set({ fpsBoost: v })} />
      </Group>

      <Group label="Effects">
        <ToggleRow title="Menu animations" checked={s.fxMenuAnim} onChange={(v) => set({ fxMenuAnim: v })} />
        <ToggleRow title="Stars" checked={s.fxStars} onChange={(v) => set({ fxStars: v })} />
        <ToggleRow title="Weather (snow, rain …)" checked={s.fxWeather} onChange={(v) => set({ fxWeather: v })} />
        <ToggleRow title="Aurora" checked={s.fxAurora} onChange={(v) => set({ fxAurora: v })} />
        <ToggleRow title="Light beams" checked={s.fxBeams} onChange={(v) => set({ fxBeams: v })} />
        <ToggleRow title="Sky colour" checked={s.fxSkyColor} onChange={(v) => set({ fxSkyColor: v })} />
        <Row title="Mod: 3.8 ms" sub="What the current effects cost per frame on this setup" />
      </Group>
    </div>
  )
}

function SavedPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-[18px] bg-white/[0.035] p-5 text-center">
        <p className="text-[13px] font-medium text-fg">Saved lines</p>
        <p className="mt-1 text-[12px] text-faint">Nothing saved yet — press N when you like a line</p>
      </div>
      <div className="rounded-[18px] bg-white/[0.035] p-5 text-center">
        <p className="text-[13px] font-medium text-fg">Recently played</p>
        <p className="mt-1 text-[12px] text-faint">No songs in this session yet.</p>
      </div>
    </div>
  )
}
