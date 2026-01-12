import { z } from "zod";
import { paginationSchema } from "../common/pagination";
import { dateRangeSchema } from "../common/dates";
import { movementTypeSchema } from "../entities/movement";
import { userRoleSchema } from "../entities/user";

/**
 * Schema para queries de movimientos
 */
export const movementsQuerySchema = paginationSchema
  .merge(dateRangeSchema)
  .extend({
    type: movementTypeSchema.optional(),
    userId: z.string().min(1).optional(),
  });

/**
 * Schema para queries de usuarios
 */
export const usersQuerySchema = paginationSchema.extend({
  role: userRoleSchema.optional(),
  search: z.string().optional(),
});

/**
 * Schema para queries de reportes
 */
export const reportsQuerySchema = dateRangeSchema.extend({
  groupBy: z.enum(["day", "week", "month", "year"]).optional().default("month"),
});
