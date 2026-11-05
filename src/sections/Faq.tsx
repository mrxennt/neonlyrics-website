import { useState } from 'react'
import { Plus } from 'lucide-react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { cx } from '../lib/cx'
import { faq } from '../content'

export function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading title={faq.title} />
        <div className="mx-auto mt-12 flex max-w-[760px] flex-col gap-3">
          {faq.items.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div className="depth relative rounded-card bg-surface">
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[15px] font-medium text-fg">{item.q}</span>
                    <Plus className={cx('size-4 shrink-0 text-muted transition-transform duration-200', isOpen && 'rotate-45')} />
                  </button>
                  {isOpen && <p className="px-6 pb-5 text-pretty text-[14px] leading-relaxed text-muted">{item.a}</p>}
                </div>
              </Reveal>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
