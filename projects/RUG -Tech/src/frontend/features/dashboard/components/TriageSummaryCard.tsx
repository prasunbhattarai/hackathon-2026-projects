'use client'

import { cn } from '@/lib/cn'
import { casesMock } from '@/mock/data/cases.mock'

interface TriageSummaryCardProps {
  className?: string
}

const tiers = [
  { key: 'critical', label: 'Critical', color: 'bg-[var(--sev-critical)]', dot: 'bg-[var(--sev-critical)]' },
  { key: 'high', label: 'High', color: 'bg-[var(--sev-high)]', dot: 'bg-[var(--sev-high)]' },
  { key: 'medium', label: 'Medium', color: 'bg-[var(--sev-medium)]', dot: 'bg-[var(--sev-medium)]' },
  { key: 'low', label: 'Low', color: 'bg-[var(--sev-low)]', dot: 'bg-[var(--sev-low)]' },
] as const

export const TriageSummaryCard = ({ className }: TriageSummaryCardProps) => {
  const total = casesMock.length
  const counts = tiers.map((t) => ({
    ...t,
    count: casesMock.filter((c) => c.priorityTier === t.key).length,
  }))

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4',
        className,
      )}
    >
      <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">
        Triage Distribution
      </h3>

      {/* Segmented bar */}
      <div className="flex h-3 rounded-[2px] overflow-hidden gap-px">
        {counts.map((t) => {
          const pct = total > 0 ? (t.count / total) * 100 : 0
          if (pct === 0) return null
          return (
            <div
              key={t.key}
              className={cn('transition-all duration-500', t.color)}
              style={{ width: `${pct}%` }}
              title={`${t.label}: ${t.count} (${Math.round(pct)}%)`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {counts.map((t) => (
          <div key={t.key} className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full shrink-0', t.dot)} />
            <span className="text-xs text-[var(--text-secondary)]">{t.label}</span>
            <span className="font-mono text-xs text-[var(--text-primary)] ml-auto">
              {t.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
