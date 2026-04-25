'use client'

import { Eye, CircleDot, Heart, Cpu, AlertTriangle, Activity, Stethoscope } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { Card, CardContent } from '@/Components/ui/Card'
import { SeverityBadge } from '@/Components/shared/SeverityBadge'
import type { DiseaseInfo } from '@/features/diseases/data/diseases.static'

export interface DiseaseDetailBodyProps {
  disease: DiseaseInfo
  className?: string
}

const iconMap: Record<string, typeof Eye> = {
  Eye,
  CircleDot,
  Heart,
}

export const DiseaseDetailBody = ({ disease, className }: DiseaseDetailBodyProps) => {
  const Icon = iconMap[disease.iconName] ?? Eye

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Overview */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-[var(--text-primary)] mb-3">
            Overview
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-[1.8]">
            {disease.overview}
          </p>
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
            <Activity size={14} className="text-[var(--text-muted)]" />
            <span className="text-xs text-[var(--text-muted)]">
              Prevalence: {disease.prevalence}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stages / Grades */}
      {disease.stages.length > 0 && (
        <Card>
          <CardContent>
            <h2 className="font-display text-lg text-[var(--text-primary)] mb-4">
              Stages &amp; Classification
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left py-2 pr-4 font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Stage
                    </th>
                    <th className="text-left py-2 pr-4 font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Severity
                    </th>
                    <th className="text-left py-2 font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {disease.stages.map((stage, i) => (
                    <tr
                      key={i}
                      className={cn(
                        'border-b border-[var(--border)] last:border-b-0',
                        stage.tier === 'critical' && 'bg-[var(--sev-critical)]/[0.03]',
                        stage.tier === 'high' && 'bg-[var(--sev-high)]/[0.03]',
                      )}
                    >
                      <td className="py-3 pr-4 text-sm font-medium text-[var(--text-primary)] whitespace-nowrap">
                        {stage.name}
                      </td>
                      <td className="py-3 pr-4">
                        <SeverityBadge tier={stage.tier} />
                      </td>
                      <td className="py-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                        {stage.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Symptoms */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-[var(--sev-medium)]" />
            <h2 className="font-display text-lg text-[var(--text-primary)]">
              Symptoms
            </h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {disease.symptoms.map((symptom, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--sev-medium)] mt-1.5 shrink-0" />
                <span className="text-sm text-[var(--text-secondary)]">{symptom}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      <Card>
        <CardContent>
          <h2 className="font-display text-lg text-[var(--text-primary)] mb-4">
            Risk Factors
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {disease.riskFactors.map((factor, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--sev-high)] mt-1.5 shrink-0" />
                <span className="text-sm text-[var(--text-secondary)]">{factor}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Treatments */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Stethoscope size={16} className="text-teal-400" />
            <h2 className="font-display text-lg text-[var(--text-primary)]">
              Treatment Options
            </h2>
          </div>
          <ol className="flex flex-col gap-2.5">
            {disease.treatments.map((treatment, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="font-mono text-xs text-[var(--text-muted)] mt-0.5 shrink-0 w-5">
                  {i + 1}.
                </span>
                <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {treatment}
                </span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* AI Capability Callout */}
      <div
        className="p-5 rounded-[4px]"
        style={{
          backgroundColor: `color-mix(in srgb, ${disease.accentColor} 6%, transparent)`,
          border: `1px solid color-mix(in srgb, ${disease.accentColor} 18%, transparent)`,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={16} className="text-[var(--accent)]" />
          <h3 className="text-sm font-medium text-[var(--accent)]">
            How Fundus AI Detects This
          </h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-[1.7]">
          {disease.aiCapability}
        </p>
      </div>
    </div>
  )
}
