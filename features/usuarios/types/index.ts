import { User, Role } from "@prisma/client";

export interface UserWithCounts extends Omit<User, "password"> {
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
