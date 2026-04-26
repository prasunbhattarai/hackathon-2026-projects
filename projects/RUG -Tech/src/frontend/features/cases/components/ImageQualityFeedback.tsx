'use client'

import { CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import type { ImageQuality } from '@/types/case.types'

export interface ImageQualityFeedbackProps {
  quality: ImageQuality | null
  isChecking: boolean
  onRetake: () => void
  onProceedAnyway: () => void
  onProceed: () => void
  className?: string
}

const qualityConfig: Record<
  Exclude<ImageQuality, 'good'>,
  {
    title: string
    icon: typeof AlertTriangle
    color: string
    tips: string[]
  }
> = {
  blurry: {
    title: 'Image too blurry',
    icon: AlertTriangle,
    color: 'var(--sev-medium)',
    tips: [
      'Hold the camera steady with both hands',
      'Ensure the patient\'s eye is in focus before capturing',
      'Use a tripod or brace your arms on a stable surface',
      'Clean the camera lens before capturing',
    ],
  },
  poor_lighting: {
    title: 'Poor lighting detected',
    icon: AlertTriangle,
    color: 'var(--sev-high)',
    tips: [
      'Ensure the fundus camera flash is functioning properly',
      'Adjust the illumination intensity on the device',
      'Check that the patient\'s pupil is adequately dilated',
      'Reduce ambient room lighting for better contrast',
    ],
  },
  overexposed: {
    title: 'Image overexposed',
    icon: AlertTriangle,
    color: 'var(--sev-high)',
    tips: [
      'Reduce the flash intensity or exposure setting',
      'Increase the distance between the lens and the eye',
      'Check for reflections from the corneal surface',
      'Adjust the camera angle slightly to avoid direct reflection',
    ],
  },
  non_fundus: {
    title: 'Non-fundus image detected',
    icon: AlertTriangle,
    color: 'var(--sev-high)',
    tips: [
      'Ensure the retina (fundus) is centered and clearly visible',
      'Remove obstructions like eyelids/eyelashes from the field of view',
      'Reposition the camera to capture the posterior pole',
      'Confirm the image is taken using the fundus camera mode',
    ],
  },
}

export const ImageQualityFeedback = ({
  quality,
  isChecking,
  onRetake,
  onProceedAnyway,
  onProceed,
  className,
}: ImageQualityFeedbackProps) => {
  // Checking state
  if (isChecking || quality === null) {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 py-12', className)}>
        <Loader2 size={36} className="text-[var(--accent)] animate-spin" />
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Analyzing image quality...
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            This usually takes a few seconds
          </p>
        </div>
      </div>
    )
  }

  // Good quality
  if (quality === 'good') {
    return (
      <div className={cn('flex flex-col items-center justify-center gap-4 py-8', className)}>
        <div className="w-16 h-16 rounded-full bg-[var(--success)]/10 flex items-center justify-center">
          <CheckCircle size={32} className="text-[var(--success)]" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--success)]">
            Image quality: Excellent
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Image meets all quality requirements for AI analysis
          </p>
        </div>
        <Button variant="primary" size="md" onClick={onProceed}>
          Proceed to Analysis
        </Button>
      </div>
    )
  }

  // Failure states
  const config = qualityConfig[quality]
  const Icon = config.icon

  return (
    <div className={cn('flex flex-col gap-5 py-4', className)}>
      {/* Reason card */}
      <div
        className="flex items-start gap-3 p-4 rounded-[4px]"
        style={{
          backgroundColor: `color-mix(in srgb, ${config.color} 8%, transparent)`,
          border: `1px solid color-mix(in srgb, ${config.color} 25%, transparent)`,
        }}
      >
        <Icon size={20} style={{ color: config.color }} className="shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium" style={{ color: config.color }}>
            {config.title}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            The image quality may affect the accuracy of AI analysis results.
          </p>
        </div>
      </div>

      {/* Improvement tips */}
      <div className="px-1">
        <p className="font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)] mb-2">
          Improvement Tips
        </p>
        <ul className="flex flex-col gap-1.5">
          {config.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)] mt-1.5 shrink-0" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="primary"
          size="md"
          leftIcon={<RefreshCw size={14} />}
          onClick={onRetake}
        >
          Retake Image
        </Button>
        <Button variant="ghost" size="md" onClick={onProceedAnyway}>
          Proceed Anyway
        </Button>
      </div>

      <p className="text-[10px] text-[var(--sev-medium)] font-condensed">
        ⚠ Proceeding with a low-quality image may reduce diagnostic accuracy
      </p>
    </div>
  )
}
