'use client'

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { useAuthStore, type AuthState } from '@/store/authStore'

type AuthContextValue = Pick<
  AuthState,
  'user' | 'isAuthenticated' | 'isLoading' | 'login' | 'logout' | 'getRole' | 'hasPermission'
>

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore()

  return (
    <AuthContext.Provider
      value={{
        user: store.user,
        isAuthenticated: store.isAuthenticated,
        isLoading: store.isLoading,
        login: store.login,
        logout: store.logout,
        getRole: store.getRole,
        hasPermission: store.hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
