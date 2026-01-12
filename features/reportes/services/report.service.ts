import type {
  GetReportsResponse,
  ReportFilters,
} from "../types";

function buildQueryString(filters?: ReportFilters): string {
  const params = new URLSearchParams();

  if (filters?.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    params.append("endDate", filters.endDate);
  }
  if (filters?.groupBy) {
    params.append("groupBy", filters.groupBy);
  }
  if (filters?.userId) {
    params.append("userId", filters.userId);
  }

  return params.toString();
}

export class ReportService {
  private static readonly API_URL = "/api/reportes";

  static async getReports(
    filters?: ReportFilters
  ): Promise<GetReportsResponse> {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `${this.API_URL}?${queryString}`
      : this.API_URL;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Error al obtener reportes: ${response.statusText}`
      );
    }

    return response.json();
  }

  static async downloadCSV(filters?: ReportFilters): Promise<Blob> {
    const queryString = buildQueryString(filters);
    const url = queryString
      ? `${this.API_URL}/csv?${queryString}`
      : `${this.API_URL}/csv`;

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        error.message || `Error al descargar CSV: ${response.statusText}`
      );
    }

    return response.blob();
  }
}
