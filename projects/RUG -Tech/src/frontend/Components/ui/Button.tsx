'use client'

import { forwardRef } from 'react'
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

    return (
      <Component
        ref={ref}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'font-sans font-medium',
          'rounded-[4px]',
          'transition-all duration-150 ease-out',
          'select-none cursor-pointer',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // States
          loading && 'pointer-events-none opacity-70',
          isDisabled && !loading && 'opacity-40 cursor-not-allowed',
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Spinner
            size={size === 'lg' ? 'md' : 'sm'}
            color={variant === 'primary' ? 'white' : 'accent'}
          />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {rightIcon && !loading && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </Component>
    )
  },
)

Button.displayName = 'Button'
