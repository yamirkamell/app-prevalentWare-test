"use client";

import { Button } from "@/components/ui/button";
import { useDownloadCSV } from "../hooks/useDownloadCSV";
import type { ReportFilters } from "../types";

interface DownloadCSVButtonProps {
  filters?: ReportFilters;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export function DownloadCSVButton({
  filters,
  variant = "outline",
  size = "default",
}: DownloadCSVButtonProps) {
  const { downloadCSV, isLoading, error } = useDownloadCSV();

  const handleDownload = async () => {
    try {
      await downloadCSV(filters);
    } catch (err) {
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={isLoading}
        variant={variant}
        size={size}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Descargando...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Descargar CSV
          </>
        )}
      </Button>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
