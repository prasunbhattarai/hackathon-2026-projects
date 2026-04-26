'use client'

import { cn } from '@/lib/cn'

export interface PDFInlineViewerProps {
  src: string
  title?: string
  className?: string
}

export function PDFInlineViewer({ src, title = 'Report PDF', className }: PDFInlineViewerProps) {
  return (
    <div
      className={cn(
        'bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px]',
        'max-w-5xl mx-auto overflow-hidden',
        className,
      )}
    >
      <div className="px-5 py-3 border-b border-[var(--border)]">
        <p className="text-sm font-medium text-[var(--text-primary)]">{title}</p>
        <p className="text-[11px] text-[var(--text-muted)]">
          If the PDF does not render, use “Download PDF”.
        </p>
      </div>

      <div className="w-full bg-black/10">
        <iframe
          title={title}
          src={src}
          className="w-full h-[75vh]"
        />
      </div>
    </div>
  )
}

