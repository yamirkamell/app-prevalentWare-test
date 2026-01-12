"use client";

import { useEffect, useCallback } from "react";
import { SessionService } from "../services/session.service";
import { useAuthStore, authSelectors } from "@/stores/auth.store";

/**
 * Hook para obtener y gestionar la sesión del usuario
 * Usa Zustand store para el estado, pero mantiene la lógica de fetching en el servicio
 * 
 * @returns Objeto con la sesión, estado de carga y función de refresh
 */
export function useSession() {
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const lastFetched = useAuthStore((state) => state.lastFetched);

  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const setLastFetched = useAuthStore((state) => state.setLastFetched);

  const isAuthenticated = useAuthStore(authSelectors.isAuthenticated);
  const currentUser = useAuthStore(authSelectors.currentUser);

  const loadSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentSession = await SessionService.getSession();
      
      setSession(currentSession);
      setLastFetched(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar sesión");
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setSession, setLastFetched]);
  const refresh = useCallback(async () => {
    await loadSession();
  }, [loadSession]);

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (!session || (lastFetched && Date.now() - lastFetched > 60 * 1000)) {
        loadSession();
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [session, lastFetched, loadSession]);

  return {
    session,
    isLoading,
    error,
    refresh,
    isAuthenticated,
    user: currentUser,
  };
}
