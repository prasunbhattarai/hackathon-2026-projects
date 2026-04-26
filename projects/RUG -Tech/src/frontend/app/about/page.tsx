import type { Metadata } from 'next'
import {
  BrainCircuit,
  ClipboardCheck,
  FolderKanban,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
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
    desc: 'Clinicians, technicians, and admins each get interfaces tuned for their day-to-day responsibilities.',
  },
  {
    icon: <ClipboardCheck className="h-5 w-5 text-[var(--accent)]" />,
    title: 'Built for workflow',
    desc: 'From intake to reports, the product is designed around handoffs, traceability, and speed.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-[var(--success)]" />,
    title: 'Built for trust',
    desc: 'Audit trails, explainability cues, and role-based access support safer adoption in clinical teams.',
  },
  {
    icon: <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />,
    title: 'Built for AI',
    desc: 'Model outputs are packaged into clinical artifacts that are easier to review, teach, and act on.',
  },
]

const userGroups = [
  {
    title: 'Technicians and screeners',
    desc: 'Fast image intake, clear queue visibility, and less uncertainty about which cases need escalation.',
    icon: <Stethoscope className="h-5 w-5 text-[var(--success)]" />,
  },
  {
    title: 'Ophthalmologists and reviewers',
    desc: 'Structured findings, severity framing, and explainable outputs that support a final human decision.',
    icon: <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />,
  },
  {
    title: 'Program and clinic leads',
    desc: 'A more repeatable workflow for multi-site screening programs, demos, and operational reporting.',
    icon: <FolderKanban className="h-5 w-5 text-[var(--success)]" />,
  },
]

const principles = [
  'Keep the AI visible enough to trust, but simple enough to use under time pressure.',
  'Present findings in a format that maps naturally to triage and documentation work.',
  'Support adoption with role-based interfaces instead of one generic screen for everyone.',
  'Treat explainability and auditability as core product features, not afterthoughts.',
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">About us</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--text-primary)] md:text-5xl">
              A platform that makes retinal screening feel effortless.
            </h1>
            <p className="mt-4 text-base text-[var(--text-secondary)] md:text-lg">
              Fundus AI is a clinical workflow product first and an AI system second. We focus on
              clarity, speed, and consistent reporting so teams can triage faster, explain decisions
              better, and document findings with less friction.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--text-muted)] md:text-base">
              The goal is not just to produce a prediction. It is to help a real team move from image
              capture to review, prioritization, and follow-up with a cleaner, safer handoff between
              people and software.
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

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Mission</div>
            <div className="mt-3 text-xl font-semibold text-[var(--text-primary)]">
              Make high-quality retinal screening easier to scale.
            </div>
            <div className="mt-3 text-sm leading-6 text-[var(--text-muted)]">
              We care about practical adoption: fewer ambiguous queues, faster review cycles, better
              reporting consistency, and a clearer path for clinicians to confirm what the model sees.
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Primary use</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">
                  AI-assisted retinal disease detection and triage support
                </div>
              </div>
              <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Output style</div>
                <div className="mt-2 text-sm text-[var(--text-secondary)]">
                  Explainable findings, urgency cues, and clinical report structure
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="rounded-[18px] border border-[var(--border)] bg-[var(--bg-surface)]/55">
              <CardContent className="p-6">
                <div className="grid h-10 w-10 place-items-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-elevated)]">
                  {pillar.icon}
                </div>
                <div className="mt-4 text-base font-semibold text-[var(--text-primary)]">{pillar.title}</div>
                <div className="mt-2 text-sm text-[var(--text-muted)]">{pillar.desc}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-surface)]/55 p-6 md:p-8">
            <div className="text-lg font-semibold text-[var(--text-primary)]">Who the platform is for</div>
            <div className="mt-6 grid gap-4">
              {userGroups.map((group) => (
                <div
                  key={group.title}
                  className="flex gap-4 rounded-[18px] border border-[var(--border)] bg-[var(--bg-elevated)]/55 p-4"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-[var(--border)] bg-[var(--bg-surface)]">
                    {group.icon}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-[var(--text-primary)]">{group.title}</div>
                    <div className="mt-1 text-sm text-[var(--text-muted)]">{group.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
            <div className="text-lg font-semibold text-[var(--text-primary)]">What guides the product</div>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-[var(--text-muted)]">
              {principles.map((principle) => (
                <li
                  key={principle}
                  className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
                >
                  {principle}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-[22px] border border-[var(--border)] bg-[var(--bg-elevated)]/45 p-6 md:p-8">
          <div className="text-lg font-semibold text-[var(--text-primary)]">What you&apos;ll find inside</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-muted)]">
              Case uploads, AI inference, explainability views, and structured reporting in one flow.
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-muted)]">
              Patient timelines and disease reference pages that help with education, follow-up, and onboarding.
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-muted)]">
              Role-aware admin tools for keeping access, staffing, and workflows organized.
            </div>
            <div className="rounded-[16px] border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm text-[var(--text-muted)]">
              A hackathon-friendly experience that still feels grounded in how clinics actually operate.
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}
