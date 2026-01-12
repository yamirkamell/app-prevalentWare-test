import { z } from "zod";
import {
  createMovementBaseSchema,
  movementTypeSchema,
} from "@/schemas/entities/movement";
import { paginationSchema, dateRangeSchema } from "@/schemas";

/**
 * Schema de validación para crear un movimiento
 * Extiende el schema base compartido
 */
export const createMovementSchema = createMovementBaseSchema;

/**
 * Schema de validación para query parameters de búsqueda
 * Compone schemas compartidos (paginación, fechas) con campos específicos
 */
export const getMovementsQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    type: movementTypeSchema.optional(),
    userId: z.string().min(1).optional(), // Cambiado de .uuid() a .min(1) para Better Auth IDs
  });

/**
 * Tipo inferido del schema de creación
 */
export type CreateMovementInput = z.infer<typeof createMovementSchema>;

/**
 * Tipo inferido del schema de query
 */
export type GetMovementsQuery = z.infer<typeof getMovementsQuerySchema>;
