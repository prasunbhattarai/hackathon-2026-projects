export const ROLES = {
  SUPER_ADMIN: "super_admin",
  DOCTOR: "doctor",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_PERMISSIONS = {
  super_admin: ["all"],
  doctor: ["patients", "cases", "reports"],
} as const;

export type Permission =
  (typeof ROLE_PERMISSIONS)[keyof typeof ROLE_PERMISSIONS][number];
