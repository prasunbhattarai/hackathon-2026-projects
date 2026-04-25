'use client'

import { cn } from '@/lib/cn'
import { casesMock } from '@/mock/data/cases.mock'
import { DonutChart } from '@/components/ui/donut-chart'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface TriageSummaryCardProps {
  className?: string
}

const tiers = [
  { key: 'critical', label: 'Critical', color: 'var(--sev-critical)', dot: 'bg-[var(--sev-critical)]' },
  { key: 'high', label: 'High', color: 'var(--sev-high)', dot: 'bg-[var(--sev-high)]' },
  { key: 'medium', label: 'Medium', color: 'var(--sev-medium)', dot: 'bg-[var(--sev-medium)]' },
  { key: 'low', label: 'Low', color: 'var(--sev-low)', dot: 'bg-[var(--sev-low)]' },
] as const

export const TriageSummaryCard = ({ className }: TriageSummaryCardProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<any | null>(null)

  const { total, counts, chartData } = useMemo(() => {
    const total = casesMock.length
    const counts = tiers.map((t) => ({
      ...t,
      count: casesMock.filter((c) => c.priorityTier === t.key).length,
    }))
    const chartData = counts.map(t => ({
      value: t.count,
      label: t.label,
      color: t.color,
    }))
    return { total, counts, chartData }
  }, [])

  const activeSegment = useMemo(() => chartData.find(d => d.label === hoveredSegment?.label), [hoveredSegment, chartData])

  const displayValue = activeSegment?.value ?? total
  const displayLabel = activeSegment?.label ?? "Total Cases"
  const displayPercentage = activeSegment ? (activeSegment.value / total) * 100 : 100

  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4 flex flex-col',
        className,
      )}
    >
      <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">
        Triage Distribution
      </h3>

      <div className="flex-grow flex items-center justify-center my-4">
        <DonutChart
          data={chartData}
          size={180}
          strokeWidth={22}
          onSegmentHover={setHoveredSegment}
          centerContent={
            <AnimatePresence mode="wait">
              <motion.div
                key={displayLabel}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="flex flex-col items-center justify-center text-center"
              >
                <p className="text-muted-foreground text-xs font-medium truncate max-w-[100px]">
                  {displayLabel}
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {displayValue}
                </p>
                {activeSegment && (
                    <p className="text-md font-medium text-muted-foreground">
                        [{displayPercentage.toFixed(0)}%]
                    </p>
                )}
              </motion.div>
            </AnimatePresence>
          }
        />
      </div>


      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {counts.map((t) => (
          <div
            key={t.key}
            className={cn(
              "flex items-center gap-2 p-1 rounded-md transition-colors duration-200",
              hoveredSegment?.label === t.label && "bg-muted"
            )}
            onMouseEnter={() => setHoveredSegment(chartData.find(d => d.label === t.label))}
            onMouseLeave={() => setHoveredSegment(null)}
          >
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
