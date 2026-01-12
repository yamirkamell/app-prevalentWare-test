"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../hooks/useUser";
import { Role, hasRole, hasAnyRole } from "@/lib/rbac";
import { normalizeUserForRBAC } from "./utils";

export interface WithRoleOptions {
  redirectTo?: string;
  showLoading?: boolean;
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    role?: Role;
    roles?: Role[];
  } & WithRoleOptions
) {
  const { role, roles, redirectTo = "/unauthorized", showLoading = true } = options;

  return function RoleProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useUser();
    const router = useRouter();

    const normalizedUser = normalizeUserForRBAC(user);

    const hasRequiredRole = role
      ? hasRole(normalizedUser, role)
      : roles
        ? hasAnyRole(normalizedUser, roles)
        : false;

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push("/login");
        } else if (!hasRequiredRole) {
          router.push(redirectTo);
        }
      }
    }, [isAuthenticated, hasRequiredRole, isLoading, router]);

    if (isLoading && showLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !hasRequiredRole) {
      return null;
    }

    return <Component {...props} />;
  };
}
