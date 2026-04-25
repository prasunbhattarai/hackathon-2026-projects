'use client'

import Link from 'next/link'
import { Check, X, ChevronRight, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { StatusChip } from '@/Components/shared/StatusChip'
import { ROUTES } from '@/constants/routes'
import { CaseStatus, type CaseDetail } from '@/types/case.types'
import { useAuthStore } from '@/store/authStore'

export interface CaseDetailHeaderProps {
  caseData: CaseDetail
  className?: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const CaseDetailHeader = ({
  caseData,
  className,
}: CaseDetailHeaderProps) => {
  const hasPermission = useAuthStore((s) => s.hasPermission)
  const isReviewable = caseData.status === CaseStatus.AWAITING_REVIEW
  const canReview = hasPermission('case:approve')

  return (
    <div className={cn('border-b border-[var(--border)] pb-5 mb-6', className)}>
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1 mb-3">
        <Link
          href={ROUTES.CASES}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          Cases
        </Link>
        <ChevronRight size={12} className="text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-secondary)]">{caseData.id}</span>
      </nav>

      <div className="flex items-start justify-between gap-4">
        {/* Left — info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="font-display text-[1.75rem] leading-tight text-[var(--text-primary)]">
              <Link
                href={ROUTES.PATIENT_DETAIL(caseData.patient.id)}
                className="hover:text-[var(--accent)] transition-colors"
              >
                {caseData.patient.fullName}
              </Link>
            </h1>
            <StatusChip status={caseData.status} />
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs font-mono text-[var(--text-muted)]">
              {caseData.id}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Calendar size={11} />
              {formatDate(caseData.createdAt)}
            </span>
            <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <User size={11} />
              {caseData.submittedByUser.fullName}
            </span>
          </div>
        </div>

        {/* Right — actions */}
        {isReviewable && canReview && (
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="primary" size="md" leftIcon={<Check size={14} />}>
              Approve
            </Button>
            <Button variant="danger" size="md" leftIcon={<X size={14} />}>
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
