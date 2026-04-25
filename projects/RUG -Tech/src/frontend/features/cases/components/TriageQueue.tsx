'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/Components/ui/Skeleton'
import { CaseListItem } from './CaseListItem'
import type { CaseSummary, PriorityTier } from '@/types/case.types'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export interface TriageQueueProps {
  cases: (CaseSummary & { drStatus: string })[]
  loading: boolean
  grouped?: boolean
  className?: string
}

const priorityOrder: PriorityTier[] = ['critical', 'high', 'medium', 'low']

const priorityLabels: Record<PriorityTier, string> = {
  critical: 'CRITICAL PRIORITY',
  high: 'HIGH PRIORITY',
  medium: 'MEDIUM PRIORITY',
  low: 'LOW PRIORITY',
}

const SkeletonCaseItem = () => (
  <div
    className={cn(
      'flex items-center gap-4 px-4 py-3',
      'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
      'border-l-4 border-l-[var(--border)]',
    )}
  >
    <Skeleton className="w-[60px] h-[60px] rounded-[4px] shrink-0" />
    <div className="flex-1 flex flex-col gap-1.5">
      <Skeleton className="h-3.5 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
    <Skeleton className="h-5 w-20 hidden sm:block" />
    <Skeleton className="h-5 w-16 hidden md:block" />
    <Skeleton className="h-7 w-16" />
  </div>
)

export const TriageQueue = ({
  cases,
  loading,
  grouped = true,
  className,
}: TriageQueueProps) => {
  // Loading
  if (loading) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCaseItem key={i} />
        ))}
      </div>
    )
  }

  // Empty
  if (cases.length === 0) {
    return (
      <div className={cn('flex flex-col items-center py-16', className)}>
        <p className="text-sm text-[var(--text-muted)]">
          No cases match the current filters
        </p>
      </div>
    )
  }

  // Grouped by priority
  if (grouped) {
    const groups = priorityOrder
      .map((tier) => ({
        tier,
        label: priorityLabels[tier],
        items: cases.filter((c) => c.priorityTier === tier),
      }))
      .filter((g) => g.items.length > 0)

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className={cn('flex flex-col gap-4', className)}
      >
        {groups.map((group) => (
          <div key={group.tier}>
            <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2 px-1">
              {group.label}
              <span className="ml-2 font-mono text-[10px]">({group.items.length})</span>
            </h3>
            <div className="flex flex-col gap-2">
              {group.items.map((c) => (
                <motion.div key={c.id} variants={staggerItem}>
                  <CaseListItem caseItem={c} />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    )
  }

  // Flat list
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('flex flex-col gap-2', className)}
    >
      {cases.map((c) => (
        <motion.div key={c.id} variants={staggerItem}>
          <CaseListItem caseItem={c} />
        </motion.div>
      ))}
    </motion.div>
  )
}
