'use client'

import Link from 'next/link'
import { Upload } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { Skeleton } from '@/Components/ui/Skeleton'
import { StatusChip } from '@/Components/shared/StatusChip'
import { SeverityBadge } from '@/Components/shared/SeverityBadge'
import { ROUTES } from '@/constants/routes'
import type { CaseSummary } from '@/types/case.types'

interface PatientCaseHistoryProps {
  cases: CaseSummary[]
  isLoading?: boolean
  className?: string
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const drVariant = (status: string) => {
  switch (status) {
    case 'PDR': return 'critical' as const
    case 'Severe': return 'high' as const
    case 'Moderate': return 'medium' as const
    case 'Mild': return 'low' as const
    default: return 'none' as const
  }
}

export const PatientCaseHistory = ({
  cases,
  isLoading,
  className,
}: PatientCaseHistoryProps) => {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4 flex gap-4"
          >
            <Skeleton className="w-12 h-12 shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className={cn('flex flex-col items-center py-16 gap-3', className)}>
        <div className="w-14 h-14 rounded-[4px] bg-[var(--bg-subtle)] flex items-center justify-center">
          <Upload size={24} className="text-[var(--text-muted)]" />
        </div>
        <p className="text-sm text-[var(--text-muted)]">
          No cases submitted yet
        </p>
      </div>
    )
  }

  const sorted = [...cases].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {sorted.map((c) => (
        <Link key={c.id} href={ROUTES.CASE_DETAIL(c.id)}>
          <div
            className={cn(
              'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
              'p-4 flex items-center gap-4',
              'hover:border-[var(--border-strong)] transition-colors duration-150',
              'cursor-pointer',
            )}
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-[4px] bg-[var(--bg-elevated)] shrink-0 overflow-hidden">
              <img
                src={`https://picsum.photos/seed/${c.id}/96/96`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusChip status={c.status} />
                <Badge variant={drVariant(c.drStatus)} size="sm">
                  {c.drStatus}
                </Badge>
                <SeverityBadge tier={c.priorityTier} />
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                {formatDateTime(c.createdAt)}
              </p>
            </div>

            {/* Score */}
            <span className="font-mono text-sm text-[var(--text-secondary)] shrink-0">
              {(c.priorityScore * 100).toFixed(0)}%
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
