import type { Metadata } from 'next'
import { ArrowRight, BrainCircuit, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { PublicNavbar } from '@/Components/Landing/PublicNavbar'
import { PublicFooter } from '@/Components/Landing/PublicFooter'
import { LinkButton } from '@/Components/Landing/LinkButton'
import { Card, CardContent } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'Home',
}

const highlights = [
  {
    title: 'Clinically readable reports',
    desc: 'Structured findings, severity, and next-step suggestions that map to workflow—ready for the chart.',
  },
  {
    title: 'Triage at scale',
    desc: 'Prioritize critical cases first while keeping auditability and consistency across sites.',
  },
  {
    title: 'Explainable outputs',
    desc: 'Heatmaps and rationale cues to support trust, review, and training across the team.',
  },
]

const featureBadges = [
  'Instant pre-screening',
  'Severity scoring',
  'Case timeline',
  'Clinic-ready exports',
  'Role-based access',
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[var(--accent)]/10 blur-3xl" />
            <div className="absolute top-16 right-[-120px] h-[360px] w-[360px] rounded-full bg-[var(--success)]/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pt-14 pb-10 md:pt-20 md:pb-16">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-muted)]">
                  <Sparkles className="h-4 w-4 text-[var(--accent)]" />
                  Built for real clinics — designed for wow demos
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--text-primary)]">
                  Retinal AI that feels like{' '}
                  <span className="text-[var(--accent)]">magic</span>, ships like{' '}
                  <span className="text-[var(--success)]">software</span>.
                </h1>

                <p className="text-base md:text-lg text-[var(--text-secondary)] max-w-xl">
                  Fundus AI helps clinicians detect, triage, and report retinal disease with
                  consistent, explainable results—without slowing down the day.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <LinkButton href={ROUTES.LOGIN} size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    Log in to dashboard
                  </LinkButton>
                  <LinkButton
                    href={ROUTES.AI_PLATFORM}
                    size="lg"
                    variant="secondary"
                    rightIcon={<BrainCircuit className="h-4 w-4" />}
                  >
                    How our AI works
                  </LinkButton>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featureBadges.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-muted)]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hero card */}
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-[22px] bg-[var(--accent)]/10 blur-2xl" />
                <Card className="border border-[var(--border-strong)] bg-[var(--bg-elevated)]/75 shadow-[var(--shadow-glow-lg)] rounded-[22px]">
                  <CardContent className="p-6 md:p-8 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                          Live summary
                        </div>
                        <div className="text-lg font-semibold text-[var(--text-primary)]">
                          Today’s clinic pipeline
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-secondary)]">
                        <ShieldCheck className="h-4 w-4 text-[var(--success)]" />
                        Auditable
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Queued', value: '18' },
                        { label: 'Flagged', value: '6' },
                        { label: 'Reported', value: '42' },
                      ].map((s) => (
                        <div
                          key={s.label}
                          className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                        >
                          <div className="text-xs text-[var(--text-muted)]">{s.label}</div>
                          <div className="text-2xl font-semibold text-[var(--text-primary)]">{s.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-[var(--text-primary)]">
                            Critical detected
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Automated triage with human review
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-[var(--sev-high)]">High</div>
                      </div>
                      <div className="mt-3 h-2 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                        <div className="h-full w-[62%] rounded-full bg-[var(--sev-high)]/80" />
                      </div>
                      <div className="mt-2 text-[11px] text-[var(--text-muted)]">
                        62% of flagged cases require priority attention
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Highlights */}
        <section className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((h) => (
              <Card
                key={h.title}
                className="border border-[var(--border)] bg-[var(--bg-surface)]/55 rounded-[18px]"
              >
                <CardContent className="p-6">
                  <div className="text-base font-semibold text-[var(--text-primary)]">{h.title}</div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">{h.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                Ready to see it in action?
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Jump into the dashboard demo and explore cases, patients, and reports.
              </div>
            </div>
            <LinkButton href={ROUTES.LOGIN} size="lg">
              Go to login
            </LinkButton>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}

