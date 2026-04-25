'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import DashboardLayout from '@/app/(dashboard)/layout'
import DashboardPage from '@/app/(dashboard)/page'

export default function RootPage() {
  const router = useRouter()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN)
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  )
}
