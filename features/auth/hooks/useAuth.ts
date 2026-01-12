"use client";

import { useState } from "react";
import { AuthService } from "../services/auth.service";
import { useAuthSync } from "./useAuthSync";
import type { LoginCredentials, RegisterData } from "../services/auth.service";

export function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { syncSession, clearAuth } = useAuthSync();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.login(credentials);

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      await syncSession();

      return { success: true, user: result.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.register(data);

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      await syncSession();

      return { success: true, user: result.user };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      clearAuth();
      
      const result = await AuthService.logout();

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await AuthService.loginWithGitHub();

      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, url: result.url };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    loginWithGitHub,
    isLoading,
    error,
    reset: () => setError(null),
  };
}
