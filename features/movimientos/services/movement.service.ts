import type {
  GetMovementsResponse,
  CreateMovementResponse,
  MovementFilters,
  PaginationOptions,
} from "../types";
import type { CreateMovementInput } from "../validators/movement.validator";

function buildQueryString(
  pagination: PaginationOptions,
  filters?: MovementFilters
): string {
  const params = new URLSearchParams();
  params.append("page", pagination.page.toString());
  params.append("limit", pagination.limit.toString());

  if (filters?.type) {
    params.append("type", filters.type);
  }
  if (filters?.userId) {
    params.append("userId", filters.userId);
  }
  if (filters?.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters?.endDate) {
    params.append("endDate", filters.endDate);
  }

  return params.toString();
}

export class MovementService {
  private static readonly API_URL = "/api/movimientos";

  static async getMovements(
    pagination: PaginationOptions,
    filters?: MovementFilters
  ): Promise<GetMovementsResponse> {
    const queryString = buildQueryString(pagination, filters);
    const url = `${this.API_URL}?${queryString}`;

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
        error.message || `Error al obtener movimientos: ${response.statusText}`
      );
    }

    return response.json();
  }

  static async createMovement(
    data: CreateMovementInput
  ): Promise<CreateMovementResponse> {
    
    const response = await fetch(this.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("[MovementService] Error del servidor:", error);
      throw new Error(
        error.message || `Error al crear movimiento: ${response.statusText}`
      );
    }

    const result = await response.json();
    return result;
  }
}
