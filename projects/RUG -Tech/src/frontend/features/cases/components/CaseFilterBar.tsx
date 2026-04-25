'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { CaseStatus, type PriorityTier } from '@/types/case.types'

export interface CaseFilterBarProps {
  statusFilter: string
  priorityFilter: string
  sortBy: string
  dateRange: string
  statusCounts: Record<string, number>
  onStatusChange: (status: string) => void
  onPriorityChange: (priority: string) => void
  onSortChange: (sort: string) => void
  onDateRangeChange: (range: string) => void
  onReset: () => void
  className?: string
}

const statusOptions = [
  { id: 'all', label: 'All' },
  { id: CaseStatus.AWAITING_REVIEW, label: 'Awaiting Review' },
  { id: CaseStatus.PROCESSING, label: 'Processing' },
  { id: CaseStatus.APPROVED, label: 'Approved' },
]

const priorityOptions = [
  { value: 'all', label: 'All Priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'priority', label: 'Priority Score' },
  { value: 'severity', label: 'DR Severity' },
]

const dateOptions = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
]

export const CaseFilterBar = ({
  statusFilter,
  priorityFilter,
  sortBy,
  dateRange,
  statusCounts,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onDateRangeChange,
  onReset,
  className,
}: CaseFilterBarProps) => {
  const hasFilters = statusFilter !== 'all' || priorityFilter !== 'all' || sortBy !== 'newest' || dateRange !== 'all'

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Status segmented buttons */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {statusOptions.map((opt) => {
          const count = opt.id === 'all'
            ? Object.values(statusCounts).reduce((a, b) => a + b, 0)
            : statusCounts[opt.id] ?? 0
          const isActive = statusFilter === opt.id

          return (
            <button
              key={opt.id}
              onClick={() => onStatusChange(opt.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px]',
                'text-xs font-condensed font-medium whitespace-nowrap',
                'transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] border border-[var(--border)]',
              )}
            >
              {opt.label}
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-[3px] font-mono',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]',
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Second row: dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority */}
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className={cn(
            'h-7 px-2 text-xs rounded-[4px]',
            'bg-[var(--bg-elevated)] border border-[var(--border)]',
            'text-[var(--text-secondary)]',
            'focus:outline-none focus:border-[var(--accent)]',
            'cursor-pointer',
          )}
        >
          {priorityOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className={cn(
            'h-7 px-2 text-xs rounded-[4px]',
            'bg-[var(--bg-elevated)] border border-[var(--border)]',
            'text-[var(--text-secondary)]',
            'focus:outline-none focus:border-[var(--accent)]',
            'cursor-pointer',
          )}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Date range */}
        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className={cn(
            'h-7 px-2 text-xs rounded-[4px]',
            'bg-[var(--bg-elevated)] border border-[var(--border)]',
            'text-[var(--text-secondary)]',
            'focus:outline-none focus:border-[var(--accent)]',
            'cursor-pointer',
          )}
        >
          {dateOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {/* Reset */}
        {hasFilters && (
          <button
            onClick={onReset}
            className={cn(
              'flex items-center gap-1 h-7 px-2 text-xs rounded-[4px]',
              'text-[var(--accent)] hover:bg-[var(--accent)]/10',
              'transition-colors duration-150 cursor-pointer',
            )}
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  )
}
