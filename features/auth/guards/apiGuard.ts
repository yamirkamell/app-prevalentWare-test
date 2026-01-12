import { NextRequest, NextResponse } from "next/server";
import { getServerSession, requireAuth, requireUser } from "@/lib/auth";
import { Role, Permission, hasRole, hasAnyRole, hasPermission, hasAnyPermission } from "@/lib/rbac";
import type { User } from "@/lib/auth";
import { normalizeUserForRBAC } from "./utils";

export interface ApiGuardOptions {
  requireAuth?: boolean;
  role?: Role;
  roles?: Role[];
  permission?: Permission;
  permissions?: Permission[];
}

export interface GuardResult {
  allowed: boolean;
  response: NextResponse | null;
  user: User | null;
}

/**
 * Guard para proteger rutas de API
 * Verifica autenticación, roles y permisos
 *
 * @example
 * ```ts
 * // Requiere autenticación
 * const result = await apiGuard(request);
 * if (!result.allowed) return result.response;
 *
 * // Requiere rol específico
 * const result = await apiGuard(request, { role: Role.ADMIN });
 *
 * // Requiere permiso específico
 * const result = await apiGuard(request, { permission: Permission.USER_WRITE });
 * ```
 */
export async function apiGuard(
  request: NextRequest,
  options: ApiGuardOptions = {}
): Promise<GuardResult> {
  const {
    requireAuth: requireAuthOption = true,
    role,
    roles,
    permission,
    permissions,
  } = options;

  if (!requireAuthOption && !role && !roles && !permission && !permissions) {
    return {
      allowed: true,
      response: null,
      user: null,
    };
  }

  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return {
        allowed: false,
        response: NextResponse.json(
          { error: "Unauthorized: Authentication required" },
          { status: 401 }
        ),
        user: null,
      };
    }

    const user = session.user;

    const normalizedUser = normalizeUserForRBAC(user);

    if (role) {
      const hasRequiredRole = hasRole(normalizedUser, role);
            
      if (!hasRequiredRole) {
        return {
          allowed: false,
          response: NextResponse.json(
            { error: `Forbidden: Role '${role}' is required` },
            { status: 403 }
          ),
          user: null,
        };
      }
    }

    if (roles && roles.length > 0) {
      if (!hasAnyRole(normalizedUser, roles)) {
        return {
          allowed: false,
          response: NextResponse.json(
            { error: `Forbidden: One of the following roles is required: ${roles.join(", ")}` },
            { status: 403 }
          ),
          user: null,
        };
      }
    }

    if (permission) {
      if (!hasPermission(normalizedUser, permission)) {
        return {
          allowed: false,
          response: NextResponse.json(
            { error: `Forbidden: Permission '${permission}' is required` },
            { status: 403 }
          ),
          user: null,
        };
      }
    }

    if (permissions && permissions.length > 0) {
      if (!hasAnyPermission(normalizedUser, permissions)) {
        return {
          allowed: false,
          response: NextResponse.json(
            {
              error: `Forbidden: One of the following permissions is required: ${permissions.join(", ")}`,
            },
            { status: 403 }
          ),
          user: null,
        };
      }
    }

    return {
      allowed: true,
      response: null,
      user,
    };
  } catch (error) {
    return {
      allowed: false,
      response: NextResponse.json(
        {
          error: error instanceof Error ? error.message : "Internal server error",
        },
        { status: 500 }
      ),
      user: null,
    };
  }
}

/**
 * Helper para requerir autenticación en una ruta de API
 * Lanza un error si el usuario no está autenticado
 *
 * @example
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const user = await requireApiAuth(request);
 *   // user está garantizado que no es null
 * }
 * ```
 */
export async function requireApiAuth(request: NextRequest): Promise<User> {
  const result = await apiGuard(request, { requireAuth: true });
  if (!result.allowed || !result.user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return result.user;
}

/**
 * Helper para requerir un rol específico en una ruta de API
 *
 * @example
 * ```ts
 * export async function DELETE(request: NextRequest) {
 *   const user = await requireApiRole(request, Role.ADMIN);
 *   // user tiene el rol ADMIN
 * }
 * ```
 */
export async function requireApiRole(request: NextRequest, role: Role): Promise<User> {
  const result = await apiGuard(request, { role });
  if (!result.allowed || !result.user) {
    throw new Error(`Forbidden: Role '${role}' is required`);
  }
  return result.user;
}

/**
 * Helper para requerir un permiso específico en una ruta de API
 *
 * @example
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const user = await requireApiPermission(request, Permission.USER_WRITE);
 *   // user tiene el permiso USER_WRITE
 * }
 * ```
 */
export async function requireApiPermission(
  request: NextRequest,
  permission: Permission
): Promise<User> {
  const result = await apiGuard(request, { permission });
  if (!result.allowed || !result.user) {
    throw new Error(`Forbidden: Permission '${permission}' is required`);
  }
  return result.user;
}
