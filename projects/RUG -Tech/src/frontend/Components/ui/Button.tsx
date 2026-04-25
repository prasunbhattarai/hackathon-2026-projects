'use client'

import { forwardRef, useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { Spinner } from './Spinner'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  as?: React.ElementType
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: [
    'bg-[var(--accent)] text-white',
    'hover:brightness-110',
    'active:scale-[0.98]',
    'hover:shadow-[0_10px_30px_var(--accent-glow)]',
  ].join(' '),
  secondary: [
    'bg-transparent border border-[var(--border-strong)] text-[var(--text-primary)]',
    'hover:bg-[var(--bg-subtle)]',
  ].join(' '),
  ghost: [
    'bg-transparent border-none text-[var(--text-secondary)]',
    'hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]',
  ].join(' '),
  danger: [
    'bg-transparent border border-[var(--sev-critical)]/30 text-[var(--sev-critical)]',
    'hover:bg-[var(--sev-critical)]/10',
  ].join(' '),
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-7 text-xs px-3 gap-1.5',
  md: 'h-9 text-sm px-4 gap-2',
  lg: 'h-11 text-base px-6 gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      as,
      className,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Component = as || 'button'
    const isDisabled = disabled || loading
    const btnRef = useRef<HTMLButtonElement | null>(null)
    const [fixedWidth, setFixedWidth] = useState<number | null>(null)

    useLayoutEffect(() => {
      if (!btnRef.current) return
      if (loading) {
        setFixedWidth(btnRef.current.getBoundingClientRect().width)
      } else {
        setFixedWidth(null)
      }
    }, [loading, children])

    const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 1.2
      const x = e.clientX - rect.left - size / 2
      const y = e.clientY - rect.top - size / 2

      const ripple = document.createElement('span')
      ripple.style.position = 'absolute'
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.borderRadius = '9999px'
      ripple.style.background = 'rgba(255,255,255,0.30)'
      ripple.style.pointerEvents = 'none'
      ripple.style.transform = 'scale(0)'
      ripple.style.opacity = '1'
      ripple.style.transition = 'transform 450ms ease-out, opacity 450ms ease-out'
      el.appendChild(ripple)

      requestAnimationFrame(() => {
        ripple.style.transform = 'scale(1)'
        ripple.style.opacity = '0'
      })

      window.setTimeout(() => {
        ripple.remove()
      }, 480)
    }

    return (
      <Component
        ref={(node: HTMLButtonElement | null) => {
          btnRef.current = node
          if (typeof ref === 'function') ref(node)
          else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
        }}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'font-sans font-medium',
          'rounded-[10px]',
          'transition-all duration-180 ease-out',
          'select-none cursor-pointer',
          'relative overflow-hidden',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // States
          loading && 'pointer-events-none opacity-70',
          isDisabled && !loading && 'opacity-40 cursor-not-allowed',
          variant === 'danger' &&
            'hover:shadow-[0_0_8px_rgba(244,91,91,0.30)]',
          className,
        )}
        disabled={isDisabled}
        style={fixedWidth ? { width: fixedWidth } : undefined}
        onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
          props.onMouseDown?.(e)
          if (variant === 'primary') createRipple(e)
        }}
        {...props}
      >
        <span className={cn('inline-flex items-center justify-center gap-inherit', loading && 'invisible')}>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </span>

        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner
              size={size === 'lg' ? 'md' : 'sm'}
              color={variant === 'primary' ? 'white' : 'accent'}
            />
          </span>
        )}
      </Component>
    )
  },
)

Button.displayName = 'Button'
