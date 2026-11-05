import { motion } from 'motion/react'

import { Container } from '../components/Container'
import { HatIcon, HatOverlay } from '../components/Hat'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { cx } from '../lib/cx'
import { hats } from '../content'

// A blocky front-view character with the selected styles-tab hat drawn on.
// Skin/shirt/jeans tones are plain SVG rects so the overlay lines up cleanly.
function Character({ hatId }: { hatId: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative animate-bob">
        <svg viewBox="0 0 140 224" className="h-72" role="img" aria-label="Player character wearing the selected styles-tab hat">
          <defs>
            <linearGradient id="stage-vignette" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ff4fd8" stopOpacity="0.14" />
              <stop offset="1" stopColor="#5ff3ff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <rect x="10" y="0" width="120" height="180" fill="url(#stage-vignette)" />
          <ellipse cx="70" cy="212" rx="36" ry="7" fill="#000" opacity="0.4" />

          {/* Legs + boots */}
          <rect x="52" y="142" width="16" height="60" fill="#30406e" />
          <rect x="72" y="142" width="16" height="60" fill="#28375e" />
          <rect x="52" y="194" width="16" height="8" fill="#1b1b26" />
          <rect x="72" y="194" width="16" height="8" fill="#15151e" />

          {/* Arms: shirt sleeve then skin */}
          <rect x="28" y="98" width="18" height="10" fill="#17b39c" />
          <rect x="28" y="108" width="18" height="42" fill="#b98a62" />
          <rect x="94" y="98" width="18" height="10" fill="#17b39c" />
          <rect x="94" y="108" width="18" height="42" fill="#b98a62" />

          {/* Torso + neck */}
          <rect x="62" y="86" width="16" height="14" fill="#a97e59" />
          <rect x="50" y="98" width="40" height="44" fill="#17b39c" />

          {/* Head: skin, hair, face */}
          <rect x="44" y="34" width="52" height="52" fill="#b98a62" />
          <rect x="44" y="34" width="52" height="10" fill="#3b2a1e" />
          <rect x="44" y="44" width="6" height="10" fill="#3b2a1e" />
          <rect x="90" y="44" width="6" height="10" fill="#3b2a1e" />
          <rect x="56" y="58" width="8" height="7" fill="#e8f4ff" />
          <rect x="60" y="58" width="4" height="7" fill="#4a3fd1" />
          <rect x="76" y="58" width="8" height="7" fill="#e8f4ff" />
          <rect x="80" y="58" width="4" height="7" fill="#3f51d1" />
          <rect x="64" y="74" width="12" height="3" fill="#7a4e33" />

          {/* Selected styles-tab hat */}
          <g transform="translate(0,8)">
            <HatOverlay id={hatId} />
          </g>
        </svg>
      </div>
    </div>
  )
}

type Props = { hatId: string; onHat: (id: string) => void }

export function PlayerPreview({ hatId, onHat }: Props) {
  const worn = hats.find((h) => h.id === hatId) ?? hats[0]

  return (
    <section id="player" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Player & styles"
          title="Try the styles-tab hats on a player"
          description="This is the mod's Styles tab: cosmetic hats your skin can wear. Click one and the character puts it on — what you see here is exactly what other players will see in your world."
        />

        <Reveal className="mt-12">
          <div className="depth relative mx-auto grid max-w-[900px] gap-6 overflow-hidden rounded-card bg-surface p-6 shadow-glow sm:grid-cols-[240px_1fr] sm:p-8">
            {/* Stage */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-card-sm bg-[#0a0714] px-4 py-8 [background-image:radial-gradient(80%_50%_at_50%_0%,rgb(255_79_216/0.12),transparent)]">
              <Character hatId={hatId} />
              <motion.p key={worn.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-center text-[12px] text-muted">
                <span className="block font-medium text-fg">{worn.name}</span>
                {worn.description}
              </motion.p>
            </div>

            {/* Styles list */}
            <div className="flex min-w-0 flex-col">
              <div className="mb-3 flex items-center gap-2">
                <p className="text-[13px] text-muted">Styles tab</p>
                <span className="depth inline-flex h-6 items-center rounded-[8px] bg-white/[0.05] px-2 text-[11px] text-fg/70">
                  {hats.length} cosmetics
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {hats.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => onHat(h.id)}
                    className={cx(
                      'depth relative flex items-center gap-3 rounded-card-sm bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]',
                      hatId === h.id && '[--depth-edge:rgb(255_79_216/0.6)]',
                    )}
                  >
                    <span className="grid h-9 w-12 shrink-0 place-items-center rounded-[10px] bg-white/[0.04]">
                      <HatIcon id={h.id} className="h-5 w-9 text-fg/80" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium text-fg">{h.name}</span>
                      <span className="block truncate text-[11px] text-faint">{h.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
