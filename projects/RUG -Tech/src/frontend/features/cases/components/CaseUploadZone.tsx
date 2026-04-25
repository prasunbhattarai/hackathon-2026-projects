'use client'

import { useCallback, useRef, useState } from 'react'
import { ScanEye, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface CaseUploadZoneProps {
  imageFile: File | null
  imagePreviewUrl: string | null
  patientName?: string
  error?: string | null
  onFileSelect: (file: File) => void
  onRemove: () => void
  className?: string
}

export const CaseUploadZone = ({
  imageFile,
  imagePreviewUrl,
  patientName,
  error,
  onFileSelect,
  onRemove,
  className,
}: CaseUploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) onFileSelect(file)
    },
    [onFileSelect],
  )

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onFileSelect(file)
      // Reset input so same file can be selected again
      e.target.value = ''
    },
    [onFileSelect],
  )

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024).toFixed(0)} KB`
  }

  // File selected state — show preview
  if (imageFile && imagePreviewUrl) {
    return (
      <div
        className={cn(
          'relative w-full aspect-[4/3] rounded-[4px] overflow-hidden',
          'border-2 border-[var(--border-strong)]',
          'bg-black group cursor-pointer',
          className,
        )}
        onClick={handleClick}
      >
        <img
          src={imagePreviewUrl}
          alt="Fundus image preview"
          className="w-full h-full object-cover"
        />

        {/* Overlay info */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
          <div>
            {patientName && (
              <p className="text-sm font-medium text-white/90">{patientName}</p>
            )}
            <p className="text-xs font-mono text-white/60">
              {imageFile.name} · {formatFileSize(imageFile.size)}
            </p>
          </div>
        </div>

        {/* Remove button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            'absolute top-3 right-3 p-1.5 rounded-[4px]',
            'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white',
            'transition-all duration-150',
            'opacity-0 group-hover:opacity-100',
          )}
          aria-label="Remove image"
        >
          <X size={16} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    )
  }

  // Empty / drag state
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={cn(
          'relative w-full aspect-[4/3] rounded-[4px]',
          'border-2 border-dashed',
          'flex flex-col items-center justify-center gap-3',
          'cursor-pointer select-none',
          'transition-all duration-200',
          isDragActive
            ? 'border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]'
            : 'border-[var(--border-strong)] hover:border-[var(--text-muted)]',
          error && 'border-[var(--sev-critical)]/50',
        )}
      >
        <ScanEye
          size={48}
          className={cn(
            'transition-colors duration-200',
            isDragActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]',
          )}
          strokeWidth={1.2}
        />
        <div className="text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Drop fundus image here
          </p>
          <p className="text-sm mt-0.5">
            <span className="text-[var(--accent)] underline underline-offset-2 decoration-[var(--accent)]/40">
              or click to browse
            </span>
          </p>
        </div>
        <p className="text-[11px] font-condensed text-[var(--text-muted)] uppercase tracking-wider">
          JPEG, PNG, max 10MB
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={handleChange}
        />
      </div>

      {error && (
        <p className="text-xs text-[var(--sev-critical)] font-sans" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
