import type { Session, User } from "@/lib/auth";
import type { Role, Permission } from "@/lib/rbac";

export type { Session, User };
export type { Role, Permission };

export type UserWithRoles = User & {
  roles?: Role[];
};

export interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}
