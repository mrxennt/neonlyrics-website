import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { cx } from '../lib/cx'
import { features } from '../content'

export function Features() {
  return (
    <section id="features" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={features.eyebrow} title={features.title} description={features.description} />
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {features.items.map((item, i) => (
            <Reveal key={item.key} delay={i * 0.06} className={cx(item.span === 2 && 'sm:col-span-2')}>
              <div className="depth relative h-full rounded-card bg-surface p-6">
                <h3 className="text-[17px] font-semibold text-fg">{item.title}</h3>
                <p className="mt-2 text-pretty text-[14px] leading-relaxed text-muted">{item.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
