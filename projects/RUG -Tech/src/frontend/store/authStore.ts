import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, LoginRequest } from '@/types/auth.types'
import { UserRole } from '@/types/auth.types'
import { ROLE_PERMISSIONS } from '@/constants/roles'
import * as authService from '@/services/auth.service'

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
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true })
        try {
          const res = await authService.login(credentials)
          if (!res.success || !res.data) {
            set({ isLoading: false })
            throw new Error(res.error?.message ?? 'Login failed')
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
    },
  ),
)
