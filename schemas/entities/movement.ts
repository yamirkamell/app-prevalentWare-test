import { z } from "zod";
import { dateStringSchema } from "../common/dates";
import { userIdSchema } from "../common/ids";

/**
 * Schema base para tipo de movimiento
 */
export const movementTypeSchema = z.enum(["INCOME", "EXPENSE"]);

/**
 * Schema base para monto de movimiento
 */
export const movementAmountSchema = z
  .number()
  .positive("El monto debe ser mayor a 0")
  .refine((val) => val <= 999999999999.99, {
    message: "El monto no puede exceder 999,999,999,999.99",
  });

/**
 * Schema base para concepto de movimiento
 */
export const movementConceptSchema = z
  .string()
  .min(1, "El concepto no puede estar vacío")
  .max(255, "El concepto no puede exceder 255 caracteres");

/**
 * Schema base para crear movimiento
 */
export const createMovementBaseSchema = z.object({
  amount: movementAmountSchema,
  concept: movementConceptSchema,
  date: dateStringSchema,
  type: movementTypeSchema,
  userId: userIdSchema.optional(),
});

/**
 * Tipo inferido del schema de creación de movimiento
 */
export type CreateMovementBase = z.infer<typeof createMovementBaseSchema>;
