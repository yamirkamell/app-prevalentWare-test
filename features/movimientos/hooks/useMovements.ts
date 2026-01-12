"use client";

import { useState, useEffect, useCallback } from "react";
import { MovementService } from "../services/movement.service";
import type {
  GetMovementsResponse,
  MovementFilters,
  PaginationOptions,
} from "../types";

interface UseMovementsOptions {
  pagination?: PaginationOptions;
  filters?: MovementFilters;
  enabled?: boolean;
}

interface UseMovementsReturn {
  data: GetMovementsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
}

/**
 * Hook para obtener la lista de movimientos
 */
export function useMovements(
  options: UseMovementsOptions = {}
): UseMovementsReturn {
  const {
    pagination = { page: 1, limit: 10 },
    filters,
    enabled = true,
  } = options;

  const [data, setData] = useState<GetMovementsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await MovementService.getMovements(pagination, filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, pagination.page, pagination.limit, JSON.stringify(filters)]);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  const refetch = useCallback(async () => {
    await fetchMovements();
  }, [fetchMovements]);

  const fetchNextPage = useCallback(async () => {
    if (!data?.pagination.hasNextPage) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = pagination.page + 1;
      const response = await MovementService.getMovements(
        { ...pagination, page: nextPage },
        filters
      );
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [data?.pagination.hasNextPage, pagination, filters]);

  const fetchPreviousPage = useCallback(async () => {
    if (!data?.pagination.hasPreviousPage) return;

    setIsLoading(true);
    setError(null);

    try {
      const prevPage = pagination.page - 1;
      const response = await MovementService.getMovements(
        { ...pagination, page: prevPage },
        filters
      );
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  }, [data?.pagination.hasPreviousPage, pagination, filters]);

  return {
    data,
    isLoading,
    error,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
  };
}
