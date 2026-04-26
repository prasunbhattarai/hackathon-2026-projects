import type { ApiResponse } from "@/types/api.types";

export const enum UserRole {
  SUPER_ADMIN = "super_admin",
  DOCTOR = "doctor",
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  clinicId: string | null;
  fullName: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type LoginResponse = ApiResponse<AuthSession>;

export interface JWTPayload {
  userId: string;
  role: UserRole;
  clinicId: string | null;
  exp: number;
}
