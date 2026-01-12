import { z } from "zod";

/**
 * Schema para respuestas de error estándar
 * Usado en todas las APIs para mantener consistencia
 */
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.array(z.object({
    path: z.array(z.union([z.string(), z.number()])),
    message: z.string(),
  })).optional(),
});

/**
 * Tipo inferido del schema de error
 */
export type ErrorResponse = z.infer<typeof errorResponseSchema>;

/**
 * Schema para respuestas de éxito estándar
 */
export const successResponseSchema = z.object({
  data: z.unknown(),
  message: z.string().optional(),
});

/**
 * Tipo inferido del schema de éxito
 */
export type SuccessResponse<T = unknown> = {
  data: T;
  message?: string;
};
