'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'

export interface ToastOptions {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: { label: string; onClick: () => void }
}

export interface Toast extends ToastOptions {
  id: string
  createdAt: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (options: ToastOptions) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let toastCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback(
    (options: ToastOptions) => {
      toastCounter++
      const id = `toast-${Date.now()}-${toastCounter}`
      const duration = options.duration ?? 4000

      const toast: Toast = {
        ...options,
        id,
        createdAt: Date.now(),
      }

      setToasts((prev) => {
        // Max 5 visible
        const updated = [...prev, toast]
        if (updated.length > 5) return updated.slice(-5)
        return updated
      })

      const timer = setTimeout(() => removeToast(id), duration)
      timersRef.current.set(id, timer)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider')
  return ctx
}
