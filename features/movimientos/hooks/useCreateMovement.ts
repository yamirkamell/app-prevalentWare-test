"use client";

import { useState, useCallback } from "react";
import { MovementService } from "../services/movement.service";
import type { CreateMovementInput } from "../validators/movement.validator";

interface UseCreateMovementReturn {
  createMovement: (data: CreateMovementInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useCreateMovement(): UseCreateMovementReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMovement = async (data: CreateMovementInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await MovementService.createMovement(data);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
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
    createMovement,
    isLoading,
    error,
    reset,
  };
}
