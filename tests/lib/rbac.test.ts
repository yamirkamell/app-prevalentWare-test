import { describe, it, expect } from "vitest";
import { Role, hasRole, requireRole } from "@/lib/rbac";
import type { UserWithRoles } from "@/lib/rbac";

describe("RBAC - Role Based Access Control", () => {
  describe("hasRole", () => {
    it("debe retornar true si el usuario tiene el rol ADMIN", () => {
      const user: UserWithRoles = {
        id: "1",
        name: "Admin User",
        email: "admin@test.com",
        role: "ADMIN",
        roles: [Role.ADMIN],
      };

      expect(hasRole(user, Role.ADMIN)).toBe(true);
    });

    it("debe retornar false si el usuario no tiene el rol ADMIN", () => {
      const user: UserWithRoles = {
        id: "2",
        name: "Regular User",
        email: "user@test.com",
        role: "USER",
        roles: [Role.USER],
      };

      expect(hasRole(user, Role.ADMIN)).toBe(false);
    });

    it("debe retornar false si el usuario es null", () => {
      expect(hasRole(null, Role.ADMIN)).toBe(false);
    });
  });

  describe("requireRole", () => {
    it("no debe lanzar error si el usuario tiene el rol requerido", () => {
      const user: UserWithRoles = {
        id: "1",
        name: "Admin User",
        email: "admin@test.com",
        role: "ADMIN",
        roles: [Role.ADMIN],
      };

      expect(() => requireRole(user, Role.ADMIN)).not.toThrow();
    });

    it("debe lanzar error si el usuario no tiene el rol requerido", () => {
      const user: UserWithRoles = {
        id: "2",
        name: "Regular User",
        email: "user@test.com",
        role: "USER",
        roles: [Role.USER],
      };

      expect(() => requireRole(user, Role.ADMIN)).toThrow();
    });

    it("debe lanzar error si el usuario es null", () => {
      expect(() => requireRole(null, Role.ADMIN)).toThrow();
    });
  });
});
