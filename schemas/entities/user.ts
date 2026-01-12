import { z } from "zod";
import { userIdSchema } from "../common/ids";

/**
 * Schema base para el rol de usuario
 */
export const userRoleSchema = z.enum(["ADMIN", "USER"], {
  required_error: "El rol es requerido",
  invalid_type_error: "El rol debe ser ADMIN o USER",
});

/**
 * Schema base para nombre de usuario
 */
export const userNameSchema = z
  .string({
    required_error: "El nombre es requerido",
    invalid_type_error: "El nombre debe ser un texto",
  })
  .min(1, "El nombre no puede estar vacío")
  .max(255, "El nombre no puede exceder 255 caracteres");

/**
 * Schema base para email
 */
export const userEmailSchema = z
  .string({
    required_error: "El email es requerido",
    invalid_type_error: "El email debe ser un texto",
  })
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
