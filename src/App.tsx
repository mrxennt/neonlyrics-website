import { useState } from 'react'

import { defaultSkySettings, type SkyPreset, type SkySettings } from './content'
import { ConfigPreview } from './sections/ConfigPreview'
import { Cta } from './sections/Cta'
import { Faq } from './sections/Faq'
import { Features } from './sections/Features'
import { Footer } from './sections/Footer'
import { Hero } from './sections/Hero'
import { Install } from './sections/Install'
import { Nav } from './sections/Nav'
import { PlayerPreview } from './sections/PlayerPreview'
import { SkyShowcase } from './sections/SkyShowcase'

// Shared state: the config GUI replica edits these, the sky preview and the
// player preview render them. One source of truth so the page stays in sync.
export function App() {
  const [settings, setSettings] = useState<SkySettings>(defaultSkySettings)
  const [hatId, setHatId] = useState('halo')

  const setPreset = (preset: SkyPreset) => setSettings((s) => ({ ...s, preset }))

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SkyShowcase settings={settings} onPreset={setPreset} />
        <ConfigPreview settings={settings} setSettings={setSettings} hatId={hatId} onHat={setHatId} />
        <PlayerPreview hatId={hatId} onHat={setHatId} />
        <Features />
        <Install />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  )
}
