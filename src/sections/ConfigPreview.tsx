import { Glasses, Mic, Mountain } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { HatIcon } from '../components/Hat'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { cx } from '../lib/cx'
import { hats, skyPresets, type SkyPreset, type SkySettings } from '../content'

type Tab = 'lyrics' | 'skies' | 'styles'

const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
  { id: 'lyrics', label: 'Lyrics', icon: <Mic className="size-4" /> },
  { id: 'skies', label: 'Skies', icon: <Mountain className="size-4" /> },
  { id: 'styles', label: 'Styles', icon: <Glasses className="size-4" /> },
]

type Props = {
  settings: SkySettings
  setSettings: (update: (s: SkySettings) => SkySettings) => void
  hatId: string
  onHat: (id: string) => void
}

export function ConfigPreview({ settings, setSettings, hatId, onHat }: Props) {
  const [tab, setTab] = useState<Tab>('lyrics')

  const flag = <K extends keyof SkySettings>(key: K, label: string, hint: string) => (
    <Row label={label} hint={hint}>
      <Toggle checked={settings[key] as boolean} onChange={(v) => setSettings((s) => ({ ...s, [key]: v }))} />
    </Row>
  )

  return (
    <section id="gui" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Config GUI"
          title="The settings screen, in your browser"
          description="A browser replica of the in-game screen. Flip the toggles and sliders here and the sky preview above obeys instantly — click a hat in Styles and the player preview below wears it."
        />

        <Reveal className="mt-12">
          <div className="depth relative mx-auto max-w-[900px] overflow-hidden rounded-card bg-surface shadow-glow">
            {/* Window chrome */}
            <div className="flex items-center gap-3 border-b border-line px-5 py-3">
              <span className="flex gap-1.5">
                <span className="round size-3 bg-accent-3/70" />
                <span className="round size-3 bg-accent/70" />
                <span className="round size-3 bg-accent-2/70" />
              </span>
              <p className="text-[13px] text-muted">Neonlyrics — Settings</p>
              <span className="ml-auto depth inline-flex h-6 items-center rounded-[8px] bg-white/[0.05] px-2 text-[11px] text-fg/70">
                v2.1.0 · MC 26.3
              </span>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-[168px_1fr] sm:p-6">
              {/* Tabs */}
              <div className="flex gap-2 overflow-x-auto sm:flex-col">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cx(
                      'inline-flex h-11 shrink-0 items-center gap-2.5 whitespace-nowrap rounded-control px-3.5 text-[14px] transition-colors sm:w-full',
                      tab === t.id ? 'bg-white/[0.08] text-fg' : 'text-muted hover:bg-white/[0.04] hover:text-fg',
                    )}
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
                <p className="hidden px-1 text-[11px] leading-relaxed text-faint sm:block sm:mt-auto">
                  Changes apply to the live previews on this page, just like they would in your game.
                </p>
              </div>

              {/* Tab bodies */}
              <div className="min-w-0">
                {tab === 'lyrics' && (
                  <div className="flex flex-col divide-y divide-line">
                    {flag('lineGlow', 'Line glow', 'Current line floats with a soft neon halo')}
                    {flag('karaoke', 'Word karaoke', 'Words light up one by one, timed by LRCLIB')}
                    {flag('lineAnimation', 'Line animation', 'New lines slide up as the song moves on')}
                    <Row label="Lyric size" hint={`${settings.lyricSize}% of the default sky line`}>
                      <Slider min={60} max={180} value={settings.lyricSize} onChange={(v) => setSettings((s) => ({ ...s, lyricSize: v }))} />
                    </Row>
                    <Row label="Lyric opacity" hint={`${settings.lyricOpacity}% opaque at its brightest`}>
                      <Slider min={30} max={100} value={settings.lyricOpacity} onChange={(v) => setSettings((s) => ({ ...s, lyricOpacity: v }))} />
                    </Row>
                  </div>
                )}

                {tab === 'skies' && (
                  <div className="flex flex-col divide-y divide-line">
                    <Row label="Sky preset" hint="28 in the mod — three rendered here">
                      <div className="flex flex-wrap justify-end gap-2">
                        {skyPresets.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setSettings((s) => ({ ...s, preset: p.id as SkyPreset }))}
                            className={cx(
                              'h-9 rounded-[11px] px-3 text-[13px] transition-colors',
                              settings.preset === p.id ? 'bg-white/[0.1] text-fg' : 'bg-white/[0.03] text-muted hover:text-fg',
                            )}
                          >
                            {p.name}
                          </button>
                        ))}
                      </div>
                    </Row>
                    {flag('beatGlow', 'Beat glow', 'Background breathes with the chorus')}
                    {flag('hudBar', 'HUD lyric bar', 'Top-of-screen bar with current and next line')}
                    {flag('fogFade', 'Fade fog to sky', 'Terrain blends into the view instead of vanilla blue')}
                  </div>
                )}

                {tab === 'styles' && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {hats.map((h) => (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => onHat(h.id)}
                          className={cx(
                            'depth relative flex flex-col items-center gap-1.5 rounded-card-sm bg-white/[0.03] px-3 py-3 text-center transition-colors hover:bg-white/[0.06]',
                            hatId === h.id && '[--depth-edge:rgb(255_79_216/0.6)]',
                          )}
                        >
                          <HatIcon id={h.id} className="h-6 w-10 text-fg/80" />
                          <span className="text-[12px] font-medium text-fg">{h.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[12px] leading-relaxed text-faint">
                      The mod's Styles tab is cosmetics: custom hats worn by your skin. Anything you pick here appears on the player preview below.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}

function Row({ label, hint, children }: { label: string; hint: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-1 last:pb-1">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-fg">{label}</p>
        <p className="text-[12px] text-faint">{hint}</p>
      </div>
      {children}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cx(
        'relative h-6 w-11 shrink-0 rounded-[8px] transition-colors',
        checked ? 'bg-accent/80' : 'bg-white/[0.08]',
      )}
    >
      <span
        className={cx(
          'round absolute top-0.5 size-5 bg-white shadow transition-all duration-200',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  )
}

function Slider({ min, max, value, onChange }: { min: number; max: number; value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-1.5 w-44 cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-accent [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-2"
    />
  )
}
