'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload } from 'lucide-react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Badge } from '@/Components/ui/Badge'
import { ROUTES } from '@/constants/routes'
import type { CaseSummary } from '@/types/case.types'
import { CaseFilterBar } from '@/features/cases/components/CaseFilterBar'
import { TriageQueue } from '@/features/cases/components/TriageQueue'
import { staggerContainer, staggerItem } from '@/animations/page.variants'
import { useCases } from '@/features/cases/hooks/useCases'

export default function CasesPageClient() {
  const router = useRouter()

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [dateRange, setDateRange] = useState('all')

  const casesQuery = useCases({
    page: 1,
    limit: 50,
    status: statusFilter !== 'all' ? (statusFilter as never) : undefined,
    priorityTier: priorityFilter !== 'all' ? (priorityFilter as never) : undefined,
  })

  const cases = (casesQuery.data?.data?.items ?? []) as (CaseSummary & { drStatus: string })[]
  const isLoading = casesQuery.isLoading

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

    // Sort
    if (sortBy === 'priority') {
      result.sort((a, b) => b.priorityScore - a.priorityScore)
    } else if (sortBy === 'newest') {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    }

    return result
  }, [cases, sortBy])

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
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
                </span>
                <span className="text-[10px] font-condensed font-medium text-[var(--success)] uppercase tracking-wider">
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

