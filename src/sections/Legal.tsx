import { Copyright, Disc3, Mic, MonitorSmartphone, Music2, Type } from 'lucide-react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { legal } from '../content'

const icons: Record<string, React.ComponentType<{ className?: string }>> = {
  minecraft: MonitorSmartphone,
  spotify: Music2,
  lyrics: Mic,
  apple: Disc3,
  fonts: Type,
  site: Copyright,
}

export function Legal() {
  return (
    <section id="legal" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={legal.eyebrow} title={legal.title} description={legal.description} />

        <div className="mx-auto mt-12 grid max-w-[900px] gap-4 sm:grid-cols-2">
          {legal.items.map((item, i) => {
            const Icon = icons[item.key] ?? Copyright
            return (
              <Reveal key={item.key} delay={i * 0.05}>
                <div className="depth h-full rounded-card-sm bg-surface p-5">
                  <p className="flex items-center gap-2 text-[15px] font-semibold text-fg">
                    <Icon className="size-4 text-accent" />
                    {item.title}
                  </p>
                  <p className="mt-2 text-pretty text-[13px] leading-relaxed text-muted">{item.text}</p>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-[900px] text-center text-[12px] leading-relaxed text-faint">{legal.trademarks}</p>
        </Reveal>
      </Container>
    </section>
  )
}
