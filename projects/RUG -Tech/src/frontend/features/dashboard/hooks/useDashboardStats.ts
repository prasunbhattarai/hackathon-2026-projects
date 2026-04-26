'use client'

import { useMemo } from 'react'
import { CaseStatus, type CaseSummary } from '@/types/case.types'
import { useCases } from '@/features/cases/hooks/useCases'
import { usePlatformStats } from '@/features/admin/hooks/useAdminData'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth.types'

export interface DashboardStats {
  totalCases: number
  pendingReview: number
  criticalCases: number
  todayCases: number
  avgPriorityScore: number
  qualityFailures: number
  severityDistribution: {
    none: number
    mild: number
    moderate: number
    severe: number
    pdr: number
  }
  recentCases: CaseSummary[]
  isLoading: boolean
}

export function useDashboardStats(): DashboardStats {
  const role = useAuthStore((s) => s.user?.role ?? null)
  const statsQuery = usePlatformStats()
  const casesQuery = useCases({ page: 1, limit: 100 })

  const cases = casesQuery.data?.data?.items ?? []

  const computed = useMemo(() => {
    const total = cases.length
    const pendingReview = cases.filter((c) => c.status === CaseStatus.AWAITING_REVIEW).length
    const criticalCases = cases.filter((c) => c.priorityTier === 'critical').length
    const qualityFailures = cases.filter((c) => c.status === CaseStatus.QUALITY_FAILED).length

    const today = new Date().toISOString().slice(0, 10)
    const todayCases = cases.filter((c) => c.createdAt.slice(0, 10) === today).length

    const avgPriorityScore =
      total > 0 ? Number((cases.reduce((sum, c) => sum + c.priorityScore, 0) / total).toFixed(2)) : 0

    const recentCases = [...cases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8) as CaseSummary[]

    return {
      totalCases: total,
      pendingReview,
      criticalCases,
      todayCases,
      avgPriorityScore,
      qualityFailures,
      recentCases,
    }
  }, [cases])

  const platform = statsQuery.data?.data ?? null

  const base = role === UserRole.SUPER_ADMIN && platform
    ? {
        totalCases: platform.totalCases,
        criticalCases: platform.criticalCases,
        todayCases: platform.todayCases,
        avgPriorityScore: computed.avgPriorityScore,
      }
    : {
        totalCases: computed.totalCases,
        criticalCases: computed.criticalCases,
        todayCases: computed.todayCases,
        avgPriorityScore: computed.avgPriorityScore,
      }

  return {
    ...base,
    pendingReview: computed.pendingReview,
    qualityFailures: computed.qualityFailures,
    // Backend does not currently provide DR severity distribution without per-case analysis aggregation.
    severityDistribution: { none: 0, mild: 0, moderate: 0, severe: 0, pdr: 0 },
    recentCases: computed.recentCases,
    isLoading: casesQuery.isLoading || (role === UserRole.SUPER_ADMIN && statsQuery.isLoading),
  }
}
