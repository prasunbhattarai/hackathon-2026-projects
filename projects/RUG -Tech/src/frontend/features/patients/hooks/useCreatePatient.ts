'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import * as patientService from '@/services/patient.service'
import { ROUTES } from '@/constants/routes'
import type { CreatePatientRequest } from '@/types/patient.types'

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (data: CreatePatientRequest) =>
      patientService.createPatient(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      if (res.success && res.data) {
        router.push(ROUTES.PATIENT_DETAIL(res.data.id))
      }
    },
  })
}
