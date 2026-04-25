import { apiPost, apiGet } from '@/services/api.client'
import type { ApiResponse } from '@/types/api.types'
import type { AuthSession, LoginRequest, User } from '@/types/auth.types'

/** Authenticate with email and password */
export async function login(
  credentials: LoginRequest,
): Promise<ApiResponse<AuthSession>> {
  return apiPost<AuthSession>('/auth/login', credentials)
}

/** End the current session */
export async function logout(): Promise<ApiResponse<{ message: string }>> {
  return apiPost<{ message: string }>('/auth/logout', {})
}

/** Refresh access token */
export async function refreshToken(
  token: string,
): Promise<ApiResponse<{ accessToken: string }>> {
  return apiPost<{ accessToken: string }>('/auth/refresh', { token })
}

/** Get the currently authenticated user profile */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiGet<User>('/auth/me')
}
