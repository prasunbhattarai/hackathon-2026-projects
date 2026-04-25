'use client'

import { useState, useEffect } from 'react'
import { casesMock, caseSummariesMock } from '@/mock/data/cases.mock'
import { analysisResultsMock } from '@/mock/data/analysis.mock'
import { CaseStatus, type CaseSummary } from '@/types/case.types'

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
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<Omit<DashboardStats, 'isLoading'> | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      const total = casesMock.length
      const pendingReview = casesMock.filter(
        (c) => c.status === CaseStatus.AWAITING_REVIEW,
      ).length
      const criticalCases = casesMock.filter(
        (c) => c.priorityTier === 'critical',
      ).length
      const qualityFailures = casesMock.filter(
        (c) => c.status === CaseStatus.QUALITY_FAILED,
      ).length

      const today = new Date().toISOString().slice(0, 10)
      const todayCases = casesMock.filter(
        (c) => c.createdAt.slice(0, 10) === today,
      ).length

      const avgScore =
        casesMock.reduce((sum, c) => sum + c.priorityScore, 0) / total

      // DR severity from analysis results
      const dist = { none: 0, mild: 0, moderate: 0, severe: 0, pdr: 0 }
      for (const a of analysisResultsMock) {
        const s = a.dr.status.toLowerCase() as keyof typeof dist
        if (s in dist) dist[s]++
      }

      const recentCases = [...caseSummariesMock]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 8)

      setStats({
        totalCases: total,
        pendingReview,
        criticalCases,
        todayCases,
        avgPriorityScore: Number(avgScore.toFixed(2)),
        qualityFailures,
        severityDistribution: dist,
        recentCases,
      })
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  return {
    totalCases: stats?.totalCases ?? 0,
    pendingReview: stats?.pendingReview ?? 0,
    criticalCases: stats?.criticalCases ?? 0,
    todayCases: stats?.todayCases ?? 0,
    avgPriorityScore: stats?.avgPriorityScore ?? 0,
    qualityFailures: stats?.qualityFailures ?? 0,
    severityDistribution: stats?.severityDistribution ?? {
      none: 0, mild: 0, moderate: 0, severe: 0, pdr: 0,
    },
    recentCases: stats?.recentCases ?? [],
    isLoading,
  }
}
