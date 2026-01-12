"use client";

import { useState, useEffect, useCallback } from "react";
import { ReportService } from "../services/report.service";
import type {
  GetReportsResponse,
  ReportFilters,
} from "../types";

interface UseReportsOptions {
  filters?: ReportFilters;
  enabled?: boolean;
}

interface UseReportsReturn {
  data: GetReportsResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useReports(
  options: UseReportsOptions = {}
): UseReportsReturn {
  const {
    filters,
    enabled = true,
  } = options;

  const [data, setData] = useState<GetReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await ReportService.getReports(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled, JSON.stringify(filters)]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const refetch = useCallback(async () => {
    await fetchReports();
  }, [fetchReports]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
