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

  const createMovement = async (data: CreateMovementInput): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await MovementService.createMovement(data);
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
