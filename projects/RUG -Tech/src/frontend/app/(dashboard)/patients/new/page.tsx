'use client'

import { motion } from 'framer-motion'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { PatientCreateForm } from '@/features/patients/components/PatientCreateForm'
import { ROUTES } from '@/constants/routes'
import { staggerContainer, staggerItem } from '@/animations/page.variants'

export default function NewPatientPage() {
  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Register Patient"
          breadcrumbs={[
            { label: 'Patients', href: ROUTES.PATIENTS },
            { label: 'Register' },
          ]}
        />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-6">
        <PatientCreateForm />
      </motion.div>
    </motion.div>
  )
}
