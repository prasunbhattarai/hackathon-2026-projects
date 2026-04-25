import type { Metadata } from 'next'
import { BrainCircuit, FileText, ShieldCheck, Sparkles, Workflow } from 'lucide-react'
import { PublicNavbar } from '@/Components/Landing/PublicNavbar'
import { PublicFooter } from '@/Components/Landing/PublicFooter'
import { LinkButton } from '@/Components/Landing/LinkButton'
import { Card, CardContent } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'AI Platform',
}

const steps = [
  {
    icon: <Workflow className="h-5 w-5 text-[var(--accent)]" />,
    title: 'Ingest & normalize',
    desc: 'Fundus images and metadata are standardized for consistent downstream behavior.',
  },
  {
    icon: <BrainCircuit className="h-5 w-5 text-[var(--success)]" />,
    title: 'Model inference',
    desc: 'The system produces findings and severity cues designed to be reviewed, not blindly trusted.',
  },
  {
    icon: <FileText className="h-5 w-5 text-[var(--accent)]" />,
    title: 'Clinical artifact',
    desc: 'Outputs are translated into structured, human-readable reports compatible with workflow.',
  },
]

export default function AIPlatformPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">AI in our platform</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            Explainable AI, packaged into workflow.
          </h1>
          <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)]">
            We treat AI as a clinical assistant: it surfaces signals, suggests priorities, and generates
            structured documentation—while keeping review and accountability in the loop.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.title} className="border border-[var(--border)] bg-[var(--bg-surface)]/55 rounded-[18px]">
              <CardContent className="p-6">
                <div className="h-10 w-10 rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)] grid place-items-center">
                  {s.icon}
                </div>
                <div className="mt-4 text-base font-semibold text-[var(--text-primary)]">{s.title}</div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">{s.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <ShieldCheck className="h-5 w-5 text-[var(--success)]" />
                Safety & governance by design
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Role-based access, audit-friendly interactions, and explainability cues to support responsible use.
              </div>
            </div>
            <div className="flex gap-3">
              <LinkButton href={ROUTES.LOGIN} size="lg" leftIcon={<Sparkles className="h-4 w-4" />}>
                Try the dashboard
              </LinkButton>
              <LinkButton href={ROUTES.DISEASE_PUBLIC} size="lg" variant="secondary">
                Explore diseases
              </LinkButton>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

