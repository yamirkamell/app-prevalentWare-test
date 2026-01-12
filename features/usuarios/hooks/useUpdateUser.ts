"use client";

import { useState, useCallback } from "react";
import { UserService } from "../services/user.service";
import type { UpdateUserInput } from "../validators/user.validator";

interface UseUpdateUserReturn {
  updateUser: (userId: string, data: UpdateUserInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useUpdateUser(): UseUpdateUserReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (userId: string, data: UpdateUserInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await UserService.updateUser(userId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    updateUser,
    isLoading,
    error,
    reset,
  };
}
