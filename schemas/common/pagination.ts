import { z } from "zod";

/**
 * Schema base para paginación
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100).default(10)),
});

/**
 * Tipo inferido del schema de paginación
 */
export type PaginationInput = z.infer<typeof paginationSchema>;

/**
 * Schema para respuesta de paginación
 */
export const paginationResponseSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

/**
 * Tipo inferido del schema de respuesta de paginación
 */
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;
