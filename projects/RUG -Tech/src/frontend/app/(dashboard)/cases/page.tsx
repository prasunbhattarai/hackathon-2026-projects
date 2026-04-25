'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Filter } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Badge } from '@/Components/ui/Badge'
import { SkeletonTableRow } from '@/Components/ui/Skeleton'
import { Tabs } from '@/Components/ui/Tabs'
import { StatusChip } from '@/Components/shared/StatusChip'
import { SeverityBadge } from '@/Components/shared/SeverityBadge'
import { ROUTES } from '@/constants/routes'
import { CaseStatus, type CaseSummary } from '@/types/case.types'
import { caseSummariesMock } from '@/mock/data/cases.mock'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const drVariant = (status: string) => {
  switch (status) {
    case 'PDR': return 'critical' as const
    case 'Severe': return 'high' as const
    case 'Moderate': return 'medium' as const
    case 'Mild': return 'low' as const
    default: return 'none' as const
  }
}

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: CaseStatus.AWAITING_REVIEW, label: 'Awaiting Review' },
  { id: CaseStatus.PENDING, label: 'Pending' },
  { id: CaseStatus.PROCESSING, label: 'Processing' },
  { id: CaseStatus.APPROVED, label: 'Approved' },
  { id: CaseStatus.REJECTED, label: 'Rejected' },
  { id: CaseStatus.QUALITY_FAILED, label: 'Quality Failed' },
]

export default function CasesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [cases, setCases] = useState<CaseSummary[]>([])
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const timer = setTimeout(() => {
      setCases(caseSummariesMock)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filtered =
    statusFilter === 'all'
      ? cases
      : cases.filter((c) => c.status === statusFilter)

  const tabsWithCounts = statusTabs.map((t) => ({
    ...t,
    count: t.id === 'all' ? cases.length : cases.filter((c) => c.status === t.id).length,
  }))

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Cases"
          subtitle={`${cases.length} total cases`}
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={14} />}
              onClick={() => router.push(ROUTES.CASE_NEW)}
            >
              Upload Case
            </Button>
          }
        />
      </motion.div>

      {/* Status filter tabs */}
      <motion.div variants={staggerItem} className="mt-4 overflow-x-auto">
        <Tabs
          tabs={tabsWithCounts}
          activeTab={statusFilter}
          onChange={setStatusFilter}
          variant="pill"
        />
      </motion.div>

      {/* Table */}
      <motion.div
        variants={staggerItem}
        className="mt-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-elevated)]">
                {['Patient', 'Status', 'DR Status', 'Priority', 'Score', 'Submitted', ''].map((h) => (
                  <th
                    key={h || 'action'}
                    className="px-4 py-2.5 text-left font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 10 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={7} />
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-[var(--text-muted)]">
                    No cases found
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors duration-100"
                    onClick={() => router.push(ROUTES.CASE_DETAIL(c.id))}
                  >
                    <td className="px-4 py-2.5 text-sm text-[var(--text-primary)]">
                      {c.patientName}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusChip status={c.status} />
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={drVariant(c.drStatus)} size="sm">
                        {c.drStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <SeverityBadge tier={c.priorityTier} />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-secondary)]">
                      {(c.priorityScore * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2.5 text-xs text-[var(--text-muted)] font-mono">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation()
                          router.push(ROUTES.CASE_DETAIL(c.id))
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}
