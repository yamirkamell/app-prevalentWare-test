import { z } from "zod";

/**
 * Schema para ID de usuario
 * Acepta cualquier string no vacío (Better Auth usa IDs no-UUID)
 */
export const userIdSchema = z
  .string({
    required_error: "El ID de usuario es requerido",
    invalid_type_error: "El ID de usuario debe ser un texto",
  })
  .min(1, "El ID de usuario no puede estar vacío");

/**
 * Schema para UUID (opcional, para casos donde se requiera UUID)
 */
export const uuidSchema = z.string().uuid({
  message: "Debe ser un UUID válido",
});

/**
 * Tipo inferido del schema de ID de usuario
 */
export type UserId = z.infer<typeof userIdSchema>;
