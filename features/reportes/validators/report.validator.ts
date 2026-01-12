import { z } from "zod";
import { dateRangeSchema } from "@/schemas/common/dates";
import { userIdSchema } from "@/schemas/common/ids";

/**
 * Schema de validación para query parameters de reportes
 * Compone schemas compartidos (fechas) con campos específicos
 */
export const getReportsQuerySchema = dateRangeSchema
  .extend({
    groupBy: z.enum(["day", "week", "month"]).optional().default("month"),
    userId: userIdSchema.optional(),
  })
  .transform((data) => ({
    ...data,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate
      ? (() => {
          const date = new Date(data.endDate);
          date.setHours(23, 59, 59, 999);
          return date;
        })()
      : undefined,
  }));

/**
 * Schema de validación para query parameters de CSV
 * Compone schemas compartidos (fechas, userId) sin transformaciones
 */
export const getCSVQuerySchema = dateRangeSchema
  .extend({
    userId: userIdSchema.optional(),
  })
  .transform((data) => ({
    ...data,
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    endDate: data.endDate
      ? (() => {
          const date = new Date(data.endDate);
          date.setHours(23, 59, 59, 999);
          return date;
        })()
      : undefined,
  }));

/**
 * Tipo inferido del schema de reportes
 */
export type GetReportsQuery = z.infer<typeof getReportsQuerySchema>;

/**
 * Tipo inferido del schema de CSV
 */
export type GetCSVQuery = z.infer<typeof getCSVQuerySchema>;
