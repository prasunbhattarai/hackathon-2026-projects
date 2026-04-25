'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { SeverityLevel } from '@/types/analysis.types'
import type { PriorityTier } from '@/types/case.types'

export interface SeverityScoreGaugeProps {
  severityLevel: SeverityLevel
  priorityScore: number
  className?: string
}

const zoneColors = [
  { color: 'var(--sev-low)', label: 'Low' },
  { color: 'var(--sev-medium)', label: 'Medium' },
  { color: 'var(--sev-high)', label: 'High' },
  { color: 'var(--sev-critical)', label: 'Critical' },
]

function tierFromLevel(level: SeverityLevel): PriorityTier {
  switch (level) {
    case 1: return 'low'
    case 2: return 'medium'
    case 3: return 'high'
    case 4: return 'critical'
  }
}

function tierColor(tier: PriorityTier): string {
  switch (tier) {
    case 'low': return 'var(--sev-low)'
    case 'medium': return 'var(--sev-medium)'
    case 'high': return 'var(--sev-high)'
    case 'critical': return 'var(--sev-critical)'
  }
}

export const SeverityScoreGauge = ({
  severityLevel,
  priorityScore,
  className,
}: SeverityScoreGaugeProps) => {
  const tier = tierFromLevel(severityLevel)
  const color = tierColor(tier)

  // Needle angle: map severity 1-4 to ~-80° to +80°
  const targetAngle = useMemo(() => ((severityLevel - 1) / 3) * 160 - 80, [severityLevel])

  const cx = 100
  const cy = 100
  const r = 80
  const startAngle = -180
  const endAngle = 0
  const gapAngle = 2

  // Create 4 arc segments
  const segmentAngle = (endAngle - startAngle - gapAngle * 3) / 4

  const arcs = zoneColors.map((zone, i) => {
    const start = startAngle + i * (segmentAngle + gapAngle)
    const end = start + segmentAngle
    const startRad = (start * Math.PI) / 180
    const endRad = (end * Math.PI) / 180

    const x1 = cx + r * Math.cos(startRad)
    const y1 = cy + r * Math.sin(startRad)
    const x2 = cx + r * Math.cos(endRad)
    const y2 = cy + r * Math.sin(endRad)

    return (
      <path
        key={i}
        d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
        fill="none"
        stroke={zone.color}
        strokeWidth={8}
        strokeLinecap="round"
        opacity={severityLevel - 1 === i ? 1 : 0.3}
      />
    )
  })

  // Needle
  const needleAngle = ((targetAngle + 80) / 160) * 180 - 180
  const needleRad = (needleAngle * Math.PI) / 180
  const needleLen = 55
  const nx = cx + needleLen * Math.cos(needleRad)
  const ny = cy + needleLen * Math.sin(needleRad)

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        {/* Background arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--bg-subtle)"
          strokeWidth={10}
        />

        {/* Zone arcs */}
        {arcs}

        {/* Needle */}
        <motion.line
          x1={cx}
          y1={cy}
          x2={nx}
          y2={ny}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ x2: cx - needleLen, y2: cy }}
          animate={{ x2: nx, y2: ny }}
          transition={{ type: 'spring', stiffness: 100, damping: 12, mass: 0.7 }}
        />

        {/* Center dot */}
        <circle cx={cx} cy={cy} r={4} fill={color} />
      </svg>

      {/* Center number */}
      <div className="flex flex-col items-center -mt-4">
        <span
          className="font-mono text-3xl font-bold"
          style={{ color }}
        >
          {severityLevel}
        </span>
        <span
          className="font-condensed text-[11px] uppercase tracking-wider font-medium mt-0.5"
          style={{ color }}
        >
          {tier} severity
        </span>
      </div>
    </div>
  )
}
