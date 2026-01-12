import { prisma } from "@/lib/prisma";

// Inferir tipos desde Prisma v7 (no se importan directamente)
type User = Awaited<ReturnType<typeof prisma.user.findFirst>>;

// Role como string literal (compatible con Prisma v7)
export type Role = "ADMIN" | "USER";

export interface UserWithCounts extends Omit<NonNullable<User>, "password"> {
  _count?: {
    movements: number;
    sessions: number;
  };
}

export interface GetUsersResponse {
  data: UserWithCounts[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UpdateUserResponse {
  data: UserWithCounts;
  message: string;
}

export interface UserFilters {
  role?: Role;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}
