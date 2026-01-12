"use client";

import { useSession } from "./useSession";
import type { User } from "@/lib/auth";

/**
 * Hook para obtener el usuario actual de la sesión
 * @returns Objeto con el usuario, estado de carga y función de refresh
 */
export function useUser() {
  const { session, isLoading, error, refresh, isAuthenticated } = useSession();

  const user: User | null = session?.user || null;

  return {
    user,
    isLoading,
    error,
    refresh,
    isAuthenticated,
  };
}
