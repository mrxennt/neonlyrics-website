import { Download } from 'lucide-react'

import { Button } from '../components/Button'
import { GithubMark } from '../components/GithubMark'
import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { brand, cta } from '../content'

export function Cta() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="depth relative overflow-hidden rounded-card bg-surface px-6 py-14 text-center sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="absolute inset-0 [background:radial-gradient(70%_80%_at_50%_0%,rgb(255_79_216/0.14),transparent_70%)]"
            />
            <div aria-hidden className="noise pointer-events-none absolute inset-0" />
            <div className="relative">
              <h2 className="text-balance text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[40px]">{cta.title}</h2>
              <p className="mx-auto mt-4 max-w-xl text-pretty text-[16px] leading-relaxed text-muted">{cta.description}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button size="lg" href={cta.primary.href}>
                  <Download />
                  {cta.primary.label}
                </Button>
                <Button size="lg" variant="secondary" href={cta.secondary.href}>
                  {cta.secondary.label}
                </Button>
              </div>
              <p className="mt-6 text-[13px] text-faint">
                Or build from source:{' '}
                <a href={brand.repo} className="inline-flex items-center gap-1 underline decoration-line hover:text-fg">
                  <GithubMark className="inline size-3.5" />
                  github.com/mrxennt/neon-lyrics
                </a>
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
