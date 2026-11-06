// Shared app state lives here: the config GUI replica edits `settings` and
// everything that renders (sky scene, its own preview) reads it, one source
// of truth. `restart` drives the demo clock and song-intro flash; nextSong()
// is the in-game prev/next behaviour, including 'New song, new sky'.
import { useState } from 'react'

import { defaultSkySettings, skyCount, type SkySettings } from './content'
import { ConfigPreview } from './sections/ConfigPreview'
import { Cta } from './sections/Cta'
import { Faq } from './sections/Faq'
import { Features } from './sections/Features'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Install } from './sections/Install'
import { Legal } from './sections/Legal'
import { Nav } from './sections/Nav'
import { SkyShowcase } from './sections/SkyShowcase'

export function App() {
  const [settings, setSettings] = useState<SkySettings>(defaultSkySettings)
  const [playing, setPlaying] = useState(true)
  const [restart, setRestart] = useState(0)

  const restartDemo = () => setRestart((n) => n + 1)

  // In game, F9 / prev / next change the track — and with 'New song, new sky'
  // on, the mod shuffles the preset. Rendered truthfully here.
  const nextSong = (backwards?: boolean) => {
    void backwards
    setPlaying(true)
    restartDemo()
    if (settings.skyShuffle && settings.skyEnabled) {
      let n = settings.sky
      while (n === settings.sky) n = Math.floor(Math.random() * skyCount)
      setSettings((s) => ({ ...s, sky: n }))
    }
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SkyShowcase settings={settings} playing={playing} setPlaying={setPlaying} restart={restart} nextSong={nextSong} />
        <ConfigPreview settings={settings} setSettings={setSettings} onRestart={restartDemo} />
        <Features />
        <Install />
        <Faq />
        <Legal />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
