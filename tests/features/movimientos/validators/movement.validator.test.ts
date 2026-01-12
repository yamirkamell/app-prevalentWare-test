import { describe, it, expect } from "vitest";
import { createMovementSchema } from "@/features/movimientos/validators/movement.validator";

describe("Movement Validator", () => {
  describe("createMovementSchema", () => {
    it("debe validar correctamente un movimiento de ingreso válido", () => {
      const validMovement = {
        amount: 1000.50,
        concept: "Venta de producto",
        date: "2024-01-15",
        type: "INCOME" as const,
      };

      const result = createMovementSchema.safeParse(validMovement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(1000.50);
        expect(result.data.concept).toBe("Venta de producto");
        expect(result.data.type).toBe("INCOME");
      }
    });

    it("debe validar correctamente un movimiento de gasto válido", () => {
      const validMovement = {
        amount: 500.25,
        concept: "Compra de materiales",
        date: "2024-01-16",
        type: "EXPENSE" as const,
      };

      const result = createMovementSchema.safeParse(validMovement);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("EXPENSE");
      }
    });

    it("debe rechazar un monto negativo", () => {
      const invalidMovement = {
        amount: -100,
        concept: "Movimiento inválido",
        date: "2024-01-15",
        type: "INCOME" as const,
      };

      const result = createMovementSchema.safeParse(invalidMovement);
      expect(result.success).toBe(false);
    });

    it("debe rechazar un concepto vacío", () => {
      const invalidMovement = {
        amount: 1000,
        concept: "",
        date: "2024-01-15",
        type: "INCOME" as const,
      };

      const result = createMovementSchema.safeParse(invalidMovement);
      expect(result.success).toBe(false);
    });

    it("debe rechazar una fecha en formato incorrecto", () => {
      const invalidMovement = {
        amount: 1000,
        concept: "Movimiento",
        date: "15-01-2024", // Formato incorrecto
        type: "INCOME" as const,
      };

      const result = createMovementSchema.safeParse(invalidMovement);
      expect(result.success).toBe(false);
    });

    it("debe rechazar un tipo de movimiento inválido", () => {
      const invalidMovement = {
        amount: 1000,
        concept: "Movimiento",
        date: "2024-01-15",
        type: "INVALID_TYPE" as any,
      };

      const result = createMovementSchema.safeParse(invalidMovement);
      expect(result.success).toBe(false);
    });
  });
});
