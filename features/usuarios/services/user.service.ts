import type {
  GetUsersResponse,
  UpdateUserResponse,
  UserFilters,
  PaginationOptions,
} from "../types";
import type { UpdateUserInput } from "../validators/user.validator";

function buildQueryString(
  pagination: PaginationOptions,
  filters?: UserFilters
): string {
  const params = new URLSearchParams();
  params.append("page", pagination.page.toString());
  params.append("limit", pagination.limit.toString());

  if (filters?.role) {
    params.append("role", filters.role);
  }
  if (filters?.search) {
    params.append("search", filters.search);
  }

  return params.toString();
}

export class UserService {
  private static readonly API_URL = "/api/usuarios";

   static async getUsers(
    pagination: PaginationOptions,
    filters?: UserFilters
  ): Promise<GetUsersResponse> {
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
        error.message || `Error al obtener usuarios: ${response.statusText}`
      );
    }

    return response.json();
  }

  static async updateUser(
    userId: string,
    data: UpdateUserInput
  ): Promise<UpdateUserResponse> {
    if (process.env.NODE_ENV === "development") {
      console.log("[UserService] Actualizando usuario:", userId, "con datos:", data);
    }

    const response = await fetch(`${this.API_URL}/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (process.env.NODE_ENV === "development") {
      console.log("[UserService] Respuesta del servidor:", response.status, response.statusText);
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (process.env.NODE_ENV === "development") {
        console.error("[UserService] Error del servidor:", error);
      }
      throw new Error(
        error.message || `Error al actualizar usuario: ${response.statusText}`
      );
    }

    const result = await response.json();
    if (process.env.NODE_ENV === "development") {
      console.log("[UserService] Usuario actualizado exitosamente:", result);
    }
    return result;
  }
}
