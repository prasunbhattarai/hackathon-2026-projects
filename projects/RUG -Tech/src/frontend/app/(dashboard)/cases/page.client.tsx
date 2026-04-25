'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Badge } from '@/Components/ui/Badge'
import { ROUTES } from '@/constants/routes'
import type { CaseSummary } from '@/types/case.types'
import { caseSummariesMock } from '@/mock/data/cases.mock'
import { CaseFilterBar } from '@/features/cases/components/CaseFilterBar'
import { TriageQueue } from '@/features/cases/components/TriageQueue'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export default function CasesPageClient() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [cases, setCases] = useState<(CaseSummary & { drStatus: string })[]>([])

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [dateRange, setDateRange] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => {
      setCases(caseSummariesMock as (CaseSummary & { drStatus: string })[])
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    cases.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1
    })
    return counts
  }, [cases])

  const criticalCount = cases.filter((c) => c.priorityTier === 'critical').length

  // Filtered + sorted cases
  const filteredCases = useMemo(() => {
    let result = [...cases]

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter)
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      result = result.filter((c) => c.priorityTier === priorityFilter)
    }

    // Sort
    if (sortBy === 'priority') {
      result.sort((a, b) => b.priorityScore - a.priorityScore)
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }

    return result
  }, [cases, statusFilter, priorityFilter, sortBy])

  const resetFilters = () => {
    setStatusFilter('all')
    setPriorityFilter('all')
    setSortBy('newest')
    setDateRange('all')
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Triage Queue"
          subtitle={`${cases.length} cases — ${criticalCount} critical`}
          badge={
            <div className="flex items-center gap-3">
              {criticalCount > 0 && (
                <Badge variant="critical" dot>
                  Critical Alert
                </Badge>
              )}
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                <span className="text-[10px] font-condensed font-medium text-teal-400 uppercase tracking-wider">
                  Live
                </span>
              </div>
            </div>
          }
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Upload size={14} />}
              onClick={() => router.push(ROUTES.CASE_NEW)}
            >
              Upload Case
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-4">
        <CaseFilterBar
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          sortBy={sortBy}
          dateRange={dateRange}
          statusCounts={statusCounts}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onSortChange={setSortBy}
          onDateRangeChange={setDateRange}
          onReset={resetFilters}
        />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-4">
        <TriageQueue
          cases={filteredCases}
          loading={isLoading}
          grouped={statusFilter === 'all'}
        />
      </motion.div>
    </motion.div>
  )
}

