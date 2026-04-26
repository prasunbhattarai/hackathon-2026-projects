'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import * as patientService from '@/services/patient.service'
import { ROUTES } from '@/constants/routes'
import type { CreatePatientRequest } from '@/types/patient.types'
import { useToast } from '@/hooks/useToast'

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { error } = useToast()

  return useMutation({
    mutationFn: (data: CreatePatientRequest) =>
      patientService.createPatient(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      if (res.success && res.data) {
        router.push(ROUTES.PATIENT_DETAIL(res.data.id))
        return
      }

      error(
        'Registration failed',
        res.error?.message ?? 'Unable to register patient. Please try again.',
      )
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : undefined
      error('Registration failed', message ?? 'Unable to register patient.')
    },
  })
}
