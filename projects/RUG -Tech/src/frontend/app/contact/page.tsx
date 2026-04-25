import type { Metadata } from 'next'
import { Mail, MapPin, MessageSquareText } from 'lucide-react'
import { PublicNavbar } from '@/Components/Landing/PublicNavbar'
import { PublicFooter } from '@/Components/Landing/PublicFooter'
import { LinkButton } from '@/Components/Landing/LinkButton'
import { Card, CardContent, Input } from '@/Components/ui'
import { ROUTES } from '@/constants/routes'

export const metadata: Metadata = {
  title: 'Contact',
}

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <PublicNavbar />

      <main className="mx-auto max-w-6xl px-4 py-14 md:py-18">
        <div className="max-w-2xl">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Contact</div>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-[var(--text-primary)]">
            Talk to the team.
          </h1>
          <p className="mt-4 text-base md:text-lg text-[var(--text-secondary)]">
            This is a demo contact page for the hackathon. In a real deployment, we’d wire this to your support tooling.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Card className="border border-[var(--border)] bg-[var(--bg-surface)]/55 rounded-[18px]">
            <CardContent className="p-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <MessageSquareText className="h-5 w-5 text-[var(--accent)]" />
                Send a message
              </div>

              <div className="grid gap-3">
                <Input placeholder="Your name" />
                <Input placeholder="Email" type="email" />
                <Input placeholder="Message (demo)" />
              </div>

              <div className="flex gap-3">
                <LinkButton href={ROUTES.LOGIN} size="lg">
                  Log in
                </LinkButton>
                <LinkButton href={ROUTES.HOME} size="lg" variant="secondary">
                  Back home
                </LinkButton>
              </div>
              <div className="text-xs text-[var(--text-muted)]">
                Note: This form doesn’t submit anywhere yet (frontend-only).
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[var(--border)] bg-[var(--bg-surface)]/55 rounded-[18px]">
            <CardContent className="p-6 space-y-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                <Mail className="h-5 w-5 text-[var(--success)]" />
                Support
              </div>
              <div className="text-sm text-[var(--text-muted)]">support@fundus.ai</div>

              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)] pt-3">
                <MapPin className="h-5 w-5 text-[var(--sev-medium)]" />
                Locations
              </div>
              <div className="text-sm text-[var(--text-muted)]">
                Multi-clinic ready. Built to scale from a single screening station to a network.
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <PublicFooter />
    </div>
  )
}

