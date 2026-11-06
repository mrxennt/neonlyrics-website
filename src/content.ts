// All copy and data for the Neonlyrics site lives here. Everything in this
// file comes from the mod itself: GUI labels and defaults from
// assets/neonlyrics/lang/en_us.json, sky definitions from SkyPreset.java,
// factory defaults from config/Config.java, the 22 fonts from
// assets/neonlyrics/font, Spotify constants from SpotifyClient.java and the
// demo lyrics from LyricsProvider.demo(). All MIT-licensed mod source.

export const year = new Date().getFullYear()

// ---------------------------------------------------------------------------
// Brand & downloads
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Skies — the exact constants from dev-263/neonlyrics/sky/SkyPreset.java for
// the 20 entries the in-game picker shows. toString(16) of each number is the
// colour the real sky shader paints. Names/descriptions are the en_us strings.
// The thumbnails/scenes in public/skies are rendered by the mod's own
// LiveSky.view() at SkyThumbs' look angles — see public/skies/SOURCE.txt.
// ---------------------------------------------------------------------------

export type Weather = 'none' | 'snow' | 'blizzard' | 'rain' | 'thunder' | 'petals' | 'embers' | 'fireflies'
export type PaletteKey = 'original' | 'purple' | 'pink' | 'ocean' | 'mint' | 'sunset' | 'ice' | 'neon'

export type SkyDef = {
  id: string
  name: string
  desc: string
  top: number
  horizon: number
  strength: number
  stars: number
  aurora: boolean
  aurora1: number
  aurora2: number
  weather: Weather
  moon: number
  shooting: boolean
  lyricColor: number
  features: string[]
}

// Feature flags, derived exactly like SkyPreset.features() in the mod.
function sky(
  id: string,
  name: string,
  desc: string,
  top: number,
  horizon: number,
  strength: number,
  stars: number,
  aurora1: number,
  aurora2: number,
  weather: Weather,
  moon: number,
  shooting: boolean,
  lyricColor: number,
  specific: string[],
): SkyDef {
  // SkyPreset marks exactly these three as aurora:true.
  const aurora = ['aurora', 'frost', 'custom'].includes(id)
  const features = [...specific]
  if (aurora) features.push('Aurora')
  if (stars >= 1.0) features.push('Stars')
  if (shooting) features.push('Shooting stars')
  if (moon !== 0) features.push('Moon')
  if (weather !== 'none') features.push({ snow: 'Snow', blizzard: 'Blizzard', rain: 'Rain', thunder: 'Lightning + rain', petals: 'Petals', embers: 'Embers', fireflies: 'Fireflies' }[weather])
  return { id, name, desc, top, horizon, strength, stars, aurora, aurora1, aurora2, weather, moon, shooting, lyricColor, features }
}

export const SKIES: SkyDef[] = [
  sky('synthwave', 'Synthwave', 'A retro sun with drifting stripes over a glowing pink horizon.', 721956, 5905006, 0.9, 0.8, 0, 0, 'none', 0, true, 16759024, ['Retro sun']),
  sky('aurora', 'Aurora', 'Calm aurora curtains slowly flowing across the sky.', 133652, 731699, 0.85, 1.0, 4652976, 10124543, 'none', 0, true, 10289108, []),
  sky('nebula', 'Nebula', 'Colorful nebulae slowly turning around you.', 459546, 1968698, 0.85, 1.0, 16736184, 7240959, 'none', 0, true, 15780095, ['Nebula']),
  sky('black_hole', 'Black hole', 'A black hole with a glowing, swirling disk of light.', 65541, 722456, 0.9, 1.4, 16757850, 16734766, 'none', 0, false, 16766632, ['Light disk']),
  sky('cosmos', 'Cosmos', 'A clear Milky Way with a bright core and a distant planet.', 197132, 1182252, 0.9, 1.7, 11824127, 6015231, 'none', 0, true, 14207231, ['Milky Way']),
  sky('neon_city', 'Neon city', 'City neon on the horizon, sweeping searchlights and rain.', 329750, 2756170, 0.85, 0.3, 16727464, 3073791, 'rain', 0, false, 16751320, ['Searchlights']),
  sky('golden_hour', 'Golden hour', 'A warm evening with golden clouds and fireflies.', 2761552, 16751196, 0.7, 0.15, 16761466, 16743052, 'fireflies', 0, false, 16769208, ['Clouds']),
  sky('cotton_candy', 'Cotton candy', 'A pastel blue day with big pink-tinted clouds.', 5214453, 16763108, 0.85, 0.0, 16777215, 16766700, 'none', 0, false, 16777215, ['Clouds']),
  sky('sakura', 'Sakura', 'Pink dusk, soft clouds and falling cherry petals.', 3807820, 16757721, 0.6, 0.3, 16762598, 13144319, 'petals', 0, false, 16762598, []),
  sky('frost', 'Frost night', 'An icy night with shimmering bands, a moon and snow.', 662064, 6264008, 0.75, 0.8, 12120319, 15137023, 'snow', 15398655, false, 14677247, []),
  sky('midnight', 'Midnight', 'A clear night full of stars with a moon and shooting stars.', 131850, 1055290, 0.85, 1.8, 0, 0, 'none', 15920861, true, 13161215, []),
  sky('deep_sea', 'Deep sea', 'A web of light like deep under water.', 136734, 739930, 0.8, 0.3, 6025958, 12124150, 'none', 0, false, 11075572, ['Light waves']),
  sky('blood_moon', 'Blood moon', 'A red moon, dark clouds and glowing embers.', 1377030, 4852242, 0.85, 0.6, 16734794, 3803664, 'embers', 16726843, false, 16747146, []),
  sky('storm', 'Storm', 'Dark, fast clouds, rain and bright lightning.', 921880, 3028034, 0.8, 0.0, 0, 0, 'thunder', 0, false, 13161712, []),
  sky('custom', 'Custom sky', 'Your own sky: pick colours, lights and weather.', 656920, 2758216, 0.85, 1.2, 10719743, 16777215, 'blizzard', 0, true, 12822783, []),
  sky('inferno', 'Inferno', 'Glowing lava veins slowly flow across a dark red sky, embers fly.', 1704962, 8002566, 0.85, 0.2, 16747038, 16769658, 'embers', 0, false, 16757867, ['Lava veins']),
  sky('matrix', 'Matrix', 'Green code rains down in columns, the characters flicker.', 2052, 138252, 0.9, 0.0, 4652922, 14221280, 'none', 0, false, 8191898, ['Falling code']),
  sky('prism', 'Prism', 'Colorful light beams fall from above and slowly turn.', 459796, 1708086, 0.9, 1.2, 11824127, 4973567, 'none', 0, true, 15126783, ['Light beams']),
  sky('pulsar', 'Pulsar', 'A bright star with a sweeping light beam and rings moving outward.', 131852, 660528, 0.9, 1.6, 4973567, 11824127, 'none', 0, true, 12580095, ['Light beams']),
  sky('aquarell', 'Watercolor', 'Pastel blots like painted with watercolor, with falling petals.', 15124712, 16770258, 0.8, 0.0, 16752329, 10475775, 'petals', 0, false, 16777215, ['Watercolor']),
]

export const skyCount = SKIES.length // the GUI counts and shows exactly 20 skies
export const getSky = (i: number) => SKIES[((i % skyCount) + skyCount) % skyCount]

// Palette presets for the sky lights (Sky page → Palette). The site applies
// them as hue/saturate filters on light layers.
export const PALETTES: { key: PaletteKey; name: string; filter: string }[] = [
  { key: 'original', name: 'Original', filter: 'none' },
  { key: 'purple', name: 'Purple', filter: 'hue-rotate(35deg) saturate(1.05)' },
  { key: 'pink', name: 'Pink', filter: 'hue-rotate(-30deg) saturate(1.15)' },
  { key: 'ocean', name: 'Ocean', filter: 'hue-rotate(125deg) saturate(1.1)' },
  { key: 'mint', name: 'Mint', filter: 'hue-rotate(80deg) saturate(0.95)' },
  { key: 'sunset', name: 'Sunset', filter: 'hue-rotate(-45deg) saturate(1.25)' },
  { key: 'ice', name: 'Ice', filter: 'hue-rotate(150deg) saturate(0.9)' },
  { key: 'neon', name: 'Neon', filter: 'hue-rotate(15deg) saturate(1.6)' },
]

// The 22 font families bundled with the mod (assets/neonlyrics/font).
export const FONTS = [
  'Baloo 2', 'Bebas Neue', 'Caveat', 'DM Sans', 'Fredoka', 'Inter', 'Kanit', 'Lexend', 'Manrope', 'Montserrat',
  'Nunito', 'Orbitron', 'Outfit', 'Pacifico', 'Plus Jakarta Sans', 'Poppins', 'Rubik', 'Sora', 'Space Grotesk',
  'Syne', 'Unbounded', 'Urbanist',
]

// Accent colour choices (Display page → Accent colour). Index 0 is the mod's
// default accent.
export const ACCENTS = ['#a78bff', '#5ff3ff', '#ff4fd8', '#ffffff', '#ffc44d']

// Spotify constants from SpotifyClient.java — the real redirect URI and
// dashboard the mod walks you through in its tutorial screen.
export const spotify = {
  redirect: 'http://127.0.0.1:8789/callback',
  dashboard: 'https://developer.spotify.com/dashboard',
  // Real status strings from neonlyrics.spotify.* / neonlyrics.tut.*
  statuses: {
    setup: 'Not set up yet',
    off: 'Not connected',
    wait: 'Waiting for browser login …',
    on: 'Connected to Spotify',
    demo: 'Demo running (built-in test lyrics)',
    needId: 'Enter your Spotify client ID first',
  },
}

// ---------------------------------------------------------------------------
// The config model — every key name below mirrors a field in Config.java, and
// the defaults match Config.java's factory values (except demo and skyShuffle,
// see the notes on those rows).
// ---------------------------------------------------------------------------

export type SkySettings = {
  // Sky page
  skyEnabled: boolean // Sky enabled
  sky: number // 0–19, index into SKIES (Config: sky, clamped to 0..19)
  skyShuffle: boolean // New song, new sky (Config: skyShuffle; website starts it on)
  skyFont: string // Font (sky), one of FONTS (Config: skyFont index)
  palette: PaletteKey // Palette (Config: skyPalette, -1 = original)
  skyStrength: number // %, 10–100 (Config: skyStrength 0.1–1.0)
  speed: number // %, 25–200 (Config: skySpeed 0.25–2.0)
  weatherAmount: number // %, 0–200 (Config: weatherAmount 0–2)
  realWeather: boolean // Real rain for rain/storm
  hideClouds: boolean // Hide clouds
  skyDay: boolean // Sky during the day too
  dayNight: boolean // Fainter during the day
  constellations: boolean // Constellations
  skyMusic: boolean // Sky reacts to music
  // Lyrics page
  lines: boolean // Show lyrics (Config: lyricsSky)
  kind: 'world' | 'sky' // Lyrics style: World = the mod's floating words in front of you, Sky = lines up overhead (Config: lyricsStyle 1/0)
  follow: boolean // Follow view vs view lock (Config: lyricsFollow)
  underground: boolean // Show underground too
  color: number // -1 = match the sky (Config: lyricsColor)
  glow: boolean // Glow (Config: lyricsGlow)
  glowStrength: number // %, 20–250 (Config: lyricsGlowStrength 0.2–2.5)
  anim: 0 | 1 | 2 // Fade in / Pop / Slide in (Config: lyricsAnim)
  font: string // Font (lyrics), one of FONTS (Config: lyricsFont index)
  size: number // %, 60–400 (Config: lyricsSize 0.6–4.0)
  opacity: number // %, 20–100 (Config: lyricsOpacity 0.2–1.0)
  offset: number // ms, -5000–5000 (Config: lyricsOffsetMs)
  beat: boolean // Pulse to the beat (Config: fxBeatPulse)
  intro: boolean // Song title on change (Config: fxSongIntro)
  translate: boolean // Translation (Config: translate)
  // Spotify page
  spotifyMode: 'auto' | 'api' // Connection type (Config: spotifyMode 0/1)
  clientId: string // Spotify client ID (Config: spotifyClientId)
  demo: boolean // Demo lyrics (Config: demoLyrics; website starts it on so the scene runs)
  // Display page
  topBar: boolean // Show top bar (Config: islandEnabled)
  lyricsInBar: boolean // Lyrics in the top bar (Config: lyricsIsland)
  cover: boolean // Real album cover (Config: albumCover)
  clock: boolean // Clock (Config: showClock)
  ping: boolean // Ping (Config: showPing)
  hotbar: boolean // Glass hotbar (Config: glassHotbar)
  accent: string // Accent colour (Display → Accent colour)
  // Menu page
  menuStyle: 'normal' | 'world' // Menu style (Config: menuMode 0/1)
  phoneMenu: boolean // Interactive phone menu
  blur: boolean // Background blur
  sounds: boolean // Sounds
  // Performance page
  autoPerf: boolean // Automatic FPS (Config: autoPerf)
  target: number // 0 = Auto, else 30–240 (Config: targetFps)
  profile: 'chill' | 'pvp' // Profile (Chill has all effects on)
  quality: 0 | 1 | 2 // Graphics: Performance / Balanced / Pretty
  fpsBoost: boolean // FPS boost
  fxMenuAnim: boolean // Menu animations
  fxStars: boolean // Stars
  fxWeather: boolean // Weather (snow, rain …)
  fxAurora: boolean // Aurora
  fxBeams: boolean // Light beams / searchlights
  fxSkyColor: boolean // Sky colour
}

export const defaultSkySettings: SkySettings = {
  skyEnabled: true,
  sky: 0,
  skyShuffle: true, // website start state so the demo scene changes with songs
  skyFont: 'Unbounded',
  palette: 'original',
  skyStrength: 80, // Config: 0.8
  speed: 100, // Config: 1.0
  weatherAmount: 100, // Config: 1.0
  realWeather: true, // Config: true
  hideClouds: true, // Config: true
  skyDay: true, // Config: true
  dayNight: false, // Config: false
  constellations: true, // Config: true
  skyMusic: true, // Config: true
  lines: true, // Config: lyricsSky
  kind: 'world', // website start state; the Lyrics page switches World ↔ Sky
  follow: true, // Config: lyricsFollow
  underground: false, // Config: false
  color: -1, // Config: -1 (match the sky)
  glow: true, // Config: true
  glowStrength: 100, // Config: 1.0
  anim: 0, // Config: 0 (Fade in)
  font: 'Unbounded',
  size: 160, // Config: lyricsSize 1.6
  opacity: 90, // Config: 0.9
  offset: 0,
  beat: true, // Config: fxBeatPulse
  intro: true, // Config: fxSongIntro
  translate: false,
  spotifyMode: 'auto', // Config: 0 (Automatic)
  clientId: '',
  demo: true, // website start state: the mod ships with demoLyrics = false
  topBar: true, // Config: islandEnabled
  lyricsInBar: true, // Config: lyricsIsland
  cover: true, // Config: albumCover
  clock: true, // Config: showClock
  ping: true, // Config: showPing
  hotbar: true, // Config: glassHotbar
  accent: '#a78bff', // Config: accent 0
  menuStyle: 'normal', // Config: menuMode 0
  phoneMenu: false,
  blur: true, // Config: blur
  sounds: true, // Config: sounds
  autoPerf: true, // Config: true
  target: 0, // Config: targetFps 0 = Auto
  profile: 'chill', // Config: profile 0
  quality: 1, // Config: 1 (Balanced)
  fpsBoost: false, // Config: false
  fxMenuAnim: true,
  fxStars: true,
  fxWeather: true,
  fxAurora: true,
  fxBeams: true,
  fxSkyColor: true,
}

// ---------------------------------------------------------------------------
// The demo track — verbatim from LyricsProvider.demo() in the mod source.
// "Neon Nights (Demo)" by "Lyrics Cord" is the built-in test text the mod
// plays when you flip Demo lyrics on. Line spacing: first line at 1.5 s,
// one line every 3.4 s, exactly like demo().
// ---------------------------------------------------------------------------

export const demoSong = {
  title: 'Neon Nights (Demo)',
  artist: 'Lyrics Cord',
  lineMs: 3400,
  firstMs: 1500,
  lines: [
    'Neon lights across a frozen sky',
    'every block a little brighter tonight',
    "auction's open, put your money down",
    'highest bid takes the purple crown',
    'snow is falling on the spawner farm',
    'sixty four skellys safe from harm',
    'pay me once and I will pay you twice',
    "if you win the gamble, that's the price",
    'time is ticking, only ten to go',
    'sold to you in the falling snow',
  ],
}

// ---------------------------------------------------------------------------
// Nav / hero / sections
// ---------------------------------------------------------------------------

export const nav = {
  links: [
    { label: 'Sky preview', href: '#sky' },
    { label: 'Config GUI', href: '#gui' },
    { label: 'Features', href: '#features' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Legal', href: '#legal' },
  ],
  github: { label: 'GitHub', href: brand.repo },
  cta: { label: 'Download v2.1.0', href: '#download' },
}

export const hero = {
  badge: `v${brand.version} · Fabric · client-side · Minecraft 26.3 & 1.21.11`,
  title: ['Karaoke lyrics painted', 'across the sky'],
  highlight: 'sky',
  description:
    'Neonlyrics shows the lyrics of whatever you are listening to, synced line by line: floating 3D lyrics in the sky, a HUD bar at the top of the screen, and a whole restyled game while it is at it — animated skies, glass hotbar, custom fonts. The previews on this page use the mod\'s real config screen and demo lyrics.',
  primary: { label: 'Download for 26.3', href: jars[0].href },
  secondary: { label: 'Download for 1.21.11', href: jars[1].href },
  footnote: 'Fabric Loader ≥ 0.20.1 · Fabric API latest for your version · Java ≥ 25 · client-side only, servers need nothing',
}

export const features = {
  eyebrow: 'What the mod does',
  title: 'Lyrics, skies and layout, all configurable',
  description:
    'Everything is client-side, so it works on any server and in any single-player world. Every part below is a page in the real config screen; the preview sections on this page run on the same data the game ships with.',
  items: [
    {
      key: 'world',
      title: '3D world lyrics',
      description:
        'The current line floats in the sky at your eye level. Glow, colour, size, opacity, animation and an offset slider are all yours to tune — plus 22 font families, configurable per UI, lyrics and sky.',
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
        'Synthwave, Aurora, Nebula, Black Hole, Neon City, Sakura, Inferno, Matrix and more — 20 in the picker plus a fully custom sky editor. Real weather sync, day/night, constellations, music-reactive glow and a fog fade that blends terrain into the sky.',
      span: 1,
    },
    {
      key: 'hud',
      title: 'HUD lyric bar & restyled game',
      description:
        'A clean top bar with clock, ping and the karaoke-highlighted line, glass hotbar, custom crosshair styles and a startup intro — everything toggleable on the Display page.',
      span: 1,
    },
    {
      key: 'sources',
      title: 'Spotify, any local player, and more',
      description:
        'Connect your own Spotify app via OAuth, or on Windows just let the mod read the system media session — browser players, Spotify, Winamp, anything. Album covers via the iTunes Search API, on-the-fly translation, saved lyric lines and a millisecond timing offset.',
      span: 2,
    },
    {
      key: 'perf',
      title: 'Built to stay fast',
      description:
        'Quality presets (Performance / Balanced / Pretty), an FPS boost mode, automatic performance scaling with a target FPS and two profiles — Chill for everything on, PvP for max FPS.',
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
      title: 'Press J and pick a sky',
      description: 'Launch the game, press J to open the Neonlyrics menu and pick a sky and a lyrics mode. Spotify setup has its own tutorial screen in-game.',
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
      a: 'From lrclib.net — free and open, no keys required. Not every song has synced lyrics there; popular songs usually do, and there is a built-in demo mode to test without Spotify. Lyrics and metadata belong to their rights holders.',
    },
    {
      q: 'How does it know what I am listening to?',
      a: 'Two ways. On Windows, "Automatic" reads the system media session — open any player, no login, no client ID. Otherwise connect Spotify through your own Spotify app via OAuth; the in-game tutorial (Tutorial button on the Spotify page) walks through it step by step.',
    },
    {
      q: 'How do I unlock the mod?',
      a: 'Press J in game and paste the licence code you received with your ticket. The code validates against the mod\'s licence service; without a valid code the game shows the unlock screen instead of the sky.',
    },
    {
      q: 'Can I build it from source?',
      a: 'Yes: ./gradlew build. Sources compile as Java 25 bytecode but fork onto a JDK 26 install (set it in build.gradle), while Gradle itself runs on a JDK 25 (org.gradle.java.home).',
    },
  ],
}

// ---------------------------------------------------------------------------
// Legal — the attribution the project owes and the disclaimers it needs.
// ---------------------------------------------------------------------------

export const legal = {
  eyebrow: 'Fine print',
  title: 'Credits & disclaimers',
  description:
    'Neonlyrics is free and client-side. This page keeps it that way: full attribution, no stored content, nothing hidden.',
  items: [
    {
      key: 'minecraft',
      title: 'Minecraft',
      text: 'Not an official Minecraft product. Not approved by or associated with Mojang or Microsoft. "Minecraft" is a trademark of Mojang Studios. Fabric Loader and the Fabric API belong to FabricMC; this site simply links to them.',
    },
    {
      key: 'spotify',
      title: 'Spotify',
      text: 'Spotify is a trademark of Spotify AB. Neonlyrics talks to Spotify only through the official Spotify Web API, using an app you create yourself in the Spotify dashboard — your login and tokens stay in local files on your PC. Neither the mod nor this site is affiliated with, endorsed by, or sponsored by Spotify AB.',
    },
    {
      key: 'lyrics',
      title: 'Lyrics, covers & audio',
      text: 'The mod and this site do not host, store or distribute any lyrics, recordings or artwork. Synced lyrics are fetched live from lrclib.net, covers from the iTunes Search API and Spotify itself. Song titles, lyrics, recordings and cover art remain the property of their rights holders. The text in the demo preview is the mod\'s own built-in test lyrics — original text published as mod source.',
    },
    {
      key: 'apple',
      title: 'Apple artwork',
      text: "Album artwork shown in game is supplied via Apple's iTunes Search API and remains © the respective rights holders. When no cover resolves, the game and the preview section show the built-in placeholder instead.",
    },
    {
      key: 'fonts',
      title: 'Fonts',
      text: 'The 22 in-game font families are Google Fonts, embedded in the mod under the SIL Open Font License 1.1. This page loads the same families from Google Fonts for the live preview; nothing is bundled or self-hosted here.',
    },
    {
      key: 'site',
      title: 'This website',
      text: `A fan-made community site for the mod, © ${year} mrxennt. Site and mod are MIT licensed — github.com/mrxennt/neon-lyrics. No accounts, no sign-ups and nothing tracked server-side: the previews run locally in your browser and none of the toggles are sent anywhere. Google Fonts is the only third-party resource the page loads.`,
    },
  ],
  trademarks:
    'Minecraft is a trademark of Mojang Studios. Spotify is a trademark of Spotify AB. iTunes is a service mark of Apple Inc. All other product names, logos and brands are property of their respective owners and are used for identification purposes only — no endorsement or affiliation is implied.',
}

export const cta = {
  title: 'Ready to give your sky a soundtrack?',
  description:
    'Grab the jar for your version, drop it in the mods folder, press J and pick a preset. The next time a chorus hits, it will be floating over your world.',
  primary: { label: 'Download for 26.3', href: jars[0].href },
  secondary: { label: 'Download for 1.21.11', href: jars[1].href },
}

export const footer = {
  blurb: 'Spotify-style synced karaoke lyrics in 3D in the sky. Free, client-side, one jar per Minecraft version.',
  columns: [
    {
      title: 'Project',
      links: [
        { label: 'GitHub', href: brand.repo },
        { label: 'Releases', href: `${brand.repo}/releases` },
        { label: 'Issues', href: `${brand.repo}/issues` },
        { label: 'README', href: brand.repo },
      ],
    },
    {
      title: 'Services the mod uses',
      links: [
        { label: 'LRCLIB', href: 'https://lrclib.net' },
        { label: 'iTunes Search API', href: 'https://performance-partners.apple.com/search-api' },
        { label: 'Spotify dashboard', href: 'https://developer.spotify.com/dashboard' },
        { label: 'Fabric', href: 'https://fabricmc.net' },
      ],
    },
    {
      title: 'On this site',
      links: [
        { label: 'Sky preview', href: '#sky' },
        { label: 'Config GUI', href: '#gui' },
        { label: 'Download', href: '#download' },
        { label: 'Legal', href: '#legal' },
      ],
    },
  ],
  legal: `© ${year} mrxennt. Fan-made site; the mod is MIT licensed. Not an official Minecraft product; not affiliated with, endorsed by or sponsored by Mojang Studios, Microsoft or Spotify AB. Minecraft is a trademark of Mojang Studios; Spotify is a trademark of Spotify AB. Lyrics and cover art come from LRCLIB and the iTunes Search API at runtime and remain the property of their rights holders. The demo scene uses the mod's own built-in test lyrics.`,
}
