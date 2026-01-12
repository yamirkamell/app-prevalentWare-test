"use client";

import { useState, useEffect, useCallback } from "react";
import { UserService } from "../services/user.service";
import type {
  GetUsersResponse,
  UserFilters,
  PaginationOptions,
} from "../types";

interface UseUsersOptions {
  pagination?: PaginationOptions;
  filters?: UserFilters;
  enabled?: boolean;
}

interface UseUsersReturn {
  data: GetUsersResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
}

export function useUsers(
  options: UseUsersOptions = {}
): UseUsersReturn {
  const {
    pagination = { page: 1, limit: 10 },
    filters,
    enabled = true,
  } = options;

  const [data, setData] = useState<GetUsersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await UserService.getUsers(pagination, filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, pagination.page, pagination.limit, JSON.stringify(filters)]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  const fetchNextPage = useCallback(async () => {
    if (!data?.pagination.hasNextPage) return;

    setIsLoading(true);
    setError(null);

    try {
      const nextPage = pagination.page + 1;
      const response = await UserService.getUsers(
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
      const response = await UserService.getUsers(
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
