'use client'

import { Eye, CircleDot, Heart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { ConfidenceBar } from '@/Components/shared/ConfidenceBar'
import type { DRResult, DiseaseResult } from '@/types/analysis.types'

export interface DiseaseConfidenceBlockProps {
  disease: 'dr' | 'glaucoma' | 'hr'
  // Backend contract guarantees these shapes, but the UI also supports
  // partial/mock payloads during development.
  result: (DRResult | DiseaseResult | Record<string, unknown>) | null | undefined
  className?: string
}

const diseaseConfig = {
  dr: {
    name: 'Diabetic Retinopathy',
    icon: Eye,
  },
  glaucoma: {
    name: 'Glaucoma',
    icon: CircleDot,
  },
  hr: {
    name: 'Hypertensive Retinopathy',
    icon: Heart,
  },
}

function getDRBadgeVariant(status: string) {
  switch (status) {
    case 'PDR': return 'critical' as const
    case 'Severe': return 'high' as const
    case 'Moderate': return 'medium' as const
    case 'Mild': return 'low' as const
    default: return 'none' as const
  }
}

function getRiskBadgeVariant(risk: string) {
  switch (risk) {
    case 'High': return 'critical' as const
    case 'Medium': return 'medium' as const
    default: return 'low' as const
  }
}

export const DiseaseConfidenceBlock = ({
  disease,
  result,
  className,
}: DiseaseConfidenceBlockProps) => {
  const config = diseaseConfig[disease]
  const Icon = config.icon
  const isDR = disease === 'dr'
  const safe = (result ?? {}) as Partial<DRResult & DiseaseResult> & Record<string, unknown>
  const drResult = isDR ? (safe as Partial<DRResult>) : null
  const diseaseResult = !isDR ? (safe as Partial<DiseaseResult>) : null

  const statusLabel = isDR ? (drResult?.status ?? 'Unknown') : (diseaseResult?.risk ?? 'Unknown')
  const badgeVariant = isDR
    ? getDRBadgeVariant(String(drResult?.status ?? 'Unknown'))
    : getRiskBadgeVariant(String(diseaseResult?.risk ?? 'Unknown'))
  const confidence = typeof safe.confidence === 'number' ? safe.confidence : 0

  return (
    <div
      className={cn(
        'bg-[var(--bg-elevated)] rounded-[4px] p-4',
        'border border-[var(--border)]',
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">
            {config.name}
          </span>
        </div>
        <Badge variant={badgeVariant} size="sm">
          {statusLabel}
        </Badge>
      </div>

      {/* Confidence bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ConfidenceBar value={confidence} showValue={false} />
        </div>
        <span className="font-mono text-xs text-[var(--text-primary)] w-10 text-right">
          {(confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
