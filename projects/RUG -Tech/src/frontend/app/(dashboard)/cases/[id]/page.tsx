'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Check, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Badge } from '@/Components/ui/Badge'
import { Card, CardContent } from '@/Components/ui/Card'
import { Skeleton } from '@/Components/ui/Skeleton'
import { StatusChip } from '@/Components/shared/StatusChip'
import { SeverityBadge } from '@/Components/shared/SeverityBadge'
import { ROUTES } from '@/constants/routes'
import { CaseStatus } from '@/types/case.types'
import { casesMock } from '@/mock/data/cases.mock'
import { patientsMock } from '@/mock/data/patients.mock'
import { analysisResultsMock } from '@/mock/data/analysis.mock'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

const drVariant = (status: string) => {
  switch (status) {
    case 'PDR': return 'critical' as const
    case 'Severe': return 'high' as const
    case 'Moderate': return 'medium' as const
    case 'Mild': return 'low' as const
    default: return 'none' as const
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  const caseRecord = casesMock.find((c) => c.id === id)
  const patient = caseRecord ? patientsMock.find((p) => p.id === caseRecord.patientId) : null
  const analysis = analysisResultsMock.find((a) => a.caseId === id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!caseRecord || !patient) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <p className="text-sm text-[var(--text-muted)]">Case not found</p>
      </div>
    )
  }

  const isReviewable = caseRecord.status === CaseStatus.AWAITING_REVIEW

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title={`Case ${caseRecord.id}`}
          breadcrumbs={[
            { label: 'Cases', href: ROUTES.CASES },
            { label: caseRecord.id },
          ]}
          actions={
            isReviewable && (
              <div className="flex gap-2">
                <Button variant="primary" size="md" leftIcon={<Check size={14} />}>
                  Approve
                </Button>
                <Button variant="danger" size="md" leftIcon={<X size={14} />}>
                  Reject
                </Button>
              </div>
            )
          }
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        {/* Fundus image */}
        <motion.div variants={staggerItem} className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <img
                src={caseRecord.imageUrl}
                alt="Fundus image"
                className="w-full aspect-square object-cover rounded-[4px]"
              />
            </CardContent>
          </Card>

          {/* Case metadata */}
          <div className="mt-4 flex flex-col gap-2">
            {[
              { label: 'Status', el: <StatusChip status={caseRecord.status} /> },
              { label: 'Priority', el: <SeverityBadge tier={caseRecord.priorityTier} /> },
              { label: 'Quality', el: <span className="text-sm text-[var(--text-secondary)] capitalize">{caseRecord.imageQuality}</span> },
              { label: 'Score', el: <span className="font-mono text-sm text-[var(--text-primary)]">{(caseRecord.priorityScore * 100).toFixed(0)}%</span> },
              { label: 'Submitted', el: <span className="text-xs text-[var(--text-muted)] font-mono">{formatDate(caseRecord.createdAt)}</span> },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 px-3 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]">
                <span className="font-condensed text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">{row.label}</span>
                {row.el}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right — Patient info + Analysis */}
        <motion.div variants={staggerItem} className="lg:col-span-2 flex flex-col gap-4">
          {/* Patient info */}
          <Card>
            <CardContent>
              <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
                Patient Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Name', value: patient.fullName },
                  { label: 'Medical ID', value: patient.medicalId, mono: true },
                  { label: 'Gender', value: patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) },
                  { label: 'Contact', value: patient.contact, mono: true },
                ].map((item) => (
                  <div key={item.label}>
                    <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">{item.label}</span>
                    <p className={cn('text-sm text-[var(--text-primary)] mt-0.5', item.mono && 'font-mono text-xs')}>{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Analysis result */}
          {analysis && (
            <Card>
              <CardContent>
                <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-4">
                  AI Analysis Result
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-[var(--bg-elevated)] p-3 rounded-[4px]">
                    <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">DR Status</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={drVariant(analysis.dr.status)} size="sm">{analysis.dr.status}</Badge>
                      <span className="font-mono text-xs text-[var(--text-secondary)]">
                        {(analysis.dr.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="bg-[var(--bg-elevated)] p-3 rounded-[4px]">
                    <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">Glaucoma Risk</span>
                    <p className="text-sm text-[var(--text-primary)] mt-1">
                      {analysis.glaucoma.risk}{' '}
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        ({(analysis.glaucoma.confidence * 100).toFixed(0)}%)
                      </span>
                    </p>
                  </div>
                  <div className="bg-[var(--bg-elevated)] p-3 rounded-[4px]">
                    <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">Hypertensive Retinopathy</span>
                    <p className="text-sm text-[var(--text-primary)] mt-1">
                      {analysis.hypertensiveRetinopathy.risk}{' '}
                      <span className="font-mono text-xs text-[var(--text-muted)]">
                        ({(analysis.hypertensiveRetinopathy.confidence * 100).toFixed(0)}%)
                      </span>
                    </p>
                  </div>
                </div>

                {/* Decision */}
                <div className="bg-[var(--bg-elevated)] p-3 rounded-[4px] mb-3">
                  <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">Final Decision</span>
                  <p className="text-sm text-[var(--text-primary)] mt-1">{analysis.finalDecision}</p>
                </div>

                {/* Recommendation */}
                <div className="bg-[var(--bg-elevated)] p-3 rounded-[4px] mb-3">
                  <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">Recommendation</span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{analysis.recommendation}</p>
                </div>

                {/* RAG Justification */}
                <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/15 p-3 rounded-[4px]">
                  <span className="text-[10px] text-[var(--accent)] font-condensed uppercase">AI Justification</span>
                  <p className="text-sm text-[var(--text-secondary)] mt-1 italic">
                    {analysis.ragJustification}
                  </p>
                </div>

                {/* Heatmap */}
                {analysis.heatmapUrl && (
                  <div className="mt-4">
                    <span className="text-[10px] text-[var(--text-muted)] font-condensed uppercase">Heatmap Overlay</span>
                    <img
                      src={analysis.heatmapUrl}
                      alt="Heatmap overlay"
                      className="w-full max-w-sm aspect-square object-cover rounded-[4px] mt-2 border border-[var(--border)]"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}
