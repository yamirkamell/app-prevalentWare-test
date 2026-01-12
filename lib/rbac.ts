import { User } from "./auth";

export enum Role {
  ADMIN = "admin",
  USER = "user",
  MODERATOR = "moderator",
  GUEST = "guest",
}

export enum Permission {
  USER_READ = "user:read",
  USER_WRITE = "user:write",
  USER_DELETE = "user:delete",
  
  RESOURCE_READ = "resource:read",
  RESOURCE_WRITE = "resource:write",
  RESOURCE_DELETE = "resource:delete",
  
  ADMIN_ACCESS = "admin:access",
}

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_WRITE,
    Permission.RESOURCE_DELETE,
    Permission.ADMIN_ACCESS,
  ],
  [Role.MODERATOR]: [
    Permission.USER_READ,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_WRITE,
  ],
  [Role.USER]: [
    Permission.USER_READ,
    Permission.RESOURCE_READ,
    Permission.RESOURCE_WRITE,
  ],
  [Role.GUEST]: [
    Permission.RESOURCE_READ,
  ],
};

export type UserWithRoles = User & {
  roles?: Role[];
};

/**
 * Verifica si un usuario tiene un rol específico
 * @param user Usuario a verificar
 * @param role Rol a verificar
 * @returns true si el usuario tiene el rol
 */
export function hasRole(user: UserWithRoles | null, role: Role): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return user.roles.includes(role);
}

/**
 * Verifica si un usuario tiene al menos uno de los roles especificados
 * @param user Usuario a verificar
 * @param roles Array de roles a verificar
 * @returns true si el usuario tiene al menos uno de los roles
 */
export function hasAnyRole(user: UserWithRoles | null, roles: Role[]): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return roles.some((role) => user.roles?.includes(role));
}

/**
 * Verifica si un usuario tiene todos los roles especificados
 * @param user Usuario a verificar
 * @param roles Array de roles a verificar
 * @returns true si el usuario tiene todos los roles
 */
export function hasAllRoles(user: UserWithRoles | null, roles: Role[]): boolean {
  if (!user || !user.roles) {
    return false;
  }
  return roles.every((role) => user.roles?.includes(role));
}

/**
 * Obtiene los permisos de un usuario basado en sus roles
 * @param user Usuario con roles
 * @returns Array de permisos del usuario
 */
export function getUserPermissions(user: UserWithRoles | null): Permission[] {
  if (!user || !user.roles || user.roles.length === 0) {
    return ROLE_PERMISSIONS[Role.GUEST];
  }

  const permissions = new Set<Permission>();
  user.roles.forEach((role) => {
    const rolePermissions = ROLE_PERMISSIONS[role] || [];
    rolePermissions.forEach((permission) => permissions.add(permission));
  });

  return Array.from(permissions);
}

/**
 * Verifica si un usuario tiene un permiso específico
 * @param user Usuario a verificar
 * @param permission Permiso a verificar
 * @returns true si el usuario tiene el permiso
 */
export function hasPermission(user: UserWithRoles | null, permission: Permission): boolean {
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
}

/**
 * Verifica si un usuario tiene al menos uno de los permisos especificados
 * @param user Usuario a verificar
 * @param permissions Array de permisos a verificar
 * @returns true si el usuario tiene al menos uno de los permisos
 */
export function hasAnyPermission(
  user: UserWithRoles | null,
  permissions: Permission[]
): boolean {
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
}

/**
 * Verifica si un usuario tiene todos los permisos especificados
 * @param user Usuario a verificar
 * @param permissions Array de permisos a verificar
 * @returns true si el usuario tiene todos los permisos
 */
export function hasAllPermissions(
  user: UserWithRoles | null,
  permissions: Permission[]
): boolean {
  const userPermissions = getUserPermissions(user);
  return permissions.every((permission) => userPermissions.includes(permission));
}

/**
 * Requiere que el usuario tenga un rol específico
 * @param user Usuario a verificar
 * @param role Rol requerido
 * @throws Error si el usuario no tiene el rol
 */
export function requireRole(user: UserWithRoles | null, role: Role): void {
  if (!hasRole(user, role)) {
    throw new Error(`Forbidden: Role '${role}' is required`);
  }
}

/**
 * Requiere que el usuario tenga al menos uno de los roles especificados
 * @param user Usuario a verificar
 * @param roles Roles requeridos
 * @throws Error si el usuario no tiene ninguno de los roles
 */
export function requireAnyRole(user: UserWithRoles | null, roles: Role[]): void {
  if (!hasAnyRole(user, roles)) {
    throw new Error(`Forbidden: One of the following roles is required: ${roles.join(", ")}`);
  }
}

/**
 * Requiere que el usuario tenga un permiso específico
 * @param user Usuario a verificar
 * @param permission Permiso requerido
 * @throws Error si el usuario no tiene el permiso
 */
export function requirePermission(user: UserWithRoles | null, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Forbidden: Permission '${permission}' is required`);
  }
}

/**
 * Requiere que el usuario tenga al menos uno de los permisos especificados
 * @param user Usuario a verificar
 * @param permissions Permisos requeridos
 * @throws Error si el usuario no tiene ninguno de los permisos
 */
export function requireAnyPermission(
  user: UserWithRoles | null,
  permissions: Permission[]
): void {
  if (!hasAnyPermission(user, permissions)) {
    throw new Error(
      `Forbidden: One of the following permissions is required: ${permissions.join(", ")}`
    );
  }
}

/**
 * Obtiene el nivel de acceso de un usuario (para ordenar/jerarquías)
 * @param user Usuario con roles
 * @returns Número que representa el nivel de acceso (mayor = más privilegios)
 */
export function getAccessLevel(user: UserWithRoles | null): number {
  if (!user || !user.roles || user.roles.length === 0) {
    return 0;
  }

  const roleLevels: Record<Role, number> = {
    [Role.ADMIN]: 100,
    [Role.MODERATOR]: 50,
    [Role.USER]: 25,
    [Role.GUEST]: 10,
  };

  return Math.max(...user.roles.map((role) => roleLevels[role] || 0));
}
