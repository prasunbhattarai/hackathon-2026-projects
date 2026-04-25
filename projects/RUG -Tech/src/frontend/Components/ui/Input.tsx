'use client'

import { forwardRef, useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      className,
      id: externalId,
      ...props
    },
    ref,
  ) => {
    const autoId = useId()
    const id = externalId || autoId
    const hasError = Boolean(error)
    const prevError = useRef<string | undefined>(undefined)
    const [shake, setShake] = useState(false)
    const [successFlash, setSuccessFlash] = useState(false)

    useEffect(() => {
      // error appeared or changed -> shake
      if (error && error !== prevError.current) {
        setShake(true)
        const t = window.setTimeout(() => setShake(false), 380)
        prevError.current = error
        return () => window.clearTimeout(t)
      }

      // error cleared -> brief success flash (clinical: accent ring, not green)
      if (!error && prevError.current) {
        setSuccessFlash(true)
        const t = window.setTimeout(() => setSuccessFlash(false), 500)
        prevError.current = undefined
        return () => window.clearTimeout(t)
      }
    }, [error])

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'font-condensed font-medium text-[11px]',
              'uppercase tracking-[0.08em]',
              'text-[var(--text-muted)]',
              'transition-colors duration-150',
              !hasError && 'peer-focus-within:text-[var(--accent)]',
            )}
          >
            {label}
          </label>
        )}

        <div className={cn('relative peer', shake && 'animate-shake')}>
          {leftIcon && (
            <span
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2',
                'text-[var(--text-muted)] pointer-events-none',
                '[&>svg]:w-4 [&>svg]:h-4',
              )}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            className={cn(
              // Base
              'w-full h-9 px-3 text-sm',
              'font-sans text-[var(--text-primary)]',
              'bg-[var(--bg-elevated)]',
              'border rounded-[4px]',
              'transition-colors duration-150',
              'placeholder:text-[var(--text-muted)]',
              'outline-none',
              // Default border
              !hasError && 'border-[var(--border)]',
              // Focus
              !hasError &&
                'focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30',
              // Error
              hasError &&
                'border-[var(--sev-critical)]/50 ring-1 ring-[var(--sev-critical)]/20',
              successFlash && 'animate-border-flash-success',
              // Left icon padding
              leftIcon && 'pl-9',
              // Right element padding
              rightElement && 'pr-9',
              className,
            )}
            aria-invalid={hasError || undefined}
            aria-describedby={
              hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            {...props}
          />

          {rightElement && (
            <span
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'text-[var(--text-muted)]',
                '[&>svg]:w-4 [&>svg]:h-4',
              )}
            >
              {rightElement}
            </span>
          )}
        </div>

        {hasError && (
          <p
            id={`${id}-error`}
            className="text-xs text-[var(--sev-critical)] font-sans"
            role="alert"
          >
            {error}
          </p>
        )}

        {hint && !hasError && (
          <p
            id={`${id}-hint`}
            className="text-xs text-[var(--text-muted)] font-sans"
          >
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
