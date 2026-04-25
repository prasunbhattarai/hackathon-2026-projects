import type { Metadata } from 'next'
import { AlertTriangle, BookOpen, Eye, HeartPulse, ShieldCheck } from 'lucide-react'
import { PublicNavbar } from '@/Components/Landing/PublicNavbar'
import { PublicFooter } from '@/Components/Landing/PublicFooter'
import { LinkButton } from '@/Components/Landing/LinkButton'
import { Card, CardContent, Badge } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'Diseases',
}

const diseases = [
  {
    name: 'Diabetic Retinopathy',
    severity: 'High impact',
    desc: 'Microaneurysms, hemorrhages, exudates—early detection reduces vision loss risk.',
    icon: <HeartPulse className="h-5 w-5 text-[var(--sev-high)]" />,
  },
  {
    name: 'Glaucoma',
    severity: 'Silent progression',
    desc: 'Optic nerve damage can be subtle—screening helps catch risk patterns earlier.',
    icon: <Eye className="h-5 w-5 text-[var(--success)]" />,
  },
  {
    name: 'AMD (Age-related Macular Degeneration)',
    severity: 'Central vision',
    desc: 'Macular changes affect reading and detail—consistent triage improves follow-up.',
    icon: <AlertTriangle className="h-5 w-5 text-[var(--sev-medium)]" />,
  },
]

export default function DiseasePublicPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Disease library</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            Understand the diseases we help detect.
          </h1>
          <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)]">
            A clinician-friendly overview for demos and onboarding. In the dashboard you’ll find deeper
            entries, case examples, and related reporting.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {diseases.map((d) => (
            <Card key={d.name} className="border border-[var(--border)] bg-[var(--bg-surface)]/55 rounded-[18px]">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-10 w-10 rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] grid place-items-center">
                    {d.icon}
                  </div>
                  <Badge variant="outline">{d.severity}</Badge>
                </div>
                <div className="mt-4 text-base font-semibold text-[var(--text-primary)]">{d.name}</div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">{d.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)] grid place-items-center">
              <BookOpen className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <div className="text-lg font-semibold text-[var(--text-primary)]">Want the full library?</div>
              <div className="text-sm text-[var(--text-muted)]">Sign in and explore the dashboard disease pages.</div>
            </div>
          </div>
          <div className="flex gap-3">
            <LinkButton href={ROUTES.LOGIN} size="lg">
              Log in
            </LinkButton>
            <LinkButton href={ROUTES.AI_PLATFORM} size="lg" variant="secondary" leftIcon={<ShieldCheck className="h-4 w-4" />}>
              AI safety approach
            </LinkButton>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

