'use client'

import { AnimatePresence } from 'framer-motion'
import { useToastContext } from '@/context/ToastContext'
import { Toast } from './Toast'

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastContext()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={removeToast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
