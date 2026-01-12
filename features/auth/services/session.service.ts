import { authClient } from "./auth.service";
import type { Session, User } from "@/lib/auth";

export class SessionService {

  private static async fetchUserFromAPI(): Promise<User | null> {
    try {
      const baseURL = typeof window !== "undefined" 
        ? window.location.origin 
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      
      const response = await fetch(`${baseURL}/api/auth/user`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        return null;
      }
          const data = await response.json();

          return data.user || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene la sesión actual del usuario con el objeto user incluido
   * @returns Sesión del usuario con user incluido o null si no está autenticado
   */
  static async getSession(): Promise<Session | null> {
    try {
      const result = await authClient.getSession();

      if (!result.data) {
        return null;
      }

      let session: any = null;
      
      if (result.data.session) {
        session = { ...result.data.session };
        if (result.data.user && !session.user) {
          session.user = result.data.user;
        }
      } else if (result.data && !result.data.session) {
        session = { ...result.data };
      }
      
      if (!session) {
        return null;
      }

      if (session.userId) {

        const user = await this.fetchUserFromAPI();
        if (user) {
          session.user = user;
        } else if (session.user) {
          if (!(session.user as any).role) {
            (session.user as any).role = "ADMIN";
          }
        }
      }

      const finalSession: any = {
        ...session,
        session: session.id ? {
          id: session.id,
          expiresAt: session.expiresAt,
          token: session.token,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
        } : undefined,
        user: session.user || null,
        userId: session.userId || session.user?.id || null,
      };
      
      return finalSession;
    } catch (error) {
      return null;
    }
  }

  /**
   * Obtiene el usuario actual de la sesión
   * @returns Usuario actual o null si no está autenticado
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const session = await this.getSession();
      return session?.user || null;
    } catch {
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado, false en caso contrario
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return session !== null;
  }

  /**
   * Refresca la sesión actual
   * Útil cuando se actualiza información del usuario
   * @returns Nueva sesión o null si falla
   */
  static async refreshSession(): Promise<Session | null> {
    try {
      return await this.getSession();
    } catch {
      return null;
    }
  }

  /**
   * Verifica si la sesión es válida
   * @returns true si la sesión es válida, false en caso contrario
   */
  static async isValidSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      if (!session) {
        return false;
      }

      if (!session.user) {
        return false;
      }

      if (!session.session?.id) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }
}
