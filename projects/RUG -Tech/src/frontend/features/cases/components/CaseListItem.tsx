'use client'

import { useRouter } from 'next/navigation'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { Badge } from '@/Components/ui/Badge'
import { StatusChip } from '@/Components/shared/StatusChip'
import { SeverityBadge } from '@/Components/shared/SeverityBadge'
import { ROUTES } from '@/constants/routes'
import { CaseStatus, type CaseSummary, type PriorityTier } from '@/types/case.types'

export interface CaseListItemProps {
  caseItem: CaseSummary & { drStatus: string }
  className?: string
}

const priorityBorderColor: Record<PriorityTier, string> = {
  critical: 'border-l-[var(--sev-critical)]',
  high: 'border-l-[var(--sev-high)]',
  medium: 'border-l-[var(--sev-medium)]',
  low: 'border-l-[var(--sev-low)]',
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

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export const CaseListItem = ({ caseItem, className }: CaseListItemProps) => {
  const router = useRouter()
  const isCritical = caseItem.priorityTier === 'critical'
  const isProcessing = caseItem.status === CaseStatus.PROCESSING

  return (
    <div
      className={cn(
        'flex items-center gap-4 px-4 py-3',
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
        'border-l-4',
        priorityBorderColor[caseItem.priorityTier],
        'cursor-pointer select-none',
        'transition-all duration-150',
        'hover:border-[var(--border-strong)] hover:scale-[1.001]',
        isCritical && 'bg-[var(--sev-critical)]/[0.03]',
        className,
      )}
      onClick={() => router.push(ROUTES.CASE_DETAIL(caseItem.id))}
    >
      {/* Thumbnail */}
      <div className="w-[60px] h-[60px] rounded-[4px] overflow-hidden bg-[var(--bg-elevated)] shrink-0">
        <img
          src={`https://picsum.photos/seed/${caseItem.id}/120/120`}
          alt="Fundus thumbnail"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Patient info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
          {caseItem.patientName}
        </p>
        <p className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
          {caseItem.id}
        </p>
      </div>

      {/* Status + DR */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          {isProcessing && (
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse-dot" />
          )}
          <StatusChip status={caseItem.status} />
        </div>
        <Badge variant={drVariant(caseItem.drStatus)} size="sm">
          {caseItem.drStatus}
        </Badge>
      </div>

      {/* Priority score */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <SeverityBadge tier={caseItem.priorityTier} />
        <span className="font-mono text-xs text-[var(--text-secondary)] w-8 text-right">
          {caseItem.priorityScore.toFixed(2)}
        </span>
      </div>

      {/* Time */}
      <span className="hidden lg:block text-[11px] text-[var(--text-muted)] font-mono shrink-0 w-16 text-right">
        {timeAgo(caseItem.createdAt)}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="primary"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            router.push(ROUTES.CASE_DETAIL(caseItem.id))
          }}
        >
          Review
        </Button>
        <button
          className={cn(
            'p-1.5 rounded-[4px]',
            'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
            'hover:bg-[var(--bg-subtle)] transition-colors duration-150',
          )}
          onClick={(e) => e.stopPropagation()}
          aria-label="More actions"
        >
          <MoreVertical size={14} />
        </button>
      </div>
    </div>
  )
}
