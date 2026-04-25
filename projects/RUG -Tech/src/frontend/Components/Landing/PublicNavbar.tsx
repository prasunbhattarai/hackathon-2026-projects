'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, BrainCircuit, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'
import { ThemeToggle } from '@/Components/ui/ThemeToggle'

const nav = [
  { label: 'Home', href: ROUTES.HOME },
  { label: 'About', href: ROUTES.ABOUT },
  { label: 'Diseases', href: ROUTES.DISEASE_PUBLIC },
  { label: 'AI Platform', href: ROUTES.AI_PLATFORM },
  { label: 'Contact', href: ROUTES.CONTACT },
]

export function PublicNavbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--bg-base)_88%,transparent)] backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3">
        <Link href={ROUTES.HOME} className="group inline-flex items-center gap-2">
          <span className="relative grid h-9 w-9 place-items-center rounded-[12px] border border-[var(--border-strong)] bg-[var(--bg-surface)] shadow-[var(--shadow-glow-sm)]">
            <Activity className="h-4.5 w-4.5 text-[var(--success)]" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-tight text-[var(--text-primary)]">
              Fundus AI
            </span>
            <span className="block text-[11px] text-[var(--text-muted)]">
              Retinal intelligence, clinically usable
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-3 py-2 rounded-[10px] text-sm',
                  'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
                  active && 'text-[var(--text-primary)] bg-[var(--bg-subtle)]',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* <div className="hidden lg:flex items-center gap-2 mr-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
              HIPAA-ready workflows
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-2.5 py-1 text-[11px] text-[var(--text-muted)]">
              <BrainCircuit className="h-3.5 w-3.5 text-[var(--accent)]" />
              Explainable outputs
            </span>
          </div> */}

          <ThemeToggle />

          <Button
            as={Link}
            href={ROUTES.LOGIN}
            variant="secondary"
            size="md"
            className="hidden sm:inline-flex"
          >
            Log in
          </Button>
          <Button as={Link} href={ROUTES.LOGIN} variant="primary" size="md">
            Start demo
          </Button>
        </div>
      </div>
    </header>
  )
}

