// Servicios
export { AuthService } from "./services/auth.service";
export { SessionService } from "./services/session.service";
export { authClient } from "./services/auth.service";

// Hooks
export { useSession } from "./hooks/useSession";
export { useUser } from "./hooks/useUser";

// Guards
export { withAuth, type WithAuthOptions } from "./guards/withAuth";
export { withRole, type WithRoleOptions } from "./guards/withRole";
export {
  apiGuard,
  requireApiAuth,
  requireApiRole,
  requireApiPermission,
  type ApiGuardOptions,
  type GuardResult,
} from "./guards/apiGuard";

// Tipos
export type {
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserWithRoles,
} from "./types";
