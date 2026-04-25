'use client'

import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { RAGJustificationCard } from '@/features/analysis/components/RAGJustificationCard'
import type { DoctorReport as DoctorReportType } from '@/types/report.types'

export interface DoctorReportViewProps {
  report: DoctorReportType
  caseId: string
  className?: string
}

function severityVariant(severity: string) {
  switch (severity) {
    case 'PDR': return 'critical' as const
    case 'Severe': return 'high' as const
    case 'Moderate': return 'medium' as const
    case 'Mild': return 'low' as const
    default: return 'none' as const
  }
}

export const DoctorReportView = ({
  report,
  caseId,
  className,
}: DoctorReportViewProps) => {
  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
        'max-w-3xl mx-auto',
        className,
      )}
    >
      {/* Report Header */}
      <div className="px-8 pt-8 pb-6 border-b border-[var(--border)]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-[var(--text-primary)]">
              Clinical Diagnostic Report
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs font-mono text-[var(--text-muted)]">
                {caseId}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {new Date(report.generatedAt).toLocaleDateString('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric',
                })}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-condensed uppercase tracking-wider text-[var(--text-muted)]">
              Fundus AI
            </p>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Retinal Diagnosis Platform
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
          Patient Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Name', value: report.patient.fullName },
            { label: 'Age', value: `${report.patient.age} years` },
            { label: 'Gender', value: report.patient.gender.charAt(0).toUpperCase() + report.patient.gender.slice(1) },
            { label: 'Report Type', value: 'Doctor (Clinical)' },
          ].map((f) => (
            <div key={f.label}>
              <span className="text-[10px] font-condensed uppercase text-[var(--text-muted)]">
                {f.label}
              </span>
              <p className="text-sm text-[var(--text-primary)] mt-0.5">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Primary Diagnosis */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
          Primary Diagnosis
        </h3>
        <div className="flex items-center gap-3 mb-2">
          <p className="text-lg font-semibold text-[var(--text-primary)]">
            {report.diagnosis.primary}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={severityVariant(report.diagnosis.severity)} size="md">
            {report.diagnosis.severity}
          </Badge>
          <span className="font-mono text-xs text-[var(--text-secondary)]">
            Confidence: {report.diagnosis.confidence}
          </span>
        </div>
      </div>

      {/* Heatmap */}
      {report.heatmapUrl && (
        <div className="px-8 py-6 border-b border-[var(--border)]">
          <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
            AI Heatmap Analysis
          </h3>
          <div className="inline-block bg-black rounded-[4px] overflow-hidden border border-[var(--border)]">
            <img
              src={report.heatmapUrl}
              alt="Heatmap overlay"
              className="w-[200px] h-[200px] object-cover"
            />
          </div>
        </div>
      )}

      {/* RAG Justification */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <RAGJustificationCard
          justification={report.ragJustification}
          animate={false}
          compact
        />
      </div>

      {/* Plan of Action */}
      <div className="px-8 py-6 border-b border-[var(--border)]">
        <h3 className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-3">
          Plan of Action
        </h3>
        <p className="text-sm text-[var(--text-primary)] leading-relaxed mb-4">
          {report.planOfAction}
        </p>

        <h4 className="font-condensed font-medium text-[10px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
          Medication Suggestions
        </h4>
        <ol className="flex flex-col gap-1.5">
          {report.medicationSuggestions.map((med, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
              <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5 shrink-0 w-4">
                {i + 1}.
              </span>
              {med}
            </li>
          ))}
        </ol>
      </div>

      {/* Footer */}
      <div className="px-8 py-6">
        <p className="text-xs text-[var(--text-muted)] italic">
          This report was generated by Fundus AI diagnostic system. AI-generated findings
          should be validated by a qualified ophthalmologist before clinical use. This report
          does not constitute a medical prescription.
        </p>
      </div>
    </div>
  )
}
