// Servicios del cliente
export { AuthService } from "./services/auth.service";
export { SessionService } from "./services/session.service";
export { authClient } from "./services/auth.service";

// Hooks
export { useSession } from "./hooks/useSession";
export { useUser } from "./hooks/useUser";
export { useAuth } from "./hooks/useAuth";
export { useAuthSync } from "./hooks/useAuthSync";

// Guards del cliente
export { withAuth, type WithAuthOptions } from "./guards/withAuth";
export { withRole, type WithRoleOptions } from "./guards/withRole";

// Componentes
export { LoginForm } from "./components/LoginForm";
export { RegisterForm } from "./components/RegisterForm";
export { AuthTabs } from "./components/AuthTabs";
export { GitHubAuthButton } from "./components/GitHubAuthButton";

// Páginas
export { LoginPage } from "./pages/LoginPage";

// Tipos
export type {
  AuthState,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  UserWithRoles,
} from "./types";
