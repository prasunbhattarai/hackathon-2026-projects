'use client'

import { useCallback, useMemo, useState } from 'react'

export function usePagination(totalItems: number, itemsPerPage: number) {
  const safeItemsPerPage = Number.isFinite(itemsPerPage) && itemsPerPage > 0 ? itemsPerPage : 1
  const safeTotalItems = Number.isFinite(totalItems) && totalItems > 0 ? totalItems : 0

  const totalPages = useMemo(() => {
    const pages = Math.ceil(safeTotalItems / safeItemsPerPage)
    return Math.max(1, pages)
  }, [safeItemsPerPage, safeTotalItems])

  const [page, setPageState] = useState(1)

  const setPage = useCallback(
    (next: number) => {
      const n = Math.trunc(next)
      const clamped = Math.min(Math.max(1, n), totalPages)
      setPageState(clamped)
    },
    [totalPages],
  )

  const pageClamped = Math.min(Math.max(1, page), totalPages)
  const hasNext = pageClamped < totalPages
  const hasPrev = pageClamped > 1

  const pageItems = useCallback(
    <T,>(items: T[]): T[] => {
      const start = (pageClamped - 1) * safeItemsPerPage
      return items.slice(start, start + safeItemsPerPage)
    },
    [pageClamped, safeItemsPerPage],
  )

  return { page: pageClamped, setPage, totalPages, hasNext, hasPrev, pageItems }
}
