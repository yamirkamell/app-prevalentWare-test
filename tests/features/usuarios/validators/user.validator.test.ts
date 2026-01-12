import { describe, it, expect } from "vitest";
import { updateUserSchema } from "@/features/usuarios/validators/user.validator";

describe("User Validator", () => {
  describe("updateUserSchema", () => {
    it("debe validar correctamente una actualización de usuario válida", () => {
      const validUpdate = {
        name: "Juan Pérez",
        role: "ADMIN" as const,
      };

      const result = updateUserSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("Juan Pérez");
        expect(result.data.role).toBe("ADMIN");
      }
    });

    it("debe validar correctamente un cambio de rol a USER", () => {
      const validUpdate = {
        name: "María García",
        role: "USER" as const,
      };

      const result = updateUserSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe("USER");
      }
    });

    it("debe rechazar un nombre vacío", () => {
      const invalidUpdate = {
        name: "",
        role: "ADMIN" as const,
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("debe rechazar un nombre que exceda 255 caracteres", () => {
      const invalidUpdate = {
        name: "A".repeat(256), // 256 caracteres
        role: "ADMIN" as const,
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("debe rechazar un rol inválido", () => {
      const invalidUpdate = {
        name: "Usuario",
        role: "INVALID_ROLE" as any,
      };

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("debe rechazar si falta el nombre", () => {
      const invalidUpdate = {
        role: "ADMIN" as const,
      } as any;

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });

    it("debe rechazar si falta el rol", () => {
      const invalidUpdate = {
        name: "Usuario",
      } as any;

      const result = updateUserSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });
});
