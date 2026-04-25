'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Skeleton } from '@/Components/ui/Skeleton'
import { Badge } from '@/Components/ui/Badge'
import { useCaseDetail } from '@/features/cases/hooks/useCaseDetail'
import { CaseDetailHeader } from '@/features/cases/components/CaseDetailHeader'
import { HeatmapViewer } from '@/features/analysis/components/HeatmapViewer'
import { DiagnosisResultPanel } from '@/features/analysis/components/DiagnosisResultPanel'
import { CaseStatus } from '@/types/case.types'

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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
    caseData.status === CaseStatus.PROCESSING ||
    caseData.status === CaseStatus.PENDING

  return (
    <div>
      {/* Processing banner */}
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
            Analysis in progress — results will appear when ready
          </span>
          <Badge variant="info" size="sm" dot>
            Processing
          </Badge>
        </motion.div>
      )}

      {/* Header */}
      <CaseDetailHeader caseData={caseData} />

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-6">
        {/* Left — Image viewer */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <HeatmapViewer
            fundusImageUrl={caseData.imageUrl}
            heatmapUrl={analysis?.heatmapUrl ?? null}
            isProcessing={isProcessing}
            imageQuality={caseData.imageQuality}
          />
        </motion.div>

        {/* Right — Analysis results */}
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
                  <Loader2 size={24} className="text-[var(--accent)] animate-spin mb-3" />
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
