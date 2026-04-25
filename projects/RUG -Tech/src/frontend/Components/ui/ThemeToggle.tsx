'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/cn'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className, size = 'sm' }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme()
  
  if (!mounted) {
    return (
      <div className={cn(
        'shrink-0 rounded-[8px] border border-[var(--border)] bg-[var(--bg-elevated)]',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        className
      )} />
    )
  }

  const isDark = theme === 'dark'
  const iconSize = size === 'sm' ? 16 : 18

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'relative flex items-center justify-center shrink-0',
        'rounded-[8px] border border-[var(--border)] bg-[var(--bg-elevated)]',
        'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        'hover:bg-[var(--bg-subtle)] hover:border-[var(--border-strong)]',
        'transition-all duration-200 cursor-pointer overflow-hidden',
        size === 'sm' ? 'h-8 w-8' : 'h-9 w-9',
        className,
      )}
    >
      {/* Sun — shown in dark mode (clicking switches to light) */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 1 : 0,
          transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(90deg)',
        }}
      >
        <Sun size={iconSize} />
      </span>

      {/* Moon — shown in light mode (clicking switches to dark) */}
      <span
        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
        style={{
          opacity: isDark ? 0 : 1,
          transform: isDark ? 'scale(0.5) rotate(-90deg)' : 'scale(1) rotate(0deg)',
        }}
      >
        <Moon size={iconSize} />
      </span>
    </button>
  )
}
