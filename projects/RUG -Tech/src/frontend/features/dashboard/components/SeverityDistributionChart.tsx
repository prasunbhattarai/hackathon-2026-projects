'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { DashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { Skeleton } from '@/Components/ui/Skeleton'

interface SeverityDistributionChartProps {
  stats: DashboardStats
  className?: string
}

const bars = [
  { key: 'none', label: 'None', color: 'bg-[var(--sev-none)]' },
  { key: 'mild', label: 'Mild', color: 'bg-[var(--sev-low)]' },
  { key: 'moderate', label: 'Moderate', color: 'bg-[var(--sev-medium)]' },
  { key: 'severe', label: 'Severe', color: 'bg-[var(--sev-high)]' },
  { key: 'pdr', label: 'PDR', color: 'bg-[var(--sev-critical)]' },
] as const

export const SeverityDistributionChart = ({
  stats,
  className,
}: SeverityDistributionChartProps) => {
  const dist = stats.severityDistribution
  const maxVal = Math.max(
    dist.none, dist.mild, dist.moderate, dist.severe, dist.pdr, 1,
  )

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4',
        className,
      )}
    >
      <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-6">
        DR Severity Distribution
      </h3>

      {stats.isLoading ? (
        <div className="flex items-end justify-around gap-4 h-40">
          {bars.map((b) => (
            <div key={b.key} className="flex-1 flex flex-col items-center gap-2">
              <Skeleton className="w-full h-20" />
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-end justify-around gap-4 h-40">
          {bars.map((b) => {
            const value = dist[b.key as keyof typeof dist]
            const heightPct = maxVal > 0 ? (value / maxVal) * 100 : 0

            return (
              <div
                key={b.key}
                className="flex-1 flex flex-col items-center gap-1.5"
              >
                {/* Value */}
                <span className="font-mono text-xs text-[var(--text-primary)]">
                  {value}
                </span>

                {/* Bar container */}
                <div className="w-full h-28 flex items-end">
                  <motion.div
                    className={cn('w-full rounded-t-[2px]', b.color)}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                  />
                </div>

                {/* Label */}
                <span className="font-condensed text-[10px] text-[var(--text-muted)]">
                  {b.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
