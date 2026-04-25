'use client'

import { cn } from '@/lib/cn'
import type { PriorityTier } from '@/types/case.types'

export interface SeverityBadgeProps {
  tier: PriorityTier
  className?: string
}

const tierConfig: Record<PriorityTier, { label: string; classes: string }> = {
  critical: {
    label: 'Critical',
    classes:
      'bg-[var(--sev-critical)]/15 text-[var(--sev-critical)] border-[var(--sev-critical)]/30',
  },
  high: {
    label: 'High',
    classes:
      'bg-[var(--sev-high)]/15 text-[var(--sev-high)] border-[var(--sev-high)]/30',
  },
  medium: {
    label: 'Medium',
    classes:
      'bg-[var(--sev-medium)]/15 text-[var(--sev-medium)] border-[var(--sev-medium)]/30',
  },
  low: {
    label: 'Low',
    classes:
      'bg-[var(--sev-low)]/15 text-[var(--sev-low)] border-[var(--sev-low)]/30',
  },
}

export const SeverityBadge = ({ tier, className }: SeverityBadgeProps) => {
  const cfg = tierConfig[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5',
        'text-[10px] font-condensed font-medium',
        'rounded-[999px] border whitespace-nowrap',
        tier === 'critical' && 'animate-critical-shadow-pulse',
        cfg.classes,
        className,
      )}
      aria-label={`Severity: ${cfg.label}`}
    >
      {cfg.label}
    </span>
  )
}
