'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { backdropVariants, modalVariants } from '@/animations/modal.variants'

/* ---------- Size Map ---------- */

const sizeMap: Record<string, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
}

/* ---------- Modal ---------- */

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  footer?: React.ReactNode
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
}: ModalProps) => {
  /* Escape key close */
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'relative w-full',
              'bg-[var(--bg-elevated)] border border-[var(--border-strong)]',
              'shadow-2xl',
              'flex flex-col',
              // Mobile: full-width bottom sheet
              'rounded-t-xl sm:rounded-[4px]',
              'max-h-[90vh] sm:max-h-[85vh]',
              'sm:mx-4',
              sizeMap[size],
            )}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            {/* Pull handle — mobile only */}
            <div className="flex justify-center pt-2 pb-0 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-[var(--text-muted)]/30" />
            </div>

            {/* Header */}
            {(title || description) && (
              <ModalHeader>
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2 className="font-display text-lg text-[var(--text-primary)]">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className={cn(
                    'shrink-0 p-1.5 rounded-[4px]',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                    'hover:bg-[var(--bg-subtle)] transition-colors duration-150',
                    'cursor-pointer',
                  )}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </ModalHeader>
            )}

            {/* Body */}
            <ModalBody>{children}</ModalBody>

            {/* Footer */}
            {footer && <ModalFooter>{footer}</ModalFooter>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/* ---------- Sub-components ---------- */

export interface ModalSectionProps {
  className?: string
  children: React.ReactNode
}

export const ModalHeader = ({ className, children }: ModalSectionProps) => (
  <div
    className={cn(
      'px-5 py-4 border-b border-[var(--border)]',
      'flex items-start justify-between gap-3',
      className,
    )}
  >
    {children}
  </div>
)

export const ModalBody = ({ className, children }: ModalSectionProps) => (
  <div className={cn('px-5 py-4 overflow-y-auto flex-1', className)}>
    {children}
  </div>
)

export const ModalFooter = ({ className, children }: ModalSectionProps) => (
  <div
    className={cn(
      'px-5 py-3 border-t border-[var(--border)]',
      'flex items-center justify-end gap-2',
      className,
    )}
  >
    {children}
  </div>
)
