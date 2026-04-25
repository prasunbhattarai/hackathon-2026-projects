import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest } from '@/types/auth.types'
import { UserRole } from '@/types/auth.types'
import { ROLE_PERMISSIONS } from '@/constants/roles'
import * as authService from '@/services/auth.service'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  getRole: () => UserRole | null
  hasPermission: (permission: string) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: readCookie('fundus-access-token'),
      isAuthenticated: Boolean(readCookie('fundus-access-token')),
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const res = await authService.login(credentials)
          if (!res.success || !res.data) {
            set({ isLoading: false })
            throw new Error(res.error?.message ?? 'Login failed')
          }
          if (typeof document !== 'undefined') {
            const secure = window.location.protocol === 'https:' ? '; Secure' : ''
            document.cookie = `fundus-access-token=${encodeURIComponent(
              res.data.accessToken,
            )}; Path=/; SameSite=Lax${secure}`
          }
          set({
            user: res.data.user,
            accessToken: res.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          set({ isLoading: false })
          throw err
        }
      },

      logout: () => {
        if (typeof document !== 'undefined') {
          const secure = window.location.protocol === 'https:' ? '; Secure' : ''
          document.cookie = `fundus-access-token=; Path=/; Max-Age=0; SameSite=Lax${secure}`
        }
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },

      getRole: () => {
        return get().user?.role ?? null
      },

      hasPermission: (permission: string) => {
        const role = get().user?.role
        if (!role) return false
        const perms = ROLE_PERMISSIONS[role] as readonly string[]
        return perms.includes('all') || perms.includes(permission)
      },
    }),
    {
      name: 'fundus-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        const cookieToken = readCookie('fundus-access-token')

        // If cookie is missing/empty, force-logout to prevent redirect loops
        if (!cookieToken) {
          if (state?.isAuthenticated || state?.accessToken) {
            state?.logout?.()
          } else {
            useAuthStore.setState({
              user: null,
              accessToken: null,
              isAuthenticated: false,
            })
          }
          return
        }

        // If cookie exists but store doesn't reflect it, sync token into store
        if (state && (!state.accessToken || !state.isAuthenticated)) {
          useAuthStore.setState({
            accessToken: cookieToken,
            isAuthenticated: true,
          })
        }
      },
    },
  ),
)
