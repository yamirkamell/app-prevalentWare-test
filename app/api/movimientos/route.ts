import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiGuard } from "@/features/auth/guards/apiGuard";
import { Role } from "@/lib/rbac";
import { normalizeUserForRBAC } from "@/features/auth/guards/utils";
import { Prisma } from "@prisma/client";
import {
  createMovementSchema,
  getMovementsQuerySchema,
} from "@/features/movimientos/validators/movement.validator";

/**
 * @swagger
 * /api/movimientos:
 *   get:
 *     summary: Lista los movimientos con paginación y filtros
 *     description: Obtiene una lista paginada de movimientos financieros. Los usuarios regulares solo ven sus propios movimientos, mientras que los ADMIN pueden ver todos y filtrar por userId.
 *     tags: [Movimientos]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [INCOME, EXPENSE]
 *         description: Filtrar por tipo de movimiento
 *         example: INCOME
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de usuario (solo ADMIN)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *         description: Fecha inicial del rango (formato YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *         description: Fecha final del rango (formato YYYY-MM-DD)
 *         example: "2024-12-31"
 *     responses:
 *       200:
 *         description: Lista de movimientos obtenida exitosamente
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
 *                       amount:
 *                         type: number
 *                         format: decimal
 *                         example: 1500.50
 *                       concept:
 *                         type: string
 *                         example: "Venta de producto"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-15"
 *                       type:
 *                         type: string
 *                         enum: [INCOME, EXPENSE]
 *                         example: "INCOME"
 *                       userId:
 *                         type: string
 *                         format: uuid
 *                         example: "550e8400-e29b-41d4-a716-446655440000"
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                             example: "Juan Pérez"
 *                           email:
 *                             type: string
 *                             example: "juan@example.com"
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
 *                       example: 100
 *                     totalPages:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPreviousPage:
 *                       type: boolean
 *                       example: false
 *             example:
 *               data:
 *                 - id: "550e8400-e29b-41d4-a716-446655440000"
 *                   amount: 1500.50
 *                   concept: "Venta de producto"
 *                   date: "2024-01-15"
 *                   type: "INCOME"
 *                   userId: "550e8400-e29b-41d4-a716-446655440000"
 *                   user:
 *                     id: "550e8400-e29b-41d4-a716-446655440000"
 *                     name: "Juan Pérez"
 *                     email: "juan@example.com"
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 100
 *                 totalPages: 10
 *                 hasNextPage: true
 *                 hasPreviousPage: false
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: NextRequest) {
  try {
    const guardResult = await apiGuard(request, { requireAuth: true });
    if (!guardResult.allowed || !guardResult.user) {
      return guardResult.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = guardResult.user;

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validatedQuery = getMovementsQuerySchema.safeParse(queryParams);
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

    const { page, limit, type, userId: filterUserId, startDate, endDate } = validatedQuery.data;

    const where: Prisma.MovementWhereInput = {};

    const normalizedUser = normalizeUserForRBAC(user);
    const isAdmin = normalizedUser?.roles?.includes(Role.ADMIN) ?? false;

    if (!isAdmin) {
      where.userId = user.id;
    } else {
      if (filterUserId) {
        where.userId = filterUserId;
      }
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = startDate;
      }
      if (endDate) {
        const endDateWithTime = new Date(endDate);
        endDateWithTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateWithTime;
      }
    }

    const skip = (page - 1) * limit;

    const [movements, total] = await Promise.all([
      prisma.movement.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          date: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.movement.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      data: movements,
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

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        {
          error: "Database Error",
          message: "Error al consultar la base de datos",
          code: error.code,
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

/**
 * @swagger
 * /api/movimientos:
 *   post:
 *     summary: Crea un nuevo movimiento financiero
 *     description: Crea un nuevo movimiento (ingreso o gasto). Requiere rol ADMIN. Si no se proporciona userId, se asigna al usuario ADMIN autenticado.
 *     tags: [Movimientos]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - concept
 *               - date
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0.01
 *                 maximum: 999999999999.99
 *                 description: Monto del movimiento (debe ser positivo)
 *                 example: 1500.50
 *               concept:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Concepto o descripción del movimiento
 *                 example: "Venta de producto"
 *               date:
 *                 type: string
 *                 format: date
 *                 pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *                 description: Fecha del movimiento (formato YYYY-MM-DD)
 *                 example: "2024-01-15"
 *               type:
 *                 type: string
 *                 enum: [INCOME, EXPENSE]
 *                 description: Tipo de movimiento
 *                 example: "INCOME"
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID del usuario (opcional, solo ADMIN puede especificar otro usuario)
 *                 example: "550e8400-e29b-41d4-a716-446655440000"
 *           example:
 *             amount: 1500.50
 *             concept: "Venta de producto"
 *             date: "2024-01-15"
 *             type: "INCOME"
 *             userId: "550e8400-e29b-41d4-a716-446655440000"
 *     responses:
 *       201:
 *         description: Movimiento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     amount:
 *                       type: number
 *                       format: decimal
 *                     concept:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     type:
 *                       type: string
 *                       enum: [INCOME, EXPENSE]
 *                     userId:
 *                       type: string
 *                       format: uuid
 *                     user:
 *                       type: object
 *                 message:
 *                   type: string
 *             example:
 *               data:
 *                 id: "550e8400-e29b-41d4-a716-446655440000"
 *                 amount: 1500.50
 *                 concept: "Venta de producto"
 *                 date: "2024-01-15"
 *                 type: "INCOME"
 *                 userId: "550e8400-e29b-41d4-a716-446655440000"
 *                 user:
 *                   id: "550e8400-e29b-41d4-a716-446655440000"
 *                   name: "Juan Pérez"
 *                   email: "juan@example.com"
 *               message: "Movimiento creado exitosamente"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       409:
 *         description: Conflicto - Ya existe un movimiento con estos datos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Validation Error"
 *               message: "Ya existe un movimiento con estos datos"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function POST(request: NextRequest) {
  try {

    const guardResult = await apiGuard(request, { requireAuth: true });
    if (!guardResult.allowed || !guardResult.user) {
      return guardResult.response || NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authenticatedUser = guardResult.user;
    
    const normalizedUser = normalizeUserForRBAC(authenticatedUser);
    const isAdmin = normalizedUser?.roles?.includes(Role.ADMIN) ?? false;

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "El cuerpo de la petición debe ser un JSON válido",
        },
        { status: 400 }
      );
    }

    const validationResult = createMovementSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Datos inválidos",
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }


    const { amount, concept, date, type, userId } = validationResult.data;

    let targetUserId: string;
    
    if (userId) {
      if (!isAdmin && userId !== authenticatedUser.id) {
        return NextResponse.json(
          {
            error: "Forbidden",
            message: "No tienes permisos para crear movimientos para otros usuarios",
          },
          { status: 403 }
        );
      }
      
      const targetUser = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!targetUser) {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: `Usuario con ID ${userId} no encontrado`,
          },
          { status: 404 }
        );
      }
      
      targetUserId = userId;
    } else {
      targetUserId = authenticatedUser.id;
    }

    const movement = await prisma.movement.create({
      data: {
        amount,
        concept,
        date,
        type,
        userId: targetUserId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        data: movement,
        message: "Movimiento creado exitosamente",
      },
      { status: 201 }
    );
  } catch (error) {

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "El usuario especificado no existe",
          },
          { status: 400 }
        );
      }

      if (error.code === "P2002") {
        return NextResponse.json(
          {
            error: "Validation Error",
            message: "Ya existe un movimiento con estos datos",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: "Database Error",
          message: "Error al crear el movimiento",
          code: error.code,
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
