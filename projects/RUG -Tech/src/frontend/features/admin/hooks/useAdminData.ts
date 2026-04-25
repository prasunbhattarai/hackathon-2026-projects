'use client'

import { useQuery } from '@tanstack/react-query'
import * as adminService from '@/services/admin.service'

export function useClinics() {
  return useQuery({
    queryKey: ['admin', 'clinics'],
    queryFn: () => adminService.getClinics(),
  })
}

export function useAdminUsers(clinicId?: string) {
  return useQuery({
    queryKey: ['admin', 'users', clinicId],
    queryFn: () => adminService.getUsers(clinicId),
  })
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminService.getPlatformStats(),
    refetchInterval: 30000,
  })
}
