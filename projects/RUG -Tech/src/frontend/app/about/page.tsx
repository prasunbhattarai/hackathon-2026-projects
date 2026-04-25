import type { Metadata } from 'next'
import { BrainCircuit, ClipboardCheck, ShieldCheck, Users } from 'lucide-react'
import { PublicNavbar } from '@/Components/Landing/PublicNavbar'
import { PublicFooter } from '@/Components/Landing/PublicFooter'
import { LinkButton } from '@/Components/Landing/LinkButton'
import { Card, CardContent } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'About',
}

const pillars = [
  {
    icon: <Users className="h-5 w-5 text-[var(--success)]" />,
    title: 'Built for people',
    desc: 'Clinicians, technicians, and admins—each get interfaces tuned for their day-to-day.',
  },
  {
    icon: <ClipboardCheck className="h-5 w-5 text-[var(--accent)]" />,
    title: 'Built for workflow',
    desc: 'From intake to reports, we optimize the pipeline rather than chasing vanity metrics.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-[var(--success)]" />,
    title: 'Built for trust',
    desc: 'Audit trails, explainability cues, and role-based access to support safe adoption.',
  },
  {
    icon: <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />,
    title: 'Built for AI',
    desc: 'Model outputs are packaged into clinical artifacts—clear, consistent, and reviewable.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">About us</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            A platform that makes retinal screening feel effortless.
          </h1>
          <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)]">
            Fundus AI is a clinical workflow product first—and an AI system second. We focus on clarity,
            speed, and consistent reporting so teams can triage faster and document better.
          </p>
          <div className="mt-6 flex gap-3">
            <LinkButton href={ROUTES.LOGIN} size="lg">
              Log in
            </LinkButton>
            <LinkButton href={ROUTES.AI_PLATFORM} size="lg" variant="secondary">
              See the AI approach
            </LinkButton>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <Card key={p.title} className="border border-[var(--border)] bg-[var(--bg-surface)]/55 rounded-[18px]">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] grid place-items-center">
                  {p.icon}
                </div>
                <div className="mt-4 text-base font-semibold text-[var(--text-primary)]">{p.title}</div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">{p.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
          <div className="text-lg font-semibold text-[var(--text-primary)]">What you’ll find inside</div>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--text-muted)] md:grid-cols-2">
            <li>• Case uploads, AI inference, and structured reporting</li>
            <li>• Patient timeline & longitudinal tracking</li>
            <li>• Disease library for clinician-friendly education</li>
            <li>• Admin tools with role-based access</li>
          </ul>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

