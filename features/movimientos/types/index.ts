import { Movement, MovementType, User } from "@prisma/client";

export type MovementWithUser = Movement & {
  user: Pick<User, "id" | "name" | "email">;
};

export interface GetMovementsResponse {
  data: MovementWithUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateMovementResponse {
  data: MovementWithUser;
  message: string;
}

export interface MovementFilters {
  type?: MovementType;
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
