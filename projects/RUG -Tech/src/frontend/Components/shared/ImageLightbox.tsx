'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface ImageLightboxProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  alt?: string
  overlayUrl?: string
  showOverlay?: boolean
}

export const ImageLightbox = ({
  isOpen,
  onClose,
  imageUrl,
  alt = 'Fundus image',
  overlayUrl,
  showOverlay = false,
}: ImageLightboxProps) => {
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className={cn(
              'absolute top-6 right-6 z-10 p-2 rounded-[4px]',
              'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white',
              'transition-colors duration-150',
            )}
            aria-label="Close lightbox"
          >
            <X size={20} />
          </button>

          {/* Image */}
          <motion.div
            className="relative w-[90vw] h-[90vh] flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
            {overlayUrl && showOverlay && (
              <img
                src={overlayUrl}
                alt="Heatmap overlay"
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-70"
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
