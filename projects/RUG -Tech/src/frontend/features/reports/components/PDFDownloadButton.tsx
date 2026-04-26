'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { Spinner } from '@/Components/ui/Spinner'
import { useToast } from '@/hooks/useToast'
import { getPDFDownloadUrl } from '@/services/report.service'
import type { ReportType } from '@/types/report.types'

export interface PDFDownloadButtonProps {
  caseId: string
  className?: string
}

const options = [
  { id: 'doctor' as const, label: 'Doctor Report PDF', type: 'doctor' as const },
  { id: 'patient' as const, label: 'Patient Report PDF', type: 'patient' as const },
  { id: 'full' as const, label: 'Full Report PDF', type: 'general' as const },
]

export const PDFDownloadButton = ({
  caseId,
  className,
}: PDFDownloadButtonProps) => {
  const { error } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleDownload = async (type: ReportType) => {
    setIsDownloading(true)
    setIsOpen(false)

    try {
      const res = await getPDFDownloadUrl(caseId, type)
      if (!res.success || !res.data?.url) {
        error('Download failed', res.error?.message ?? 'Unable to get PDF URL.')
        return
      }
      window.open(res.data.url, '_blank')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      <Button
        variant="secondary"
        size="md"
        leftIcon={isDownloading ? <Spinner size="sm" color="accent" /> : <Download size={14} />}
        rightIcon={<ChevronDown size={12} />}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDownloading}
      >
        {isDownloading ? 'Generating...' : 'Download PDF'}
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 mt-1 z-20',
            'bg-[var(--bg-elevated)] border border-[var(--border-strong)]',
            'rounded-[4px] shadow-2xl min-w-[180px]',
            'animate-fade-in',
          )}
        >
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleDownload(opt.type)}
              className={cn(
                'w-full text-left px-3 py-2 text-sm',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                'hover:bg-[var(--bg-subtle)] transition-colors duration-100',
                'cursor-pointer',
                'first:rounded-t-[4px] last:rounded-b-[4px]',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
