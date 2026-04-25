'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { DiseaseCard } from '@/features/diseases/components/DiseaseCard'
import { diseases } from '@/features/diseases/data/diseases.static'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export default function DiseasesPage() {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Disease Reference Library"
          subtitle="Clinical information on retinal conditions detected by Fundus AI"
        />
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2"
      >
        {diseases.map((disease) => (
          <DiseaseCard key={disease.slug} disease={disease} />
        ))}
      </motion.div>
    </motion.div>
  )
}
