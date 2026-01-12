// Componentes
export { UsersTable } from "./components/UsersTable";
export { EditUserModal } from "./components/EditUserModal";

// Páginas
export { UsersPage } from "./pages/UsersPage";

// Hooks
export { useUsers } from "./hooks/useUsers";
export { useUpdateUser } from "./hooks/useUpdateUser";

// Servicios
export { UserService } from "./services/user.service";

// Validators
export {
  updateUserSchema,
  getUsersQuerySchema,
} from "./validators/user.validator";
export type {
  UpdateUserInput,
  GetUsersQuery,
} from "./validators/user.validator";

// Tipos
export type {
  UserWithCounts,
  GetUsersResponse,
  UpdateUserResponse,
  UserFilters,
  PaginationOptions,
} from "./types";
