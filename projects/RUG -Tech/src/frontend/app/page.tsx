import type { Metadata } from 'next'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
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
    desc: 'Structured findings, severity, and next-step suggestions that map to workflow-ready documentation.',
  },
  {
    title: 'Triage at scale',
    desc: 'Prioritize critical cases first while keeping review pathways consistent across clinics and outreach programs.',
  },
  {
    title: 'Explainable outputs',
    desc: 'Heatmaps and rationale cues support trust, secondary review, and onboarding for new staff.',
  },
]

const featureBadges = [
  'Instant pre-screening',
  'Severity scoring',
  'Case timeline',
  'Clinic-ready exports',
  'Role-based access',
]

const workflow = [
  {
    title: 'Capture',
    desc: 'Upload fundus images from screening sites, outpatient clinics, or routine follow-up visits.',
  },
  {
    title: 'Analyze',
    desc: 'The platform classifies likely disease patterns and highlights urgency signals for human review.',
  },
  {
    title: 'Review',
    desc: 'Clinicians inspect explainability cues, confirm the result, and document the final assessment.',
  },
  {
    title: 'Coordinate',
    desc: 'Teams act on the report faster with clearer next steps for referral, follow-up, or urgent care.',
  },
]

const roleCards = [
  {
    title: 'Screening teams',
    desc: 'Move through large image queues without losing sight of the patients who need attention first.',
    icon: <Users className="h-5 w-5 text-[var(--success)]" />,
  },
  {
    title: 'Clinicians',
    desc: 'Get structured summaries, severity context, and explainable outputs that are easy to verify.',
    icon: <ClipboardCheck className="h-5 w-5 text-[var(--accent)]" />,
  },
  {
    title: 'Program leads',
    desc: 'Standardize workflow quality across sites with auditable decisions and consistent report structure.',
    icon: <ShieldCheck className="h-5 w-5 text-[var(--success)]" />,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main>
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
                  Built for real clinics, screening camps, and wow demos
                </div>

                <h1 className="text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight text-[var(--text-primary)]">
                  Retinal AI that feels like <span className="text-[var(--accent)]">magic</span>,
                  ships like <span className="text-[var(--success)]">software</span>.
                </h1>

                <p className="max-w-xl text-base text-[var(--text-secondary)] md:text-lg">
                  Fundus AI helps clinicians detect, triage, and report retinal disease with
                  consistent, explainable results. It is designed to reduce review friction, shorten
                  time-to-report, and make high-risk findings harder to miss.
                </p>

                <div className="flex flex-col gap-3 sm:flex-row">
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
                  {featureBadges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-muted)]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" />
                      {badge}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-[22px] bg-[var(--accent)]/10 blur-2xl" />
                <Card className="rounded-[22px] border border-[var(--border-strong)] bg-[var(--bg-elevated)]/75 shadow-[var(--shadow-glow-lg)]">
                  <CardContent className="space-y-6 p-6 md:p-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                          Live summary
                        </div>
                        <div className="text-lg font-semibold text-[var(--text-primary)]">
                          Today&apos;s clinic pipeline
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
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                        >
                          <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
                          <div className="text-2xl font-semibold text-[var(--text-primary)]">{stat.value}</div>
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
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]">
                        <div className="h-full w-[62%] rounded-full bg-[var(--sev-high)]/80" />
                      </div>
                      <div className="mt-2 text-[11px] text-[var(--text-muted)]">
                        62% of flagged cases require priority attention
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                          Supported workflows
                        </div>
                        <div className="mt-2 text-sm text-[var(--text-secondary)]">
                          Screening, referral triage, chronic follow-up, and clinician-facing report prep.
                        </div>
                      </div>
                      <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                        <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                          Review model
                        </div>
                        <div className="mt-2 text-sm text-[var(--text-secondary)]">
                          AI-first prioritization with a documented human confirmation step before action.
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-8 md:pb-10">
          <div className="grid gap-4 md:grid-cols-3">
            {highlights.map((highlight) => (
              <Card
                key={highlight.title}
                className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)]/55"
              >
                <CardContent className="p-6">
                  <div className="text-base font-semibold text-[var(--text-primary)]">
                    {highlight.title}
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-muted)]">{highlight.desc}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-8 md:pb-12">
          <div className="rounded-[24px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
            <div className="max-w-2xl">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">How it fits</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)] md:text-3xl">
                A workflow that respects clinical review instead of replacing it.
              </h2>
              <p className="mt-3 text-sm text-[var(--text-secondary)] md:text-base">
                The product is shaped around the moments teams already care about: image intake, risk
                prioritization, explainable interpretation, and clean reporting for follow-up.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {workflow.map((step, index) => (
                <Card
                  key={step.title}
                  className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)]/65"
                >
                  <CardContent className="p-6">
                    <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                      Step {index + 1}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                      {step.title}
                    </div>
                    <div className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{step.desc}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 md:pb-20">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-surface)]/55 p-6 md:p-8">
              <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Who it serves</div>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Built for teams, not just models.
              </h2>
              <div className="mt-6 grid gap-4">
                {roleCards.map((role) => (
                  <div
                    key={role.title}
                    className="flex gap-4 rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]/55 p-4"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)]">
                      {role.icon}
                    </div>
                    <div>
                      <div className="text-base font-semibold text-[var(--text-primary)]">{role.title}</div>
                      <div className="mt-1 text-sm text-[var(--text-muted)]">{role.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
              <div className="text-lg font-semibold text-[var(--text-primary)]">
                Ready to see it in action?
              </div>
              <div className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
                Jump into the dashboard demo to explore patients, disease references, case queues, and
                structured reports in one flow.
              </div>
              <div className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  Review disease summaries and severity stages.
                </div>
                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  Inspect AI findings with human-readable justifications.
                </div>
                <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  Follow the path from upload to patient-ready report.
                </div>
              </div>
              <div className="mt-6">
                <LinkButton href={ROUTES.LOGIN} size="lg">
                  Go to login
                </LinkButton>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  )
}
