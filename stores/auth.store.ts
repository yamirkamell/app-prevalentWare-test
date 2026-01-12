import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "@/lib/auth";

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;

  setSession: (session: Session | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
  setLastFetched: (timestamp: number) => void;
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      isLoading: false,
      error: null,
      lastFetched: null,

      setSession: (session) => set({ session, error: null }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
      clearSession: () =>
        set({
          session: null,
          error: null,
          isLoading: false,
          lastFetched: null,
        }),
      setLastFetched: (timestamp) => set({ lastFetched: timestamp }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        session: state.session,
        lastFetched: state.lastFetched,
      }),
    }
  )
);

export const authSelectors = {
  isAuthenticated: (state: AuthState) => state.session !== null,
  currentUser: (state: AuthState) => state.session?.user ?? null,
  needsRefresh: (state: AuthState, maxAge: number = 5 * 60 * 1000) => {
    if (!state.lastFetched) return true;
    return Date.now() - state.lastFetched > maxAge;
  },
};
