import type { Metadata } from 'next'
import { BookOpen, CircleDot, Eye, Heart, ShieldCheck } from 'lucide-react'
import { PublicNavbar } from '@/Components/Landing/PublicNavbar'
import { PublicFooter } from '@/Components/Landing/PublicFooter'
import { LinkButton } from '@/Components/Landing/LinkButton'
import { Badge, Card, CardContent } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'
import { diseases as diseaseLibrary, type DiseaseInfo } from '@/features/diseases/data/diseases.static'

export const metadata: Metadata = {
  title: 'Diseases',
}

const iconMap = {
  Eye,
  CircleDot,
  Heart,
}

const publicDiseases = diseaseLibrary

function DiseaseIcon({ disease }: { disease: DiseaseInfo }) {
  const Icon = iconMap[disease.iconName as keyof typeof iconMap] ?? Eye

  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)]"
      style={{
        backgroundColor: `color-mix(in srgb, ${disease.accentColor} 12%, var(--bg-elevated))`,
      }}
    >
      <Icon className="h-5 w-5" style={{ color: disease.accentColor }} />
    </div>
  )
}

export default function DiseasePublicPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Disease library</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              Understand the diseases we help detect.
            </h1>
            <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
              This public overview introduces the retinal conditions supported in the platform, why they
              matter, and what kinds of signals Fundus AI looks for during image-based screening.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-muted)] md:text-base">
              Inside the dashboard, each disease includes a fuller reference page for deeper review. Here
              we surface the most useful onboarding information for demos, stakeholders, and first-time
              users.
            </p>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">At a glance</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs text-[var(--text-muted)]">Conditions</div>
                <div className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
                  {publicDiseases.length}
                </div>
              </div>
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs text-[var(--text-muted)]">Use case</div>
                <div className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  Screening and triage
                </div>
              </div>
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs text-[var(--text-muted)]">Outputs</div>
                <div className="mt-2 text-sm font-medium text-[var(--text-primary)]">
                  Risk, grade, and explainability
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
              These pages are educational summaries only. Final diagnosis and treatment decisions still
              require qualified clinical review.
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5">
          {publicDiseases.map((disease) => (
            <Card
              key={disease.slug}
              className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-surface)]/55"
            >
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3">
                      <DiseaseIcon disease={disease} />
                      <div>
                        <div className="text-xl font-semibold text-[var(--text-primary)]">
                          {disease.name}
                        </div>
                        <div className="mt-1 text-sm text-[var(--text-muted)]">
                          {disease.shortDescription}
                        </div>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-[var(--text-secondary)] md:text-base">
                      {disease.overview}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:w-[340px] lg:grid-cols-1">
                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)]/55 p-4">
                      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                        Stage count
                      </div>
                      <div className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
                        {disease.stages.length} supported stages
                      </div>
                    </div>
                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)]/55 p-4">
                      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                        Prevalence
                      </div>
                      <div className="mt-2 text-sm text-[var(--text-secondary)]">{disease.prevalence}</div>
                    </div>
                    <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-elevated)]/55 p-4">
                      <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">
                        AI capability
                      </div>
                      <div className="mt-2 text-sm text-[var(--text-secondary)]">
                        {disease.aiCapability}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-5">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Symptoms</div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {disease.symptoms.slice(0, 6).map((symptom) => (
                        <Badge key={symptom} variant="outline" className="normal-case tracking-normal">
                          {symptom}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-5">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Risk factors</div>
                    <ul className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                      {disease.riskFactors.slice(0, 4).map((factor) => (
                        <li key={factor} className="rounded-[14px] bg-[var(--bg-surface)] px-3 py-2">
                          {factor}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-5">
                    <div className="text-sm font-semibold text-[var(--text-primary)]">Common management</div>
                    <ul className="mt-4 grid gap-2 text-sm text-[var(--text-muted)]">
                      {disease.treatments.slice(0, 4).map((treatment) => (
                        <li key={treatment} className="rounded-[14px] bg-[var(--bg-surface)] px-3 py-2">
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-5">
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Severity stages</div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {disease.stages.map((stage) => (
                      <div
                        key={stage.name}
                        className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">{stage.name}</div>
                          <Badge variant={stage.tier}>
                            {stage.tier}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
                          {stage.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)]">
                <BookOpen className="h-5 w-5 text-[var(--accent)]" />
              </div>
              <div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">Want the full library?</div>
                <div className="text-sm text-[var(--text-muted)]">
                  Sign in for dashboard disease pages, case workflows, and the broader AI review flow.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <LinkButton href={ROUTES.LOGIN} size="lg">
                Log in
              </LinkButton>
              <LinkButton
                href={ROUTES.AI_PLATFORM}
                size="lg"
                variant="secondary"
                leftIcon={<ShieldCheck className="h-4 w-4" />}
              >
                AI safety approach
              </LinkButton>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
