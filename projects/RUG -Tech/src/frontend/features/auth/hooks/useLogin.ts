'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ROUTES } from '@/constants/routes'
import type { LoginRequest } from '@/types/auth.types'

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const login = useAuthStore((s) => s.login)
  const router = useRouter()

  const handleLogin = async (credentials: LoginRequest) => {
    setError(null)
    setIsLoading(true)

    try {
      await login(credentials)
      router.push(ROUTES.DASHBOARD)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return { handleLogin, isLoading, error }
}
