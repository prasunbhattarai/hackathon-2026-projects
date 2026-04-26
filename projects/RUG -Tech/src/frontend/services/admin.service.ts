import { apiGet, apiPost } from '@/services/api.client'
import type { ApiResponse } from '@/types/api.types'
import type {
  Clinic,
  CreateClinicRequest,
  PlatformStats,
} from '@/types/admin.types'
import type { User, UserRole } from '@/types/auth.types'

/** Get all clinics */
export async function getClinics(): Promise<ApiResponse<Clinic[]>> {
  return apiGet<Clinic[]>('/admin/clinics')
}

/** Create a new clinic */
export async function createClinic(
  data: CreateClinicRequest,
): Promise<ApiResponse<Clinic>> {
  return apiPost<Clinic>('/admin/clinics', data)
}

/** Get all users, optionally filtered by clinic */
export async function getUsers(
  clinicId?: string,
): Promise<ApiResponse<User[]>> {
  const params: Record<string, string> = {}
  if (clinicId) params.clinicId = clinicId
  return apiGet<User[]>('/admin/users', params)
}

/** Create a new user account */
export async function createUser(data: {
  email: string
  fullName: string
  role: UserRole
  clinicId?: string
}): Promise<ApiResponse<User>> {
  return apiPost<User>('/admin/users', data)
}

/** Activate or deactivate a user */
export async function updateUserStatus(
  userId: string,
  isActive: boolean,
): Promise<ApiResponse<User>> {
  return apiPost<User>(`/admin/users/${userId}/status`, { isActive })
}

/** Get platform-wide statistics */
export async function getPlatformStats(): Promise<
  ApiResponse<PlatformStats>
> {
  return apiGet<PlatformStats>('/admin/stats')
}
