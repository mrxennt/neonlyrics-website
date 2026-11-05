// All copy and data for the Neonlyrics site lives here. Sections read from
// this file; remove a section by deleting it from App.tsx.

export type SkyPreset = 'synthwave' | 'aurora' | 'nebula'

// The settings on the mod's config screen. The GUI replica edits these and
// the sky preview renders them live, so the two sections stay in sync.
export type SkySettings = {
  preset: SkyPreset
  lineGlow: boolean
  karaoke: boolean
  lineAnimation: boolean
  lyricSize: number // percent, 60–180
  lyricOpacity: number // percent, 30–100
  beatGlow: boolean
  hudBar: boolean
  fogFade: boolean
}

export const defaultSkySettings: SkySettings = {
  preset: 'synthwave',
  lineGlow: true,
  karaoke: true,
  lineAnimation: true,
  lyricSize: 110,
  lyricOpacity: 100,
  beatGlow: true,
  hudBar: true,
  fogFade: true,
}

export const brand = {
  name: 'Neonlyrics',
  tagline: 'Spotify-style synced karaoke lyrics in 3D in the sky',
  repo: 'https://github.com/mrxennt/neon-lyrics',
  version: '2.1.0',
}

const jars = [
  {
    key: 'mc263',
    mc: '26.3',
    file: 'neon-lyrics-2.1.0+mc26.3.jar',
    size: '3.2 MB',
    sha256: 'b65895e5…ff29405',
    href: 'https://github.com/mrxennt/neon-lyrics/releases/download/v2.1.0/neon-lyrics-2.1.0%2Bmc26.3.jar',
  },
  {
    key: 'mc1211',
    mc: '1.21.11',
    file: 'neon-lyrics-2.1.0+mc1.21.11.jar',
    size: '3.2 MB',
    sha256: '89a48b99…eb19b38',
    href: 'https://github.com/mrxennt/neon-lyrics/releases/download/v2.1.0/neon-lyrics-2.1.0%2Bmc1.21.11.jar',
  },
]

export const downloads = {
  eyebrow: 'Downloads',
  title: 'One jar per Minecraft version',
  description:
    'Releases ship straight from GitHub. Pick the jar for your Minecraft version, drop it in your mods folder and you are done — nothing to install on any server.',
  releaseTag: 'v2.1.0',
  releaseDate: '4 November 2026',
  jars,
}

export const nav = {
  links: [
    { label: 'Sky preview', href: '#sky' },
    { label: 'Settings GUI', href: '#gui' },
    { label: 'Player & styles', href: '#player' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
  ],
  github: { label: 'GitHub', href: brand.repo },
  cta: { label: 'Download v2.1.0', href: '#download' },
}

export const hero = {
  badge: `v${brand.version} · Fabric · client-side · Minecraft 26.3 & 1.21.11`,
  title: ['Karaoke lyrics painted', 'across the sky'],
  highlight: 'sky',
  description:
    'Neonlyrics shows the lyrics of whatever you are listening to, synced line by line: floating 3D lyrics in the sky, a HUD bar at the top of the screen, and a whole restyled game while it is at it — animated skies, glass hotbar, custom fonts.',
  primary: { label: `Download for 26.3`, href: jars[0].href },
  secondary: { label: `Download for 1.21.11`, href: jars[1].href },
  footnote: 'Fabric Loader ≥ 0.20.1 · Fabric API latest for your version · Java ≥ 25 · client-side only, servers need nothing',
}

// The demo track for the sky preview. Original text, no real lyrics — the
// timing model is a small local loop, so it needs no network or audio file.
export const demoSong = {
  title: 'Blockparty Nights',
  artist: 'Neonlyrics demo track',
  lyrics: [
    'We boot the world up, one block at a time',
    'Sunset paints the server in pink and gold',
    'Every window glows like a neon tide',
    'Turn the volume up until the morning breaks',
    'We are the skyline, dancing on the rain',
    'Every block we place is a promise kept',
    'Reset the dawn and do it all again',
    'In the sky we paint our perfect line',
  ],
}

export const skyPresets: { id: SkyPreset; name: string; description: string }[] = [
  { id: 'synthwave', name: 'Synthwave', description: 'Violet dusk, grid floor, a setting sun' },
  { id: 'aurora', name: 'Aurora', description: 'Ribbons of light over spruce pines' },
  { id: 'nebula', name: 'Nebula', description: 'Deep space clouds and dense stars' },
]

// The Styles tab cosmetics. Selecting one here drives the player preview.
export type Hat = { id: string; name: string; description: string }

export const hats: Hat[] = [
  { id: 'none', name: 'No hat', description: 'Skip the cosmetics this run' },
  { id: 'halo', name: 'Neon Halo', description: 'A floating ring of light that pulses with the beat' },
  { id: 'visor', name: 'Synth Visor', description: 'Wraparound visor with a magenta-to-cyan sheen' },
  { id: 'crown', name: 'Crown of Beats', description: 'Gold crown for whoever controls the playlist' },
  { id: 'beanie', name: 'Vinyl Beanie', description: 'Slim beanie with a record pressed on the front' },
  { id: 'horns', name: 'Storm Horns', description: 'Curved horns for maximum entrance energy' },
  { id: 'tophat', name: 'Midnight Top Hat', description: 'A tall hat with a neon band — very classy karaoke' },
]

export const features = {
  eyebrow: 'What the mod does',
  title: 'Lyrics, skies and style, all configurable',
  description:
    'Everything is client-side, so it works on any server and in any single-player world. Every part below is a row in the config screen; the preview sections on this page let you play with the real thing.',
  items: [
    {
      key: 'world',
      title: '3D world lyrics',
      description:
        'The current line floats in the sky at your eye level. Glow, colour, size, opacity and animation are all yours to tune.',
      span: 2,
    },
    {
      key: 'karaoke',
      title: 'Word-level karaoke',
      description:
        'LRCLIB word timestamps light individual words up as they are sung, on any track that provides them.',
      span: 1,
    },
    {
      key: 'skies',
      title: '28 animated sky presets',
      description:
        'Synthwave, Aurora, Nebula, Black Hole, Neon City, Sakura, Inferno, Matrix and more — plus a fully custom sky. Weather sync, day/night and a fog fade that blends terrain into the view.',
      span: 1,
    },
    {
      key: 'hud',
      title: 'HUD lyric bar & restyled game',
      description:
        'A clean top bar with the current and next line, glass hotbar, HUD island with clock, ping and FPS, crosshair styles and a startup intro.',
      span: 1,
    },
    {
      key: 'sources',
      title: 'Spotify, any local player, and more',
      description:
        'Connect your own Spotify app via OAuth, or just let the mod read the system media session — browser players, Spotify, Winamp, anything. Album covers via the iTunes Search API, on-the-fly translation, favourites with an offline cache and a millisecond timing offset.',
      span: 2,
    },
    {
      key: 'perf',
      title: 'Built to stay fast',
      description:
        'Quality presets, an FPS boost mode and automatic performance scaling keep the game smooth even when the sky is heavy.',
      span: 1,
    },
  ],
}

export const install = {
  eyebrow: 'Get it running',
  title: 'Two minutes, three steps',
  steps: [
    {
      title: 'Install Fabric',
      description: 'Get the Fabric Loader (≥ 0.20.1) plus the Fabric API for your Minecraft version, from fabricmc.net.',
    },
    {
      title: 'Drop the jar in mods',
      description: 'Put the jar into .minecraft/mods — same folder in MultiMC, CurseForge or Prism instances.',
    },
    {
      title: 'Open the Neonlyrics screen',
      description: 'Launch the game, open the Neonlyrics screen and pick a sky and a lyrics mode. Spotify setup has its own tutorial screen in-game.',
    },
  ],
  requirements: ['Minecraft 26.3 or 1.21.11', 'Fabric Loader ≥ 0.20.1', 'Fabric API latest', 'Java ≥ 25', 'Client-side only'],
}

export const faq = {
  title: 'Questions, answered',
  items: [
    {
      q: 'Which versions does it support?',
      a: `Release v${brand.version} has one jar for Minecraft 26.3 and one for 1.21.11. Both need Fabric Loader ≥ 0.20.1 and the matching Fabric API.`,
    },
    {
      q: 'Do servers need the mod installed?',
      a: 'No. Neonlyrics is fully client-side — join any server with it, vanilla or modded, and nothing changes for anyone else.',
    },
    {
      q: 'Where do the lyrics come from?',
      a: 'From LRCLIB, free and open, no keys required; album covers resolve via the iTunes Search API. Lyrics and metadata belong to their rights holders.',
    },
    {
      q: 'How does it know what I am listening to?',
      a: 'Two ways. Spotify connects through your own Spotify app via OAuth (the in-game tutorial walks you through the client ID setup), or on Windows the mod reads the system media session, so any local player just works.',
    },
    {
      q: 'Do I need to pay or activate anything?',
      a: 'Existing activation codes keep working, and do whatever the MIT license allows either way. Attribution is appreciated.',
    },
    {
      q: 'Can I build it from source?',
      a: 'Yes: ./gradlew build. Sources compile as Java 25 bytecode but fork onto a JDK 26 install (set it in build.gradle), while Gradle itself runs on a JDK 25 (org.gradle.java.home).',
    },
  ],
}

export const cta = {
  title: 'Ready to give your sky a soundtrack?',
  description:
    'Grab the jar for your version, drop it in the mods folder and pick a preset. The next time a chorus hits, it will be floating over your world.',
  primary: { label: 'Download for 26.3', href: jars[0].href },
  secondary: { label: 'Download for 1.21.11', href: jars[1].href },
}

export const footer = {
  blurb: 'Spotify-style synced karaoke lyrics in 3D in the sky.',
  columns: [
    { title: 'Project', links: ['GitHub', 'Releases', 'Issues', 'MIT License'] },
    { title: 'Resources', links: ['LRCLIB', 'iTunes Search API', 'Fabric Loader'] },
    { title: 'In game', links: ['Sky previews', 'Config GUI', 'Styles tab', 'Install guide'] },
  ],
  legal: `© ${new Date().getFullYear()} mrxennt · Neonlyrics. MIT licensed. Not affiliated with Mojang, Microsoft or Spotify; lyrics and metadata from LRCLIB/iTunes belong to their rights holders.`,
}
