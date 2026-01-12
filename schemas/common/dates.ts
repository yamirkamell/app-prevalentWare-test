import { z } from "zod";

/**
 * Schema para formato de fecha YYYY-MM-DD
 */
export const dateStringSchema = z
  .string({
    required_error: "La fecha es requerida",
    invalid_type_error: "La fecha debe ser una cadena de texto",
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe estar en formato YYYY-MM-DD")
  .transform((str) => {
    const date = new Date(str);
    return date.toISOString().split("T")[0]; // Mantener formato YYYY-MM-DD
  });

/**
 * Schema para rango de fechas
 */
export const dateRangeSchema = z.object({
  startDate: dateStringSchema.optional(),
  endDate: dateStringSchema.optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "La fecha de inicio debe ser anterior o igual a la fecha de fin",
    path: ["endDate"],
  }
);

/**
 * Tipo inferido del schema de rango de fechas
 */
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
