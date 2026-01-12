"use client";

import { useAuthStore } from "@/stores/auth.store";
import { SessionService } from "../services/session.service";

export function useAuthSync() {
  const setSession = useAuthStore((state) => state.setSession);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setLastFetched = useAuthStore((state) => state.setLastFetched);

  const syncSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const session = await SessionService.getSession();
      
      if (session) {
        setSession(session);
        setLastFetched(Date.now());
      } else {
        setSession(null);
      }
      
      return session;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error al sincronizar sesión");
      setSession(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    clearSession();
  };

  return {
    syncSession,
    clearAuth,
  };
}
