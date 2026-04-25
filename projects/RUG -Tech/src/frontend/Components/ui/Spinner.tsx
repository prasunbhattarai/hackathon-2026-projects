'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 32,
} as const

const colorMap = {
  accent: 'var(--accent)',
  muted: 'var(--text-muted)',
  white: '#FFFFFF',
} as const

export interface SpinnerProps {
  size?: keyof typeof sizeMap
  color?: keyof typeof colorMap
  className?: string
}

export const Spinner = forwardRef<SVGSVGElement, SpinnerProps>(
  ({ size = 'md', color = 'accent', className }, ref) => {
    const px = sizeMap[size]
    const stroke = colorMap[color]

    return (
      <svg
        ref={ref}
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className={cn('animate-orbital-spin', className)}
        role="status"
        aria-label="Loading"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="2"
          strokeOpacity="0.15"
          fill="none"
          style={{ color: stroke }}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="31.416 31.416"
          strokeDashoffset="10"
          fill="none"
        />
      </svg>
    )
  },
)

Spinner.displayName = 'Spinner'
