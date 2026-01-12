import type { User } from "@/lib/auth";
import { Role } from "@/lib/rbac";
import type { UserWithRoles } from "@/lib/rbac";

function mapPrismaRoleToRBACRole(prismaRole: string): Role | null {
  const roleMap: Record<string, Role> = {
    ADMIN: Role.ADMIN,
    USER: Role.USER,
    MODERATOR: Role.MODERATOR,
    GUEST: Role.GUEST,
    admin: Role.ADMIN,
    user: Role.USER,
    moderator: Role.MODERATOR,
    guest: Role.GUEST,
  };

  return roleMap[prismaRole] || null;
}

/**
 * Normaliza un usuario de Better Auth para que funcione con el sistema RBAC
 * Convierte el campo `role` (singular) del schema a `roles` (array) esperado por RBAC
 *
 * @param user Usuario de Better Auth
 * @returns Usuario normalizado con roles como array
 */
export function normalizeUserForRBAC(user: User | null): UserWithRoles | null {
  if (!user) {
    return null;
  }

  const userRole = (user as any).role || (user as any).roles?.[0];

  if (!userRole) {
    return {
      ...user,
      roles: [],
    };
  }

  const rbacRole = mapPrismaRoleToRBACRole(userRole);

  return {
    ...user,
    roles: rbacRole ? [rbacRole] : [],
  };
}
