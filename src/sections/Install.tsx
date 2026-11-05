import { Archive, Download } from 'lucide-react'

import { Container } from '../components/Container'
import { Reveal } from '../components/Reveal'
import { SectionHeading } from '../components/SectionHeading'
import { downloads, install } from '../content'

export function Install() {
  return (
    <section id="download" className="relative py-20 sm:py-28">
      <Container>
        <SectionHeading eyebrow={downloads.eyebrow} title={downloads.title} description={downloads.description} />

        {/* Direct jar links */}
        <div className="mx-auto mt-12 grid max-w-[880px] gap-4 sm:grid-cols-2">
          {downloads.jars.map((jar) => (
            <Reveal key={jar.key}>
              <div className="depth relative flex h-full flex-col rounded-card bg-surface p-6">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-[12px] [background:linear-gradient(135deg,#ff4fd8,#5ff3ff)]">
                    <Archive className="size-5 text-white" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold text-fg">Minecraft {jar.mc}</p>
                    <p className="truncate text-[12px] text-faint">{jar.file}</p>
                  </div>
                </div>
                <dl className="mt-4 flex gap-5 text-[12px] text-muted">
                  <span>
                    <dt className="text-faint">Size</dt>
                    <dd className="mt-0.5">{jar.size}</dd>
                  </span>
                  <span className="min-w-0">
                    <dt className="text-faint">SHA-256</dt>
                    <dd className="mt-0.5 truncate font-mono">{jar.sha256}</dd>
                  </span>
                </dl>
                <a
                  href={jar.href}
                  download
                  className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-control bg-fg text-[14px] font-medium text-bg transition-colors hover:bg-white"
                >
                  <Download className="size-4" />
                  Download jar
                </a>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.1}>
          <p className="mt-4 text-center text-[12px] text-faint">
            Release {downloads.releaseTag} · {downloads.releaseDate} · <a className="underline decoration-line hover:text-fg" href="https://github.com/mrxennt/neon-lyrics/releases">all releases on GitHub</a>
          </p>
        </Reveal>

        {/* Steps */}
        <div className="mx-auto mt-14 grid max-w-[880px] gap-4 sm:grid-cols-3">
          {install.steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <div className="depth relative h-full rounded-card bg-surface p-6">
                <span className="grid size-8 place-items-center rounded-[10px] bg-white/[0.06] text-[14px] font-semibold text-accent-2">
                  {i + 1}
                </span>
                <h3 className="mt-3 text-[15px] font-semibold text-fg">{step.title}</h3>
                <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-muted">{step.description}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Requirements */}
        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 flex max-w-[880px] flex-wrap items-center justify-center gap-2">
            {install.requirements.map((r) => (
              <span key={r} className="depth inline-flex h-9 items-center rounded-[12px] bg-white/[0.03] px-3.5 text-[13px] text-muted">
                {r}
              </span>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
