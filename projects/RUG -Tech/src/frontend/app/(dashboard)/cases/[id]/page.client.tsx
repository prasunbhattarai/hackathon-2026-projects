'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/Components/ui/Skeleton'
import { Badge } from '@/Components/ui/Badge'
import { useCaseDetail } from '@/features/cases/hooks/useCaseDetail'
import { CaseDetailHeader } from '@/features/cases/components/CaseDetailHeader'
import { DiagnosisResultPanel } from '@/features/analysis/components/DiagnosisResultPanel'
import { ProcessingStatusTracker } from '@/features/cases/components/ProcessingStatusTracker'
import { LiveIndicator } from '@/Components/shared/LiveIndicator'
import { CaseStatus } from '@/types/case.types'

const HeatmapViewer = dynamic(
  () =>
    import('@/features/analysis/components/HeatmapViewer').then((m) => m.HeatmapViewer),
  { ssr: false },
)

export default function CaseDetailPageClient({ id }: { id: string }) {
  const { caseData, analysis, isLoading } = useCaseDetail(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6 mt-4">
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <p className="text-sm text-[var(--text-muted)]">Case not found</p>
      </div>
    )
  }

  const isProcessing =
    caseData.status === CaseStatus.PROCESSING || caseData.status === CaseStatus.PENDING

  return (
    <div>
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'flex items-center justify-center gap-3 px-4 py-3 mb-6',
            'bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-[4px]',
          )}
        >
          <div className="relative">
            <div className="w-5 h-5 border-2 border-[var(--accent)]/30 rounded-full" />
            <div className="absolute inset-0 w-5 h-5 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-orbital-spin" />
          </div>
          <span className="text-sm text-[var(--accent)] font-medium">
            Analysis in progress — results will appear automatically
          </span>
          <LiveIndicator isLive={true} />
          <Badge variant="info" size="sm" dot>
            Processing
          </Badge>
        </motion.div>
      )}

      <CaseDetailHeader caseData={caseData} />

      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex flex-col gap-4"
        >
          <HeatmapViewer
            fundusImageUrl={caseData.imageUrl}
            heatmapUrl={analysis?.heatmapUrl ?? null}
            isProcessing={isProcessing}
            imageQuality={caseData.imageQuality}
          />

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] p-4"
            >
              <ProcessingStatusTracker caseId={id} currentStatus={caseData.status} />
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
        >
          {analysis ? (
            <DiagnosisResultPanel analysis={analysis} caseId={id} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]">
              {isProcessing ? (
                <>
                  <Loader2
                    size={24}
                    className="text-[var(--accent)] animate-spin mb-3"
                  />
                  <p className="text-sm text-[var(--text-muted)]">
                    Waiting for analysis results...
                  </p>
                </>
              ) : (
                <p className="text-sm text-[var(--text-muted)]">
                  No analysis data available for this case.
                </p>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

