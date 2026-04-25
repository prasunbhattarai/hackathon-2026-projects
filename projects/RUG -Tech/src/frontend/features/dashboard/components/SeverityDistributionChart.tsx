'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { DashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { Skeleton } from '@/Components/ui/Skeleton'
import { Tooltip } from '@/Components/ui/Tooltip'

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

  const severityBars = bars.map((b) => {
    const value = dist[b.key as keyof typeof dist]
    const heightPct = maxVal > 0 ? (value / maxVal) * 100 : 0

    return { ...b, value, heightPct }
  })

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[10px] p-4 flex flex-col h-full',
        className,
      )}
    >
      <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-6">
        DR Severity Distribution
      </h3>

      {stats.isLoading ? (
        <div className="flex-1 flex flex-col min-h-[200px]">
          <Skeleton className="flex-1 w-full" />
          <div className="mt-3 grid grid-cols-5 gap-3">
            {bars.map((b) => (
              <Skeleton key={b.key} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-[200px]">
          <div className="flex-1 rounded-[10px] border border-[var(--border)] bg-[var(--bg-elevated)]/40 px-2 py-2">
            <div className="grid h-full w-full grid-cols-5 gap-3 items-end">
              {severityBars.map((bar, index) => (
                <div key={bar.key} className="flex h-full items-end justify-center">
                  <div className="w-16 max-w-full md:w-20 h-full flex items-end justify-center [&>div]:h-full [&>div]:w-full">
                    <Tooltip
                      content={(
                        <div className="flex items-center gap-2">
                          <span className="font-condensed text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                            {bar.label}
                          </span>
                          <span className="font-mono text-xs text-[var(--text-primary)]">{bar.value}</span>
                        </div>
                      )}
                    >
                      <div className="flex h-full w-full items-end justify-center">
                        <motion.div
                          className={cn(
                            'w-full cursor-pointer rounded-[6px]',
                            bar.color,
                          )}
                          style={{
                            height: `${Math.max(bar.heightPct * 0.9, 5)}%`,
                            transformOrigin: 'bottom',
                          }}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{
                            type: 'spring',
                            stiffness: 110,
                            damping: 16,
                            delay: 0.08 + index * 0.04,
                          }}
                          whileHover={{
                            scale: 1.06,
                            y: -4,
                            transition: { type: 'spring', stiffness: 220, damping: 14 },
                          }}
                          aria-label={`${bar.label}: ${bar.value}`}
                        />
                      </div>
                    </Tooltip>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-2 grid grid-cols-5 gap-3">
            {severityBars.map((bar) => (
              <div key={bar.key} className="flex items-center justify-center">
                <span className="font-condensed text-[10px] text-[var(--text-muted)]">
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
