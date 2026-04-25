export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  CLINIC_ADMIN: 'clinic_admin',
  DOCTOR: 'doctor',
  LAB_ASSISTANT: 'lab_assistant',
} as const

export type UserRole = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_PERMISSIONS = {
  super_admin: ['all'],
  clinic_admin: ['patients', 'cases', 'reports', 'settings'],
  doctor: ['patients', 'cases', 'reports'],
  lab_assistant: ['cases', 'queue'],
} as const

export type Permission =
  (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number]
