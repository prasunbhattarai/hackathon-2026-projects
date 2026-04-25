'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats'
import { StatsGrid } from '@/features/dashboard/components/StatsGrid'
import { TriageSummaryCard } from '@/features/dashboard/components/TriageSummaryCard'
import { SeverityDistributionChart } from '@/features/dashboard/components/SeverityDistributionChart'
import { RecentCasesTable } from '@/features/dashboard/components/RecentCasesTable'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export default function DashboardPage() {
  const stats = useDashboardStats()

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Dashboard"
          subtitle="Retinal Diagnostic Overview"
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <StatsGrid stats={stats} />
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6"
      >
        <TriageSummaryCard className="lg:col-span-1" />
        <SeverityDistributionChart stats={stats} className="lg:col-span-2" />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-6">
        <RecentCasesTable
          cases={stats.recentCases}
          isLoading={stats.isLoading}
        />
      </motion.div>
    </motion.div>
  )
}
