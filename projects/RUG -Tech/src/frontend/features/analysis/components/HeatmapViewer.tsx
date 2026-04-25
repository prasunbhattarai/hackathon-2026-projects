'use client'

import { useState } from 'react'
import { Eye, EyeOff, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Badge } from '@/Components/ui/Badge'
import { ImageLightbox } from '@/Components/shared/ImageLightbox'
import type { ImageQuality } from '@/types/case.types'

export interface HeatmapViewerProps {
  fundusImageUrl: string
  heatmapUrl: string | null
  isProcessing?: boolean
  imageQuality?: ImageQuality
  className?: string
}

const qualityVariant = (q: ImageQuality | undefined) => {
  if (q === 'good') return 'success' as const
  if (q === 'blurry' || q === 'poor_lighting' || q === 'overexposed') return 'medium' as const
  return 'default' as const
}

export const HeatmapViewer = ({
  fundusImageUrl,
  heatmapUrl,
  isProcessing = false,
  imageQuality,
  className,
}: HeatmapViewerProps) => {
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  return (
    <>
      <div
        className={cn(
          'relative bg-black rounded-[4px] overflow-hidden',
          'border border-[var(--border)]',
          className,
        )}
      >
        {/* Image container */}
        <div className="relative aspect-square w-full">
          {/* Fundus image */}
          <img
            src={fundusImageUrl}
            alt="Fundus image"
            className="w-full h-full object-contain"
          />

          {/* Heatmap overlay */}
          {heatmapUrl && !isProcessing && (
            <img
              src={heatmapUrl}
              alt="Heatmap overlay"
              className={cn(
                'absolute inset-0 w-full h-full object-contain',
                'mix-blend-multiply',
                'transition-opacity duration-500',
                showHeatmap ? 'opacity-60' : 'opacity-0',
              )}
            />
          )}

          {/* Processing scan line overlay */}
          {isProcessing && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-[var(--accent)]/5" />
              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent animate-scan-line"
                style={{ boxShadow: '0 0 12px 3px var(--accent)' }}
              />
            </div>
          )}
        </div>

        {/* Controls bar */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {heatmapUrl && !isProcessing && (
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px]',
                'text-[10px] font-condensed font-medium uppercase',
                'backdrop-blur-md transition-all duration-150',
                showHeatmap
                  ? 'bg-[var(--accent)]/80 text-white'
                  : 'bg-black/60 text-white/80 hover:bg-black/80',
              )}
            >
              {showHeatmap ? <EyeOff size={12} /> : <Eye size={12} />}
              {showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
            </button>
          )}
          <button
            onClick={() => setLightboxOpen(true)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px]',
              'text-[10px] font-condensed font-medium uppercase',
              'bg-black/60 text-white/80 hover:bg-black/80',
              'backdrop-blur-md transition-all duration-150',
            )}
          >
            <ZoomIn size={12} />
            Zoom
          </button>
        </div>

        {/* Legend */}
        {heatmapUrl && showHeatmap && !isProcessing && (
          <div className="absolute bottom-14 left-3 flex items-center gap-2 px-2.5 py-1.5 rounded-[4px] bg-black/70 backdrop-blur-sm">
            <span className="text-[9px] text-white/60 font-condensed uppercase">High</span>
            <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-400" />
            <span className="text-[9px] text-white/60 font-condensed uppercase">Low</span>
          </div>
        )}

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-surface)] border-t border-[var(--border)]">
          <span className="text-[11px] font-condensed text-[var(--text-muted)] uppercase tracking-wider">
            Fundus Image
          </span>
          {imageQuality && (
            <Badge variant={qualityVariant(imageQuality)} size="sm">
              {imageQuality === 'good' ? 'Good Quality' : imageQuality.replace('_', ' ')}
            </Badge>
          )}
          {isProcessing && (
            <Badge variant="info" size="sm" dot>
              Processing
            </Badge>
          )}
        </div>
      </div>

      {/* Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={fundusImageUrl}
        overlayUrl={heatmapUrl ?? undefined}
        showOverlay={showHeatmap}
      />
    </>
  )
}
