import { Container } from '../components/Container'
import { LogoMark } from '../components/Logo'
import { brand, footer } from '../content'

export function Footer() {
  return (
    <footer className="border-t border-line py-14">
      <Container>
        <div className="grid gap-10 sm:grid-cols-[1.2fr_repeat(3,0.8fr)]">
          <div>
            <span className="inline-flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
              <LogoMark />
              {brand.name}
            </span>
            <p className="mt-3 max-w-xs text-pretty text-[13px] leading-relaxed text-muted">{footer.blurb}</p>
          </div>
          {footer.columns.map((col) => (
            <div key={col.title}>
              <p className="text-[13px] font-medium text-fg">{col.title}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link} className="text-[13px] text-muted transition-colors hover:text-fg">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 text-[12px] leading-relaxed text-faint">{footer.legal}</p>
      </Container>
    </footer>
  )
}
