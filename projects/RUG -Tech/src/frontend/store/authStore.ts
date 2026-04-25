import { create } from 'zustand'
import type { UserRole } from '@/constants/roles'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  clinicId?: string
}

export interface AuthStore {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => void
}

/** Mock user for development — replace with real auth later */
const MOCK_USER: AuthUser = {
  id: 'usr-001',
  name: 'Dr. Anika Sharma',
  email: 'anika.sharma@fundusai.com',
  role: 'doctor',
  clinicId: 'clinic-001',
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: MOCK_USER,
  isAuthenticated: true,

  setUser: (user) =>
    set({ user, isAuthenticated: user !== null }),

  logout: () =>
    set({ user: null, isAuthenticated: false }),
}))
