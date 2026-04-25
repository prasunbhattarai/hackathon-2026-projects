'use client'

import { Eye, CircleDot, Heart } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { ConfidenceBar } from '@/Components/shared/ConfidenceBar'
import type { DRResult, DiseaseResult } from '@/types/analysis.types'

export interface DiseaseConfidenceBlockProps {
  disease: 'dr' | 'glaucoma' | 'hr'
  result: DRResult | DiseaseResult
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
  const drResult = isDR ? (result as DRResult) : null
  const diseaseResult = !isDR ? (result as DiseaseResult) : null

  const statusLabel = isDR ? drResult!.status : diseaseResult!.risk
  const badgeVariant = isDR
    ? getDRBadgeVariant(drResult!.status)
    : getRiskBadgeVariant(diseaseResult!.risk)

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
          <ConfidenceBar value={result.confidence} showValue={false} />
        </div>
        <span className="font-mono text-xs text-[var(--text-primary)] w-10 text-right">
          {(result.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  )
}
