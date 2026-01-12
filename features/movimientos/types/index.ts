import { prisma } from "@/lib/prisma";

// Inferir tipos desde Prisma v7 (no se importan directamente)
type Movement = Awaited<ReturnType<typeof prisma.movement.findFirst>>;
type User = Awaited<ReturnType<typeof prisma.user.findFirst>>;

// MovementType se puede inferir desde el schema o usar como string literal
export type MovementType = "INCOME" | "EXPENSE";

export type MovementWithUser = NonNullable<Movement> & {
  user: Pick<NonNullable<User>, "id" | "name" | "email">;
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
