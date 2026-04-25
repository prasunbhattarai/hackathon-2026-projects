'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Building2, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Card, CardContent } from '@/Components/ui/Card'
import { ROUTES } from '@/constants/routes'
import { UserRole } from '@/types/auth.types'
import { RoleGateWrapper } from '@/features/auth/components/RoleGateWrapper'
import { PlatformStatsGrid } from '@/features/admin/components/PlatformStatsGrid'
import type { PlatformStats } from '@/types/admin.types'
import { casesMock } from '@/mock/data/cases.mock'
import { clinicsMock } from '@/mock/data/clinics.mock'
import { usersMock } from '@/mock/data/users.mock'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

// Build mock stats from existing mock data
const mockStats: PlatformStats = {
  totalClinics: clinicsMock.length,
  totalUsers: usersMock.length,
  totalCases: casesMock.length,
  todayCases: 4,
  criticalCases: casesMock.filter((c) => c.priorityTier === 'critical').length,
  avgProcessingTimeMs: 3200,
}

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <RoleGateWrapper allowedRoles={[UserRole.SUPER_ADMIN]}>
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        <motion.div variants={staggerItem}>
          <PageHeader
            title="Platform Administration"
            subtitle="God view — manage clinics, users, and monitor platform health"
          />
        </motion.div>

        {/* Stats */}
        <motion.div variants={staggerItem} className="mt-2">
          <PlatformStatsGrid stats={stats} loading={loading} />
        </motion.div>

        {/* Quick links */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="cursor-pointer hover:border-[var(--border-strong)] transition-colors" onClick={() => router.push(ROUTES.ADMIN_CLINICS)}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <Building2 size={18} className="text-[var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Manage Clinics</p>
                  <p className="text-xs text-[var(--text-muted)]">{clinicsMock.length} registered clinics</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)]" />
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-[var(--border-strong)] transition-colors" onClick={() => router.push(ROUTES.ADMIN_USERS)}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Users size={18} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Manage Users</p>
                  <p className="text-xs text-[var(--text-muted)]">{usersMock.length} platform users</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-[var(--text-muted)]" />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </RoleGateWrapper>
  )
}
