'use client'

import { use } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Badge } from '@/Components/ui/Badge'
import { getDiseaseBySlug } from '@/features/diseases/data/diseases.static'
import { DiseaseDetailBody } from '@/features/diseases/components/DiseaseDetailBody'
import { ROUTES } from '@/constants/routes'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export default function DiseaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const disease = getDiseaseBySlug(slug)

  if (!disease) {
    return (
      <div className="flex flex-col items-center py-16 gap-3">
        <p className="text-sm text-[var(--text-muted)]">Disease not found</p>
      </div>
    )
  }

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title={disease.name}
          breadcrumbs={[
            { label: 'Disease Library', href: ROUTES.DISEASES },
            { label: disease.name },
          ]}
          badge={
            <Badge
              variant="outline"
              size="md"
            >
              <span
                className="w-2 h-2 rounded-full mr-1.5 inline-block"
                style={{ backgroundColor: disease.accentColor }}
              />
              {disease.stages.length} classification levels
            </Badge>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem}>
        <DiseaseDetailBody disease={disease} />
      </motion.div>
    </motion.div>
  )
}
