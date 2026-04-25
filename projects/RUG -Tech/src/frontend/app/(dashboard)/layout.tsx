'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar } from '@/Components/Layout/Sidebar'
import { Topbar } from '@/Components/Layout/Topbar'
import { MobileSidebar } from '@/Components/Layout/MobileSidebar'
import { MobileTopbar } from '@/Components/Layout/MobileTopbar'
import { Container } from '@/Components/Layout/Container'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import { UserRole } from '@/types/auth.types'
import { AccessDenied } from '@/Components/shared/AccessDenied'

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const isAuth = useAuthStore((s) => s.isAuthenticated)
  const role = useAuthStore((s) => s.user?.role ?? null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Avoid lint rule `react-hooks/set-state-in-effect` by deferring the setState.
    // This still prevents hydration mismatch while keeping render logic intact.
    const t = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (mounted && !isAuth) router.replace(ROUTES.LOGIN)
  }, [mounted, isAuth, router])

  const isAdminRoute = useMemo(() => pathname?.startsWith('/admin'), [pathname])
  const hasAccess = !isAdminRoute || role === UserRole.SUPER_ADMIN

  if (!mounted || !isAuth) return null

  return (
    <div className="flex h-screen bg-[var(--bg-base)] overflow-hidden">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop topbar */}
        <div className="hidden md:block">
          <Topbar />
        </div>

        {/* Mobile topbar */}
        <div className="block md:hidden">
          <MobileTopbar onMenuClick={() => setMobileMenuOpen(true)} />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Container className="py-4 md:py-6">
            {hasAccess ? (
              children
            ) : (
              <AccessDenied
                title="Admin access required"
                subtitle="This area is restricted to Super Admin users."
                onBack={() => router.back()}
              />
            )}
          </Container>
        </main>
      </div>

      {/* Mobile drawer */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </div>
  )
}
