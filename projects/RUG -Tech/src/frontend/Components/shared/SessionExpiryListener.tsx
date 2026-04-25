'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import { useToast } from '@/hooks/useToast'

export function SessionExpiryListener() {
  const router = useRouter()
  const toast = useToast()

  useEffect(() => {
    const handler = () => {
      toast.error('Session expired', 'Please sign in again.')
      router.replace(ROUTES.LOGIN)
    }
    window.addEventListener('fundus:session-expired', handler as EventListener)
    return () =>
      window.removeEventListener('fundus:session-expired', handler as EventListener)
  }, [router, toast])

  return null
}

