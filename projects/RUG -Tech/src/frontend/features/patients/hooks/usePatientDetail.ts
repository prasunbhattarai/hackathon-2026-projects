'use client'

import { useQuery } from '@tanstack/react-query'
import * as patientService from '@/services/patient.service'

export function usePatientDetail(patientId: string) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => patientService.getPatientDetail(patientId),
    enabled: !!patientId,
  })
}

