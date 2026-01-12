import { createAuthClient } from "better-auth/react";
import type { User } from "@/lib/auth";

const getBaseURL = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export class AuthService {
  /**
   * Inicia sesión con email y password
   * @param credentials Credenciales de login
   * @returns Usuario autenticado o error
   */
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const result = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      });

      if (result.error) {
        return {
          user: null,
          error: result.error.message || "Error al iniciar sesión",
        };
      }

      return {
        user: result.data?.user || null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Error desconocido al iniciar sesión",
      };
    }
  }

  /**
   * Registra un nuevo usuario
   * @param data Datos de registro
   * @returns Usuario creado o error
   */
  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const result = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        name: data.name,
      });

      if (result.error) {
        return {
          user: null,
          error: result.error.message || "Error al registrar usuario",
        };
      }

      return {
        user: result.data?.user || null,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Error desconocido al registrar usuario",
      };
    }
  }

  /**
   * Cierra la sesión del usuario actual
   * @returns true si se cerró correctamente, false en caso contrario
   */
  static async logout(): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await authClient.signOut();

      if (result.error) {
        return {
          success: false,
          error: result.error.message || "Error al cerrar sesión",
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al cerrar sesión",
      };
    }
  }

  /**
   * Solicita un reset de contraseña
   * @param email Email del usuario
   * @returns true si se envió el email, false en caso contrario
   */
  static async forgotPassword(email: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await (authClient as any).forgetPassword?.({
        email,
      }) || await (authClient as any).forgotPassword?.({
        email,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error.message || "Error al solicitar reset de contraseña",
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Resetea la contraseña con un token
   * @param token Token de reset
   * @param newPassword Nueva contraseña
   * @returns true si se reseteó correctamente, false en caso contrario
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await authClient.resetPassword({
        token,
        newPassword,
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || "Error al resetear contraseña",
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      };
    }
  }

  /**
   * Actualiza el perfil del usuario
   * @param data Datos a actualizar
   * @returns Usuario actualizado o error
   */
  static async updateProfile(data: Partial<Pick<User, "name" | "email">>): Promise<AuthResponse> {
    try {
      const updateData: { name?: string; image?: string | null } = {};
      if (data.name) {
        updateData.name = data.name;
      }

      const result = await authClient.updateUser(updateData);

      if (result.error) {
        return {
          user: null,
          error: result.error.message || "Error al actualizar perfil",
        };
      }

      const sessionResult = await authClient.getSession();
      const user = (sessionResult.data?.session as any)?.user || (sessionResult.data as any)?.user || null;
      return {
        user,
        error: null,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Error desconocido al actualizar perfil",
      };
    }
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * @param currentPassword Contraseña actual
   * @param newPassword Nueva contraseña
   * @returns true si se cambió correctamente, false en caso contrario
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      });

      if (result.error) {
        return {
          success: false,
          error: result.error.message || "Error al cambiar contraseña",
        };
      }

      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido al cambiar contraseña",
      };
    }
  }

  /**
   * Inicia sesión con GitHub OAuth
   * Redirige al usuario a la página de autorización de GitHub
   * @returns URL de autorización o error
   */
  static async loginWithGitHub(): Promise<{ url: string | null; error: string | null }> {
    try {

      const result = await authClient.signIn.social({
        provider: "github",
      });


      if (result.error) {
        return {
          url: null,
          error: result.error.message || "Error al iniciar sesión con GitHub",
        };
      }

      if (result.data?.url) {
        window.location.href = result.data.url;
        return {
          url: result.data.url,
          error: null,
        };
      }

      return {
        url: null,
        error: "No se recibió URL de autorización de GitHub",
      };
    } catch (error) {
      return {
        url: null,
        error: error instanceof Error ? error.message : "Error desconocido al iniciar sesión con GitHub",
      };
    }
  }
}
