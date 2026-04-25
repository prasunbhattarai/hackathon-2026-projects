'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Search } from 'lucide-react'
import { PageHeader } from '@/Components/Layout/PageHeader'
import { Button } from '@/Components/ui/Button'
import { Input } from '@/Components/ui/Input'
import { Avatar } from '@/Components/ui/Avatar'
import { Badge } from '@/Components/ui/Badge'
import { SkeletonTableRow } from '@/Components/ui/Skeleton'
import { ROUTES } from '@/constants/routes'
import { patientsMock } from '@/mock/data/patients.mock'
import { casesMock } from '@/mock/data/cases.mock'
import { staggerContainer, staggerItem } from '@/animations/page.variants'
import type { Patient } from '@/types/patient.types'

function computeAge(dob: string): number {
  const now = new Date()
  const d = new Date(dob)
  let age = now.getFullYear() - d.getFullYear()
  const m = now.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--
  return age
}

function getCaseCount(patientId: string): number {
  return casesMock.filter((c) => c.patientId === patientId).length
}

export default function PatientsPageClient() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [patients, setPatients] = useState<Patient[]>([])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPatients(patientsMock)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  const filtered = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.medicalId.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate">
      <motion.div variants={staggerItem}>
        <PageHeader
          title="Patients"
          subtitle={`${patients.length} registered patients`}
          actions={
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus size={14} />}
              onClick={() => router.push(ROUTES.PATIENT_NEW)}
            >
              Register Patient
            </Button>
          }
        />
      </motion.div>

      <motion.div variants={staggerItem} className="mt-4 max-w-sm">
        <Input
          placeholder="Search by name or medical ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search size={14} />}
        />
      </motion.div>

      <motion.div
        variants={staggerItem}
        className="mt-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-[4px] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[var(--bg-elevated)]">
                {['Patient', 'Medical ID', 'Age', 'Gender', 'Contact', 'Cases'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left font-condensed font-medium text-[11px] uppercase tracking-[0.08em] text-[var(--text-muted)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonTableRow key={i} columns={6} />
                ))}

              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-[var(--text-muted)]"
                  >
                    No patients found
                  </td>
                </tr>
              )}

              {!isLoading &&
                filtered.map((p) => {
                  const age = computeAge(p.dateOfBirth)
                  const cases = getCaseCount(p.id)
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-subtle)] cursor-pointer transition-colors duration-100"
                      onClick={() => router.push(ROUTES.PATIENT_DETAIL(p.id))}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={p.fullName} size="sm" />
                          <span className="text-sm text-[var(--text-primary)]">
                            {p.fullName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-secondary)]">
                        {p.medicalId}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-[var(--text-secondary)]">
                        {age}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-[var(--text-secondary)] capitalize">
                        {p.gender}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-[var(--text-muted)]">
                        {p.contact}
                      </td>
                      <td className="px-4 py-2.5">
                        <Badge variant={cases > 3 ? 'medium' : 'none'} size="sm">
                          {cases}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  )
}

