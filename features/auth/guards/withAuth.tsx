"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../hooks/useSession";

export interface WithAuthOptions {
  redirectTo?: string;
  showLoading?: boolean;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthOptions = {}
) {
  const { redirectTo = "/login", showLoading = true } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo);
      }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading && showLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando autenticación...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <Component {...props} />;
  };
}
