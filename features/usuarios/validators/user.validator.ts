import { z } from "zod";
import { updateUserBaseSchema, userRoleSchema } from "@/schemas/entities/user";
import { paginationSchema } from "@/schemas";

/**
 * Schema de validación para actualizar un usuario
 * Usa el schema base compartido
 * Solo permite editar name y role, NO email
 */
export const updateUserSchema = updateUserBaseSchema;

/**
 * Schema de validación para query parameters de búsqueda
 * Compone el schema de paginación con campos específicos de usuarios
 */
export const getUsersQuerySchema = paginationSchema.extend({
  role: userRoleSchema.optional(),
  search: z.string().optional(),
});

/**
 * Tipo inferido del schema de actualización
 */
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

/**
 * Tipo inferido del schema de query
 */
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
