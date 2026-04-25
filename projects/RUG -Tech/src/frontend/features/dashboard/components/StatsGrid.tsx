'use client'

import { TrendingUp, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/Components/ui/Skeleton'
import { InteractiveCard } from '@/Components/ui/InteractiveCard'
import type { DashboardStats } from '@/features/dashboard/hooks/useDashboardStats'

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  accent: string
  pulse?: boolean
  loading?: boolean
}

const StatCard = ({ label, value, icon, accent, pulse, loading }: StatCardProps) => (
  <InteractiveCard
    className={cn(
      'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
      'flex flex-col justify-between overflow-hidden',
    )}
  >
    <div className="flex items-start justify-between min-h-[60px]">
      {loading ? (
        <Skeleton className="h-8 w-16" />
      ) : (
        <span className="font-mono text-[2rem] leading-none text-[var(--text-primary)]">
          {value}
        </span>
      )}
      <span className={cn('p-1.5 rounded-[4px]', accent, pulse && 'animate-pulse-glow')}>
        {icon}
      </span>
    </div>
    {loading ? (
      <Skeleton className="h-3 w-24 mt-3" />
    ) : (
      <span className="font-condensed text-xs text-[var(--text-muted)] mt-5">
        {label}
      </span>
    )}
  </InteractiveCard>
)

interface StatsGridProps {
  stats: DashboardStats
}

export const StatsGrid = ({ stats }: StatsGridProps) => {
  const cards: StatCardProps[] = [
    {
      label: 'Cases Today',
      value: stats.todayCases,
      icon: <TrendingUp size={18} className="text-amber-400" />,
      accent: 'bg-amber-400/10',
      loading: stats.isLoading,
    },
    {
      label: 'Awaiting Review',
      value: stats.pendingReview,
      icon: <Clock size={18} className="text-[var(--accent)]" />,
      accent: 'bg-[var(--accent)]/10',
      loading: stats.isLoading,
    },
    {
      label: 'Critical Priority',
      value: stats.criticalCases,
      icon: <AlertTriangle size={18} className="text-[var(--sev-critical)]" />,
      accent: 'bg-[var(--sev-critical)]/10',
      pulse: stats.criticalCases > 0,
      loading: stats.isLoading,
    },
    {
      label: 'Quality Failures',
      value: stats.qualityFailures,
      icon: <XCircle size={18} className="text-[var(--text-muted)]" />,
      accent: 'bg-[var(--bg-elevated)]',
      loading: stats.isLoading,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
