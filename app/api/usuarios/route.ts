import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard } from "@/features/auth/guards/apiGuard";
import { Role } from "@/lib/rbac";
import { getUsersQuerySchema } from "@/features/usuarios/validators/user.validator";

// Inferir tipos desde Prisma v7 (no se importan directamente)
type UserWhereInput = NonNullable<Parameters<typeof prisma.user.findMany>[0]>["where"];

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Lista los usuarios con paginación y filtros
 *     description: Obtiene una lista paginada de usuarios del sistema. Requiere rol ADMIN.
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *         example: 10
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, USER]
 *         description: Filtrar por rol
 *         example: ADMIN
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre o email (case-insensitive)
 *         example: "juan"
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       name:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       email:
 *                         type: string
 *                         format: email
 *                         example: "juan@example.com"
 *                       emailVerified:
 *                         type: boolean
 *                         example: true
 *                       image:
 *                         type: string
 *                         nullable: true
 *                         example: "https://example.com/avatar.jpg"
 *                       role:
 *                         type: string
 *                         enum: [ADMIN, USER]
 *                         example: "ADMIN"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-01T00:00:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-02T00:00:00Z"
 *                       _count:
 *                         type: object
 *                         properties:
 *                           movements:
 *                             type: integer
 *                             example: 10
 *                           sessions:
 *                             type: integer
 *                             example: 2
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *             example:
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Juan Pérez"
 *                   email: "juan@example.com"
 *                   emailVerified: true
 *                   image: null
 *                   role: "ADMIN"
 *                   createdAt: "2024-01-01T00:00:00Z"
 *                   updatedAt: "2024-01-02T00:00:00Z"
 *                   _count:
 *                     movements: 10
 *                     sessions: 2
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 totalPages: 5
 *                 hasNextPage: true
 *                 hasPreviousPage: false
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const guardResult = await apiGuard(request, { role: Role.ADMIN });
    if (!guardResult.allowed || !guardResult.user) {
      return guardResult.response || NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getUsersQuerySchema.safeParse(queryParams);
    if (!validatedQuery.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Parámetros de consulta inválidos",
          details: validatedQuery.error.issues,
        },
        { status: 400 }
      );
    }

    const { page, limit, role, search } = validatedQuery.data;

    const where: UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          phone: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              movements: true,
              sessions: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      typeof error.code === "string" &&
      error.code.startsWith("P")
    ) {
      const prismaError = error as { code: string; message?: string };
      return NextResponse.json(
        {
          error: "Database Error",
          message: "Error al consultar la base de datos",
          code: prismaError.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

