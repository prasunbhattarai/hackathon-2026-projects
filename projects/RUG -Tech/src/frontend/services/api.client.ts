import type { ApiResponse } from '@/types/api.types'
import * as authService from '@/services/auth.service'
import { useAuthStore } from '@/store/authStore'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false'

async function mockDelay(ms = Math.random() * 600 + 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

/** Route mock calls to the appropriate handler based on endpoint pattern */
async function routeMock<T>(
  method: 'GET' | 'POST' | 'UPLOAD',
  endpoint: string,
  bodyOrParams?: unknown,
): Promise<ApiResponse<T>> {
  await mockDelay()

  /* ---- Auth ---- */
  if (endpoint === '/auth/login' && method === 'POST') {
    const { loginMock } = await import('@/mock/handlers/auth.handler')
    return loginMock(bodyOrParams as Parameters<typeof loginMock>[0]) as Promise<ApiResponse<T>>
  }

  /* ---- Patients ---- */
  if (endpoint.match(/^\/patients$/) && method === 'GET') {
    const { listPatientsMock } = await import('@/mock/handlers/patient.handler')
    const p = bodyOrParams as Record<string, string> | undefined
    return listPatientsMock(
      p?.clinicId ?? 'clinic-ktm-eye-01',
      Number(p?.page ?? 1),
      Number(p?.limit ?? 10),
    ) as Promise<ApiResponse<T>>
  }

  if (endpoint.match(/^\/patients\/[\w-]+$/) && method === 'GET') {
    const id = endpoint.split('/').pop()!
    const { getPatientDetailMock } = await import('@/mock/handlers/patient.handler')
    return getPatientDetailMock(id) as Promise<ApiResponse<T>>
  }

  if (endpoint === '/patients' && method === 'POST') {
    const { createPatientMock } = await import('@/mock/handlers/patient.handler')
    return createPatientMock(
      'clinic-ktm-eye-01',
      bodyOrParams as Parameters<typeof createPatientMock>[1],
    ) as Promise<ApiResponse<T>>
  }

  /* ---- Cases ---- */
  if (endpoint.match(/^\/cases$/) && method === 'GET') {
    const { listCasesMock } = await import('@/mock/handlers/case.handler')
    const p = bodyOrParams as Record<string, string> | undefined
    return listCasesMock('clinic-ktm-eye-01', {
      page: Number(p?.page ?? 1),
      limit: Number(p?.limit ?? 10),
      status: p?.status as never,
      priorityTier: p?.priorityTier as never,
    }) as Promise<ApiResponse<T>>
  }

  if (endpoint.match(/^\/cases\/[\w-]+$/) && method === 'GET') {
    const id = endpoint.split('/').pop()!
    const { getCaseDetailMock } = await import('@/mock/handlers/case.handler')
    return getCaseDetailMock(id) as Promise<ApiResponse<T>>
  }

  if (endpoint === '/cases/upload' && (method === 'POST' || method === 'UPLOAD')) {
    const { uploadCaseMock } = await import('@/mock/handlers/case.handler')
    let patientId = 'patient-001'
    if (bodyOrParams instanceof FormData) {
      patientId = (bodyOrParams as FormData).get('patientId')?.toString() ?? patientId
    }
    return uploadCaseMock(patientId) as Promise<ApiResponse<T>>
  }

  /* ---- Analysis ---- */
  if (endpoint.match(/^\/analysis\/[\w-]+$/) && method === 'GET') {
    const caseId = endpoint.split('/').pop()!
    const { getAnalysisByCaseIdMock } = await import('@/mock/handlers/analysis.handler')
    return getAnalysisByCaseIdMock(caseId) as Promise<ApiResponse<T>>
  }

  /* ---- Reports ---- */
  if (endpoint.match(/^\/reports\/[\w-]+/) && method === 'GET') {
    const parts = endpoint.split('/')
    const caseId = parts[2]
    const { getReportBundleByCaseIdMock } = await import('@/mock/handlers/analysis.handler')
    const bundleRes = await getReportBundleByCaseIdMock(caseId)
    if (!bundleRes.success) return bundleRes as unknown as ApiResponse<T>
    const reportType = parts[3] as 'doctor' | 'patient' | 'general' | undefined
    if (reportType && reportType in bundleRes.data) {
      return { success: true, data: bundleRes.data[reportType] as T, error: null }
    }
    return bundleRes as unknown as ApiResponse<T>
  }

  /* ---- Fallback ---- */
  return {
    success: false,
    data: null as unknown as T,
    error: { code: 'MOCK_NOT_FOUND', message: `No mock handler for ${method} ${endpoint}` },
  }
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

function setAccessTokenCookie(token: string) {
  if (typeof document === 'undefined') return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `fundus-access-token=${encodeURIComponent(
    token,
  )}; Path=/; SameSite=Lax${secure}`
}

async function handle401AndRetry<T>(
  original: () => Promise<Response>,
): Promise<ApiResponse<T>> {
  const state = useAuthStore.getState()
  const token = state.accessToken
  if (!token) {
    state.logout()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fundus:session-expired'))
    }
    return {
      success: false,
      data: null as unknown as T,
      error: { code: 'UNAUTHENTICATED', message: 'Session expired' },
    }
  }

  const refreshRes = await authService.refreshToken(token)
  if (!refreshRes.success || !refreshRes.data?.accessToken) {
    state.logout()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fundus:session-expired'))
    }
    return {
      success: false,
      data: null as unknown as T,
      error: { code: 'SESSION_EXPIRED', message: 'Session expired' },
    }
  }

  useAuthStore.setState({ accessToken: refreshRes.data.accessToken })
  setAccessTokenCookie(refreshRes.data.accessToken)

  const retryRes = await original()
  return retryRes.json()
}

/** GET request — real or mock */
export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, string>,
): Promise<ApiResponse<T>> {
  if (USE_MOCK) return routeMock<T>('GET', endpoint, params)

  const url = new URL(`${API_BASE}${endpoint}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const doFetch = () => fetch(url.toString(), { credentials: 'include' })
  const res = await doFetch()
  if (res.status === 401) return handle401AndRetry<T>(doFetch)
  return res.json()
}

/** POST request — real or mock */
export async function apiPost<T>(
  endpoint: string,
  body: unknown,
): Promise<ApiResponse<T>> {
  if (USE_MOCK) return routeMock<T>('POST', endpoint, body)

  const doFetch = () =>
    fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  const res = await doFetch()
  if (res.status === 401) return handle401AndRetry<T>(doFetch)
  return res.json()
}

/** File upload — real or mock */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
): Promise<ApiResponse<T>> {
  if (USE_MOCK) return routeMock<T>('UPLOAD', endpoint, formData)

  const doFetch = () =>
    fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  })
  const res = await doFetch()
  if (res.status === 401) return handle401AndRetry<T>(doFetch)
  return res.json()
}
