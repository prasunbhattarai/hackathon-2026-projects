'use client'

import { cn } from '@/lib/cn'
import { ProgressBar } from '@/Components/ui/ProgressBar'

export interface ConfidenceBarProps {
  value: number
  label?: string
  showValue?: boolean
  animate?: boolean
  className?: string
}

function getVariant(value: number) {
  if (value >= 80) return 'critical' as const
  if (value >= 60) return 'high' as const
  if (value >= 40) return 'medium' as const
  return 'low' as const
}

export const ConfidenceBar = ({
  value,
  label,
  showValue = true,
  animate = true,
  className,
}: ConfidenceBarProps) => {
  const pct = Math.round(value * 100)
  return (
    <ProgressBar
      value={pct}
      variant={getVariant(pct)}
      label={label}
      showValue={showValue}
      animate={animate}
      className={className}
    />
  )
}
