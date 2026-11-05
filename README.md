# Neonlyrics website

The site for [Neonlyrics](https://github.com/mrxennt/neon-lyrics) — the
Spotify-style synced karaoke lyrics in 3D in the sky, a client-side Fabric mod
for Minecraft 26.3 and 1.21.11.

## What is on the page

- **Hero + direct downloads** — jar links straight to the v2.1.0 release assets
  for Minecraft 26.3 and 1.21.11.
- **Sky preview** — an animated browser replica of the mod's 3D sky lyric layer
  with word-level karaoke on an original demo track. Play/pause and the three
  rendered sky presets are on the scene.
- **Config GUI replica** — the mod's settings screen (Lyrics / Skies / Styles
  tabs) as clickable toggles and sliders. They edit the same state the sky
  preview renders, so changes land instantly.
- **Player & styles preview** — a blocky character wearing the hats from the
  mod's Styles tab; picking a hat in either the GUI or the grid puts it on.
- Features, install steps with requirements, FAQ and footer with the usual
  disclaimers.

## Run it

```sh
bun install
bun run dev        # http://localhost:5173
bun run build      # dist/client (assets) + dist/saas_landing/index.js (Worker)
bun run typecheck  # tsc --noEmit
```

## Edit it

- `src/content.ts` holds every string, link, lyric line and hat definition.
- `src/sections/*` are the page sections. `src/App.tsx` stacks them and owns
  the shared `SkySettings` / selected-hat state.
- `src/components/Hat.tsx` draws the hat icons and the worn-hat overlay.
- `src/styles.css` holds the design tokens (deep-violet background, neon
  magenta/cyan accents) and the scene animations (twinkle, equalizer, grid
  scroll, halo pulse).
