'use client'

import { Shield, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/cn'
import { Button } from '@/Components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/types/auth.types'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import type { ReactNode } from 'react'

export interface RoleGateWrapperProps {
  allowedRoles: UserRole[]
  children: ReactNode
  fallback?: ReactNode
}

const AccessDenied = () => {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 rounded-full bg-[var(--sev-critical)]/10 flex items-center justify-center">
        <Shield size={28} className="text-[var(--sev-critical)]" />
      </div>
      <h2 className="font-display text-xl text-[var(--text-primary)]">
        Access Restricted
      </h2>
      <p className="text-sm text-[var(--text-muted)] text-center max-w-sm">
        This area requires administrator privileges. Please contact your system administrator if you believe this is an error.
      </p>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<ArrowLeft size={14} />}
        onClick={() => router.push(ROUTES.DASHBOARD)}
      >
        Back to Dashboard
      </Button>
    </div>
  )
}

export const RoleGateWrapper = ({
  allowedRoles,
  children,
  fallback,
}: RoleGateWrapperProps) => {
  const role = useAuthStore((s) => s.getRole())

  // In mock mode, treat null role as super_admin for development
  const effectiveRole = role ?? UserRole.SUPER_ADMIN

  if (!allowedRoles.includes(effectiveRole)) {
    return fallback ? <>{fallback}</> : <AccessDenied />
  }

  return <>{children}</>
}
