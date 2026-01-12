import { z } from "zod";
import { userIdSchema } from "../common/ids";

/**
 * Schema base para el rol de usuario
 */
export const userRoleSchema = z.enum(["ADMIN", "USER"]);

/**
 * Schema base para nombre de usuario
 */
export const userNameSchema = z
  .string()
  .min(1, "El nombre no puede estar vacío")
  .max(255, "El nombre no puede exceder 255 caracteres");

/**
 * Schema base para email
 */
export const userEmailSchema = z
  .string()
  .email("El email debe tener un formato válido")
  .max(255, "El email no puede exceder 255 caracteres");

/**
 * Schema base para actualizar usuario
 * Solo permite editar name y role, NO email
 */
export const updateUserBaseSchema = z.object({
  name: userNameSchema,
  role: userRoleSchema,
});

/**
 * Tipo inferido del schema de actualización de usuario
 */
export type UpdateUserBase = z.infer<typeof updateUserBaseSchema>;
