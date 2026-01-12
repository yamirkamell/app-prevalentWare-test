"use client";

import { useState } from "react";
import { ReportService } from "../services/report.service";
import type { ReportFilters } from "../types";

interface UseDownloadCSVReturn {
  downloadCSV: (filters?: ReportFilters) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  reset: () => void;
}

export function useDownloadCSV(): UseDownloadCSVReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadCSV = async (filters?: ReportFilters) => {
    setIsLoading(true);
    setError(null);

    try {
      const blob = await ReportService.downloadCSV(filters);
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      
      const now = new Date();
      link.download = `reporte-movimientos-${now.toISOString().split("T")[0]}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  return {
    downloadCSV,
    isLoading,
    error,
    reset,
  };
}
