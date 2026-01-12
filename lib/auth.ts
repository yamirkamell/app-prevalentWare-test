import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { headers } from "next/headers";

const githubClientId = process.env.GITHUB_CLIENT_ID;
const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const authConfig: Parameters<typeof betterAuth>[0] = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
  baseURL,
  hooks: {
    user: {
      created: {
        after: async ({ user }) => {
          try {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" },
            });

          } catch (error) {
            console.error("[Better Auth] Error al asignar rol ADMIN:", error);
          }
        },
      },
    },
  },
};

if (githubClientId && githubClientSecret) {
  authConfig.socialProviders = {
    github: {
      clientId: githubClientId,
      clientSecret: githubClientSecret,
      redirectURI: `${baseURL}/api/auth/callback/github`,
    },
  };
  
} else {
 
}

export const auth = betterAuth(authConfig);

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user & {
  role?: "ADMIN" | "USER";
};

/**
 * Helper para obtener la sesión actual en Server Components/Actions
 * Usa la API de Better Auth para obtener la sesión desde los headers
 * @returns Sesión del usuario actual o null si no está autenticado
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    const headersList = await headers();
    const cookie = headersList.get("cookie") || "";
    
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie,
      },
    });
    
    let session: any = sessionResult;
    
    if (sessionResult && typeof sessionResult === "object") {
      session = (sessionResult as any).session || (sessionResult as any).data?.session || sessionResult;
    }
    
    if (!session || !session.userId) {
      return null;
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    
    if (!user) {
      return null;
    }
    
    return {
      ...session,
      user: user as any,
      userId: user.id,
    } as Session;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getServerSession] Error:", error);
    }
    return null;
  }
}

/**
 * Helper para obtener el usuario actual en Server Components/Actions
 * @returns Usuario actual o null si no está autenticado
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getServerSession();
  return session?.user ?? null;
}

/**
 * Helper para verificar si el usuario está autenticado
 * @returns true si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession();
  return session !== null;
}

/**
 * Helper para requerir autenticación
 * @throws Error si el usuario no está autenticado
 * @returns Sesión del usuario
 */
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();
  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session;
}

/**
 * Helper para requerir un usuario autenticado
 * @throws Error si el usuario no está autenticado
 * @returns Usuario autenticado
 */
export async function requireUser(): Promise<User> {
  const session = await requireAuth();
  if (!session.user) {
    throw new Error("Unauthorized: User not found in session");
  }
  return session.user;
}
