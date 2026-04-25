'use client'

import { cn } from '@/lib/cn'

export interface ContainerProps {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const maxWidthStyles: Record<string, string> = {
  sm: 'max-w-[640px]',
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1280px]',
  full: 'max-w-full',
}

export const Container = ({
  children,
  maxWidth = 'xl',
  className,
}: ContainerProps) => (
  <div
    className={cn(
      'w-full mx-auto',
      'px-4 md:px-6 lg:px-8',
      maxWidthStyles[maxWidth],
      className,
    )}
  >
    {children}
  </div>
)
