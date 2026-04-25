'use client'

import { useRouter } from 'next/navigation'
import { Eye, CircleDot, Heart, Cpu } from 'lucide-react'
import { cn } from '@/lib/cn'
import { ROUTES } from '@/constants/routes'
import type { DiseaseInfo } from '@/features/diseases/data/diseases.static'

export interface DiseaseCardProps {
  disease: DiseaseInfo
  className?: string
}

const iconMap: Record<string, typeof Eye> = {
  Eye,
  CircleDot,
  Heart,
}

export const DiseaseCard = ({ disease, className }: DiseaseCardProps) => {
  const router = useRouter()
  const Icon = iconMap[disease.iconName] ?? Eye
  const stageCount = disease.stages.length

  return (
    <div
      onClick={() => router.push(ROUTES.DISEASE_DETAIL(disease.slug))}
      className={cn(
        'group relative flex flex-col h-[280px]',
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
        'overflow-hidden cursor-pointer select-none',
        'transition-all duration-200',
        'hover:border-[var(--border-strong)]',
        className,
      )}
      style={{
        // @ts-expect-error -- CSS custom property for accent color
        '--card-accent': disease.accentColor,
      }}
    >
      {/* Subtle gradient overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300"
        style={{
          background: `radial-gradient(ellipse at top left, ${disease.accentColor}, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1 p-5">
        {/* Icon */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
          style={{
            backgroundColor: `color-mix(in srgb, ${disease.accentColor} 12%, transparent)`,
          }}
        >
          <Icon
            size={22}
            style={{ color: disease.accentColor }}
          />
        </div>

        {/* Name */}
        <h3 className="font-display text-lg text-[var(--text-primary)] mb-2">
          {disease.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3 flex-1">
          {disease.shortDescription}
        </p>

        {/* Detection badge */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border)]">
          <Cpu size={12} className="text-[var(--accent)]" />
          <span className="text-[10px] font-condensed text-[var(--accent)] uppercase tracking-wider">
            AI Detects: {disease.name.split(' ')[0]} ({stageCount} grades)
          </span>
        </div>
      </div>

      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 0 1px ${disease.accentColor}30, 0 4px 20px ${disease.accentColor}10`,
        }}
      />
    </div>
  )
}
