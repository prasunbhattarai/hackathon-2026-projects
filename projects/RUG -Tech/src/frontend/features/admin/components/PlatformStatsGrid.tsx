'use client'

import { motion } from 'framer-motion'
import { Building2, Users, FileStack, Calendar, AlertTriangle, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/Components/ui/Skeleton'
import type { PlatformStats } from '@/types/admin.types'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export interface PlatformStatsGridProps {
  stats: PlatformStats | null
  loading: boolean
  className?: string
}

const statCards = [
  { key: 'totalClinics' as const, label: 'Total Clinics', icon: Building2, color: 'var(--accent)' },
  { key: 'totalUsers' as const, label: 'Total Users', icon: Users, color: '#8b5cf6' },
  { key: 'totalCases' as const, label: 'Total Cases', icon: FileStack, color: 'var(--sev-low)' },
  { key: 'todayCases' as const, label: 'Cases Today', icon: Calendar, color: 'var(--sev-medium)' },
  { key: 'criticalCases' as const, label: 'Critical Active', icon: AlertTriangle, color: 'var(--sev-critical)' },
  { key: 'avgProcessingTimeMs' as const, label: 'Avg Process Time', icon: Clock, color: 'var(--sev-high)' },
]

function formatValue(key: string, value: number): string {
  if (key === 'avgProcessingTimeMs') return `${(value / 1000).toFixed(1)}s`
  return value.toLocaleString()
}

export const PlatformStatsGrid = ({
  stats,
  loading,
  className,
}: PlatformStatsGridProps) => {
  if (loading || !stats) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-5">
            <Skeleton className="h-4 w-16 mb-3" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={cn('grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3', className)}
    >
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]

        return (
          <motion.div
            key={card.key}
            variants={staggerItem}
            className={cn(
              'relative bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
              'p-5 overflow-hidden',
              'hover:border-[var(--border-strong)] transition-colors duration-150',
            )}
          >
            {/* Subtle gradient */}
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                background: `radial-gradient(ellipse at top right, ${card.color}, transparent 70%)`,
              }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} style={{ color: card.color }} />
                <span className="font-condensed font-medium text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  {card.label}
                </span>
              </div>
              <p className="font-mono text-2xl font-bold text-[var(--text-primary)]">
                {formatValue(card.key, value)}
              </p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
