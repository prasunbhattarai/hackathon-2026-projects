'use client'

import { useCallback, useEffect, useState } from 'react'

function safeParseJson<T>(raw: string | null): T | undefined {
  if (raw == null) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (v: T) => void] {
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    const parsed = safeParseJson<T>(window.localStorage.getItem(key))
    return parsed ?? initialValue
  })

  const setValue = useCallback(
    (v: T) => {
      setValueState(v)
      if (typeof window === 'undefined') return
      try {
        window.localStorage.setItem(key, JSON.stringify(v))
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: JSON.stringify(v) }),
        )
      } catch {
        // ignore write errors (quota, private mode, etc.)
      }
    },
    [key],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return
      const next = safeParseJson<T>(e.newValue)
      if (next === undefined) return
      setValueState(next)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, setValue]
}
