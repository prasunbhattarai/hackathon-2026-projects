'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { Spinner } from '@/Components/ui/Spinner'

export interface PDFDownloadButtonProps {
  caseId: string
  className?: string
}

const options = [
  { id: 'doctor', label: 'Doctor Report PDF' },
  { id: 'patient', label: 'Patient Report PDF' },
  { id: 'full', label: 'Full Report PDF' },
]

export const PDFDownloadButton = ({
  caseId,
  className,
}: PDFDownloadButtonProps) => {
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

  const handleDownload = async (type: string) => {
    setIsDownloading(true)
    setIsOpen(false)

    // Simulate PDF generation
    await new Promise((r) => setTimeout(r, 1500))

    // Mock: open a fake PDF URL
    window.open(`https://example.com/reports/${caseId}/${type}.pdf`, '_blank')
    setIsDownloading(false)
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
              onClick={() => handleDownload(opt.id)}
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
