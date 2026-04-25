'use client'

import { FileText, Download, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { Badge } from '@/Components/ui/Badge'
import { Card, CardContent } from '@/Components/ui/Card'
import { DiseaseConfidenceBlock } from './DiseaseConfidenceBlock'
import { SeverityScoreGauge } from './SeverityScoreGauge'
import type { AnalysisResult } from '@/types/analysis.types'

export interface DiagnosisResultPanelProps {
  analysis: AnalysisResult
  className?: string
}

function decisionBadgeVariant(severity: number) {
  if (severity >= 4) return 'critical' as const
  if (severity >= 3) return 'high' as const
  if (severity >= 2) return 'medium' as const
  return 'low' as const
}

export const DiagnosisResultPanel = ({
  analysis,
  className,
}: DiagnosisResultPanelProps) => {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Final Decision */}
      <Card>
        <CardContent>
          <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
            Final Decision
          </p>
          <div className="flex items-start gap-3">
            <h2 className="font-display text-xl text-[var(--text-primary)] flex-1">
              {analysis.finalDecision}
            </h2>
            <Badge variant={decisionBadgeVariant(analysis.severityLevel)} size="md">
              Level {analysis.severityLevel}
            </Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 font-condensed">
            Confidence: {analysis.decisionConfidence}
          </p>
        </CardContent>
      </Card>

      {/* Severity Gauge */}
      <Card>
        <CardContent>
          <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
            Severity Score
          </p>
          <SeverityScoreGauge
            severityLevel={analysis.severityLevel}
            priorityScore={0.5}
          />
        </CardContent>
      </Card>

      {/* Disease Results */}
      <div>
        <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2 px-1">
          Disease Analysis
        </p>
        <div className="flex flex-col gap-2">
          <DiseaseConfidenceBlock disease="dr" result={analysis.dr} />
          <DiseaseConfidenceBlock disease="glaucoma" result={analysis.glaucoma} />
          <DiseaseConfidenceBlock disease="hr" result={analysis.hypertensiveRetinopathy} />
        </div>
      </div>

      {/* RAG Justification */}
      <Card>
        <CardContent className="bg-[var(--accent)]/[0.03]">
          <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--accent)] mb-2">
            AI Justification
          </p>
          <p className="text-sm text-[var(--text-secondary)] italic leading-relaxed">
            &ldquo;{analysis.ragJustification}&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card>
        <CardContent>
          <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
            Recommendation
          </p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {analysis.recommendation}
          </p>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<FileText size={14} />}
        >
          View Doctor Report
        </Button>
        <Button
          variant="secondary"
          size="md"
          leftIcon={<User size={14} />}
        >
          View Patient Report
        </Button>
        <Button
          variant="ghost"
          size="md"
          leftIcon={<Download size={14} />}
        >
          Download PDF
        </Button>
      </div>
    </div>
  )
}
