import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/user:
 *   get:
 *     summary: Obtiene el usuario actual autenticado
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Usuario actual
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
export async function GET(request: NextRequest) {
  try {
    let session;
    try {
      const sessionResult = await auth.api.getSession({
        headers: request.headers,
      });
      
      if (sessionResult && typeof sessionResult === "object") {
        session = (sessionResult as any).session || (sessionResult as any).data?.session || sessionResult;
      }
      
    } catch (sessionError) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Error al obtener sesión" },
        { status: 401 }
      );
    }

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "No hay sesión activa" },
        { status: 401 }
      );
    }

    if (session.user) {
      return NextResponse.json({ user: session.user });
    }

    if (!session.userId) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Sesión inválida: sin userId" },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: {
        id: session.userId,
      },
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
      return NextResponse.json(
        { error: "Not Found", message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const userResponse = {
      ...user,
    };

    return NextResponse.json({ user: userResponse });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
