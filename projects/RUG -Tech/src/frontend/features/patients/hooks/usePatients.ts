'use client'

import { useQuery } from '@tanstack/react-query'
import * as patientService from '@/services/patient.service'

export function usePatients(params: { page?: number; limit?: number; search?: string }) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientService.getPatients(params),
  })
}

