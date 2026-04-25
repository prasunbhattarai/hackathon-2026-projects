'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)]/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 md:grid-cols-3">
        <div className="space-y-3">
          <div className="text-sm font-semibold text-[var(--text-primary)]">Fundus AI</div>
          <p className="text-sm text-[var(--text-muted)]">
            AI-assisted retinal screening, triage, and clinical reporting—built to fit real
            clinic workflows.
          </p>
          <div className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Mail className="h-4 w-4" />
            <span>support@fundus.ai</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Explore</div>
            <Link className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]" href={ROUTES.ABOUT}>
              About
            </Link>
            <Link
              className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              href={ROUTES.DISEASE_PUBLIC}
            >
              Disease library
            </Link>
            <Link className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]" href={ROUTES.AI_PLATFORM}>
              AI platform
            </Link>
            <Link className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]" href={ROUTES.CONTACT}>
              Contact
            </Link>
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Product</div>
            <Link className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]" href={ROUTES.LOGIN}>
              Sign in
            </Link>
            <Link
              className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              href={ROUTES.LOGIN}
            >
              Request demo <ArrowUpRight className="inline h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Notes</div>
          <p className="text-sm text-[var(--text-muted)]">
            For hackathon demo purposes. Not medical advice. Always confirm findings with a qualified clinician.
          </p>
          <p className="text-xs text-[var(--text-disabled)]">© {new Date().getFullYear()} Fundus AI</p>
        </div>
      </div>
    </footer>
  )
}

